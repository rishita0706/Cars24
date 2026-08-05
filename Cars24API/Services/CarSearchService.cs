using System.Text.RegularExpressions;
using Cars24API.Models;
using Cars24API.Utils;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class CarSuggestion
    {
        public string Text { get; set; } = string.Empty;

        // "Title" | "Feature" | "Highlight"
        public string Type { get; set; } = string.Empty;
    }

    public class CarSearchService
    {
        private readonly MongoContext _context;

        private const int SuggestionExact = 100;
        private const int SuggestionStartsWith = 80;
        private const int SuggestionContains = 60;
        private const int SuggestionFuzzyCap = 40;

        private const int TitleExactMatch = 100;
        private const int TitleStartsWith = 80;
        private const int TitleContains = 60;
        private const int FuzzyTitleCap = 45;
        private const int FeatureMatch = 40;
        private const int HighlightMatch = 35;
        private const int FilterMatchPerField = 5;
        private const int RecencyCap = 15;
        private const int PopularityCap = 20;

        public CarSearchService(MongoContext context)
        {
            _context = context;
        }

        public async Task<List<CarSuggestion>> GetSuggestionsAsync(string? q, int limit = 8)
        {
            if (string.IsNullOrWhiteSpace(q))
                return new List<CarSuggestion>();

            var query = q.Trim().ToLowerInvariant();

            var cars = await _context.Cars
                .Find(_ => true)
                .Project(c => new
                {
                    c.Title,
                    c.Features,
                    c.Highlights,
                    c.Specs,
                    c.Location
                })
                .ToListAsync();

            var best = new Dictionary<(string Text, string Type), int>();

            void Consider(string? text, string type)
            {
                if (string.IsNullOrWhiteSpace(text))
                    return;

                var score = ScoreSuggestionCandidate(query, text.ToLowerInvariant());

                if (score <= 0)
                    return;

                var key = (text.Trim(), type);

                if (!best.TryGetValue(key, out var existing) || score > existing)
                    best[key] = score;
            }

            foreach (var car in cars)
            {
                Consider(car.Title, "Title");

                if (car.Features != null)
                    foreach (var feature in car.Features)
                        Consider(feature, "Feature");

                if (car.Highlights != null)
                    foreach (var highlight in car.Highlights)
                        Consider(highlight, "Highlight");

                Consider(car.Specs?.Fuel, "Fuel");
                Consider(car.Specs?.Transmission, "Transmission");
                Consider(car.Location, "Location");
            }

            return best
                .OrderByDescending(kv => kv.Value)
                .ThenBy(kv => kv.Key.Text, StringComparer.OrdinalIgnoreCase)
                .Take(limit)
                .Select(kv => new CarSuggestion
                {
                    Text = kv.Key.Text,
                    Type = kv.Key.Type
                })
                .ToList();
}

        private static int ScoreSuggestionCandidate(string query, string candidateLower)
        {
            if (candidateLower == query) return SuggestionExact;
            if (candidateLower.StartsWith(query, StringComparison.Ordinal)) return SuggestionStartsWith;
            if (candidateLower.Contains(query, StringComparison.Ordinal)) return SuggestionContains;

            // Predictive typing / typo tolerance: compare the query against each
            // word in the candidate (so "Cretaa" still suggests "Hyundai Creta").
            var tokens = candidateLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var best = 0;
            foreach (var token in tokens)
            {
                var fuzzy = FuzzyScore(query, token, SuggestionFuzzyCap);
                if (fuzzy > best) best = fuzzy;
            }
            return best;
        }

        public async Task<SearchResponse> SearchAsync(SearchRequest request)
        {
            var mongoFilter = BuildMongoFilter(request);
            var cars = await _context.Cars.Find(mongoFilter).ToListAsync();

            cars = ApplyStringRangeFilters(cars, request);

            var hasQuery = !string.IsNullOrWhiteSpace(request.Query);
            var scored = new List<SearchResult>();

            foreach (var car in cars)
            {
                var (score, matchedQuery) = ComputeScore(car, request, hasQuery);

                if (hasQuery && !matchedQuery) continue;

                scored.Add(new SearchResult { Car = car, Score = score });
            }

            var sorted = ApplySort(scored, request.SortBy);

            var totalResults = sorted.Count;
            var pageSize = request.PageSize <= 0 ? 10 : Math.Min(request.PageSize, 50);
            var totalPages = totalResults == 0 ? 0 : (int)Math.Ceiling(totalResults / (double)pageSize);
            var page = request.Page <= 0 ? 1 : request.Page;
            if (totalPages > 0 && page > totalPages) page = totalPages;

            var pageResults = sorted
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new SearchResponse
            {
                TotalResults = totalResults,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                Results = pageResults
            };
        }

        private static List<SearchResult> ApplySort(List<SearchResult> results, string? sortBy)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "price_asc" => results.OrderBy(r => CarInsights.ParsePrice(r.Car.Price) ?? double.MaxValue).ToList(),
                "price_desc" => results.OrderByDescending(r => CarInsights.ParsePrice(r.Car.Price) ?? double.MinValue).ToList(),
                "year_asc" => results.OrderBy(r => r.Car.Specs.Year).ToList(),
                "year_desc" => results.OrderByDescending(r => r.Car.Specs.Year).ToList(),
                "km_asc" => results.OrderBy(r => CarInsights.ParseNumeric(r.Car.Specs.Km) ?? double.MaxValue).ToList(),
                "recent" => results.OrderByDescending(r => GetCreatedAt(r.Car.Id)).ToList(),
                // "relevance" (default) and anything unrecognized fall back to Score.
                _ => results.OrderByDescending(r => r.Score).ToList(),
            };
        }

        private (int Score, bool MatchedQuery) ComputeScore(Car car, SearchRequest request, bool hasQuery)
        {
            var score = 0;
            var matchedQuery = !hasQuery; // no keyword => every filtered car already "matches"

            if (hasQuery)
            {
                var queryLower = request.Query!.Trim().ToLowerInvariant();
                var titleLower = car.Title?.ToLowerInvariant() ?? string.Empty;

                if (titleLower == queryLower)
                {
                    score += TitleExactMatch;
                    matchedQuery = true;
                }
                else if (titleLower.StartsWith(queryLower, StringComparison.Ordinal))
                {
                    score += TitleStartsWith;
                    matchedQuery = true;
                }
                else if (titleLower.Contains(queryLower, StringComparison.Ordinal))
                {
                    score += TitleContains;
                    matchedQuery = true;
                }
                else
                {
                    var titleTokens = titleLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    var queryTokens = queryLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);

                    var bestFuzzy = 0;
                    foreach (var qt in queryTokens)
                        foreach (var tt in titleTokens)
                        {
                            var fuzzy = FuzzyScore(qt, tt, FuzzyTitleCap);
                            if (fuzzy > bestFuzzy) bestFuzzy = fuzzy;
                        }

                    if (bestFuzzy > 0)
                    {
                        score += bestFuzzy;
                        matchedQuery = true;
                    }
                }

                if (car.Features != null && car.Features.Any(f =>
                        !string.IsNullOrWhiteSpace(f) && f.ToLowerInvariant().Contains(queryLower, StringComparison.Ordinal)))
                {
                    score += FeatureMatch;
                    matchedQuery = true;
                }

                if (car.Highlights != null && car.Highlights.Any(h =>
                        !string.IsNullOrWhiteSpace(h) && h.ToLowerInvariant().Contains(queryLower, StringComparison.Ordinal)))
                {
                    score += HighlightMatch;
                    matchedQuery = true;
                }
            }

            score += CountProvidedFilters(request) * FilterMatchPerField;

            var ageDays = (DateTime.UtcNow - GetCreatedAt(car.Id)).TotalDays;
            var recencyScore = (int)Math.Max(0, RecencyCap - (ageDays / 30.0));
            score += recencyScore;

            score += Math.Min(PopularityCap, car.ViewCount / 5);

            return (score, matchedQuery);
        }

        private static List<string> EffectiveFuels(SearchRequest request)
        {
            var values = new List<string>();
            if (!string.IsNullOrWhiteSpace(request.Fuel)) values.Add(request.Fuel.Trim());
            if (request.Fuels != null) values.AddRange(request.Fuels.Where(f => !string.IsNullOrWhiteSpace(f)));
            return values.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }

        private static List<string> EffectiveTransmissions(SearchRequest request)
        {
            var values = new List<string>();
            if (!string.IsNullOrWhiteSpace(request.Transmission)) values.Add(request.Transmission.Trim());
            if (request.Transmissions != null) values.AddRange(request.Transmissions.Where(t => !string.IsNullOrWhiteSpace(t)));
            return values.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }

        private static int CountProvidedFilters(SearchRequest request)
        {
            var count = 0;
            if (EffectiveFuels(request).Count > 0) count++;
            if (EffectiveTransmissions(request).Count > 0) count++;
            if (!string.IsNullOrWhiteSpace(request.Owner)) count++;
            if (!string.IsNullOrWhiteSpace(request.Location)) count++;
            if (request.Year.HasValue) count++;
            if (request.MinYear.HasValue) count++;
            if (request.MaxYear.HasValue) count++;
            if (request.MinMileage.HasValue) count++;
            if (request.MaxMileage.HasValue) count++;
            if (request.MinPrice.HasValue) count++;
            if (request.MaxPrice.HasValue) count++;
            if (request.Features is { Count: > 0 }) count++;
            if (request.Highlights is { Count: > 0 }) count++;
            return count;
        }

        private static FilterDefinition<Car> BuildMongoFilter(SearchRequest request)
        {
            var builder = Builders<Car>.Filter;
            var filter = builder.Empty;

            var fuels = EffectiveFuels(request);
            if (fuels.Count > 0)
            {
                var fuelOr = builder.Or(fuels.Select(f =>
                {
                    var escaped = Regex.Escape(f);
                    return builder.Regex(c => c.Specs.Fuel, new BsonRegularExpression($"^{escaped}$", "i"));
                }));
                filter &= fuelOr;
            }

            var transmissions = EffectiveTransmissions(request);
            if (transmissions.Count > 0)
            {
                var transmissionOr = builder.Or(transmissions.Select(t =>
                {
                    var escaped = Regex.Escape(t);
                    return builder.Regex(c => c.Specs.Transmission, new BsonRegularExpression($"^{escaped}$", "i"));
                }));
                filter &= transmissionOr;
            }

            if (!string.IsNullOrWhiteSpace(request.Owner))
            {
                var escaped = Regex.Escape(request.Owner.Trim());
                filter &= builder.Regex(c => c.Specs.Owner, new BsonRegularExpression($"^{escaped}$", "i"));
            }

            if (!string.IsNullOrWhiteSpace(request.Location))
            {
                // Contains, not exact - locations tend to be free text ("Delhi, India").
                var escaped = Regex.Escape(request.Location.Trim());
                filter &= builder.Regex(c => c.Location, new BsonRegularExpression(escaped, "i"));
            }

            if (request.Year.HasValue)
                filter &= builder.Eq(c => c.Specs.Year, request.Year.Value);

            if (request.MinYear.HasValue)
                filter &= builder.Gte(c => c.Specs.Year, request.MinYear.Value);

            if (request.MaxYear.HasValue)
                filter &= builder.Lte(c => c.Specs.Year, request.MaxYear.Value);

            if (request.Features is { Count: > 0 })
                filter &= builder.All(c => c.Features, request.Features);

            if (request.Highlights is { Count: > 0 })
                filter &= builder.All(c => c.Highlights, request.Highlights);

            return filter;
        }

        private static List<Car> ApplyStringRangeFilters(List<Car> cars, SearchRequest request)
        {
            bool filterPrice =
                request.MinPrice.HasValue || request.MaxPrice.HasValue;

            bool filterMileage =
                request.MinMileage.HasValue || request.MaxMileage.HasValue;

            if (!filterPrice && !filterMileage)
                return cars;

            var filtered = new List<Car>(cars.Count);

            foreach (var car in cars)
            {
                if (filterPrice)
                {
                    var price = CarInsights.ParsePrice(car.Price);

                    if (!price.HasValue)
                        continue;

                    if (request.MinPrice.HasValue && price.Value < (double)request.MinPrice.Value)
                        continue;

                    if (request.MaxPrice.HasValue && price.Value > (double)request.MaxPrice.Value)
                        continue;
                }

                if (filterMileage)
                {
                    var km = CarInsights.ParseNumeric(car.Specs?.Km);

                    if (!km.HasValue)
                        continue;

                    if (request.MinMileage.HasValue && km.Value < request.MinMileage.Value)
                        continue;

                    if (request.MaxMileage.HasValue && km.Value > request.MaxMileage.Value)
                        continue;
                }

                filtered.Add(car);
            }

            return filtered;
        }

        private static DateTime GetCreatedAt(string? id)
        {
            if (string.IsNullOrEmpty(id) || !ObjectId.TryParse(id, out var objectId))
                return DateTime.MinValue;
            return objectId.CreationTime;
        }

        private static int FuzzyScore(string query, string candidate, int cap)
        {
            if (query.Length < 3 || candidate.Length < 3) return 0;

            var distance = LevenshteinDistance(query, candidate);
            var maxAllowed = candidate.Length <= 4 ? 1 : candidate.Length <= 7 ? 2 : 3;

            if (distance == 0 || distance > maxAllowed) return 0;

            var score = cap - (distance * (cap / (maxAllowed + 1)));
            return Math.Max(0, score);
        }

        private static int LevenshteinDistance(string a, string b)
        {
            var lenA = a.Length;
            var lenB = b.Length;
            var dp = new int[lenA + 1, lenB + 1];

            for (var i = 0; i <= lenA; i++) dp[i, 0] = i;
            for (var j = 0; j <= lenB; j++) dp[0, j] = j;

            for (var i = 1; i <= lenA; i++)
            {
                for (var j = 1; j <= lenB; j++)
                {
                    var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                    dp[i, j] = Math.Min(
                        Math.Min(dp[i - 1, j] + 1, dp[i, j - 1] + 1),
                        dp[i - 1, j - 1] + cost);
                }
            }

            return dp[lenA, lenB];
        }
    }
}