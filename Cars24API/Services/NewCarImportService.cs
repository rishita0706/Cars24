using System.Globalization;
using System.Text.Json;
using Cars24API.Models;
using CsvHelper;
using CsvHelper.Configuration;
using ClosedXML.Excel;

namespace Cars24API.Services
{
    public class NewCarImportService
    {
        private static readonly string[] RequiredFields = { "Brand", "Model", "Price" };

        public async Task<List<NewCarImportRowResult>> ParseAsync(Stream fileStream, string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();

            var rawRows = extension switch
            {
                ".csv" => await ParseCsvAsync(fileStream),
                ".json" => await ParseJsonAsync(fileStream),
                ".xlsx" or ".xls" => ParseExcel(fileStream),
                _ => throw new Middleware.ApiException(
                        $"Unsupported file type '{extension}'. Please upload a .csv, .json, .xlsx, or .xls file.",
                        System.Net.HttpStatusCode.UnprocessableEntity)
            };

            var results = new List<NewCarImportRowResult>();
            var rowNumber = 0;
            foreach (var raw in rawRows)
            {
                rowNumber++;
                results.Add(ValidateRow(rowNumber, raw));
            }
            return results;
        }

        private static NewCarImportRowResult ValidateRow(int rowNumber, Dictionary<string, string> raw)
        {
            string Get(params string[] keys)
            {
                foreach (var key in keys)
                {
                    var match = raw.FirstOrDefault(kv =>
                        string.Equals(kv.Key.Trim(), key, StringComparison.OrdinalIgnoreCase));
                    if (!string.IsNullOrWhiteSpace(match.Value)) return match.Value.Trim();
                }
                return string.Empty;
            }

            var brand = Get("Brand", "Make");
            var model = Get("Model");
            var priceRaw = Get("Price", "Price (INR)", "PriceINR");

            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(brand)) missing.Add("Brand");
            if (string.IsNullOrWhiteSpace(model)) missing.Add("Model");
            if (string.IsNullOrWhiteSpace(priceRaw)) missing.Add("Price");

            if (missing.Count > 0)
            {
                return new NewCarImportRowResult
                {
                    RowNumber = rowNumber,
                    Success = false,
                    Error = $"Missing required field(s): {string.Join(", ", missing)}"
                };
            }

            var cleanedPrice = new string(priceRaw.Where(c => char.IsDigit(c) || c == '.').ToArray());
            if (!decimal.TryParse(cleanedPrice, NumberStyles.Any, CultureInfo.InvariantCulture, out var price) || price <= 0)
            {
                return new NewCarImportRowResult
                {
                    RowNumber = rowNumber,
                    Success = false,
                    Error = $"Invalid Price value '{priceRaw}' - expected a positive number."
                };
            }

            var imagesRaw = Get("Images", "Image");
            var featuresRaw = Get("Features", "Feature");

            var car = new NewCar
            {
                Brand = brand,
                Model = model,
                Variant = Get("Variant", "Trim"),
                Price = price,
                Mileage = Get("Mileage", "Mileage (kmpl)"),
                Transmission = Get("Transmission"),
                Fuel = Get("Fuel", "FuelType"),
                Engine = Get("Engine", "Engine (cc)"),
                Power = Get("Power", "Power (bhp)"),
                Images = SplitList(imagesRaw),
                Features = SplitList(featuresRaw),
            };

            return new NewCarImportRowResult { RowNumber = rowNumber, Success = true, Car = car };
        }

        private static List<string> SplitList(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return new List<string>();
            return raw
                .Split(new[] { '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => s.Length > 0)
                .ToList();
        }

        private static async Task<List<Dictionary<string, string>>> ParseCsvAsync(Stream fileStream)
        {
            using var reader = new StreamReader(fileStream);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null,
                MissingFieldFound = null,
            });

            var rows = new List<Dictionary<string, string>>();
            if (!await csv.ReadAsync()) return rows;
            csv.ReadHeader();
            var headers = csv.HeaderRecord ?? Array.Empty<string>();

            while (await csv.ReadAsync())
            {
                var row = new Dictionary<string, string>();
                foreach (var header in headers)
                {
                    row[header] = csv.GetField(header) ?? string.Empty;
                }
                rows.Add(row);
            }
            return rows;
        }

        private static async Task<List<Dictionary<string, string>>> ParseJsonAsync(Stream fileStream)
        {
            using var doc = await JsonDocument.ParseAsync(fileStream);
            var root = doc.RootElement;
            var array = root.ValueKind == JsonValueKind.Array
                ? root
                : throw new Middleware.ApiException(
                    "JSON dataset must be an array of car objects, e.g. [{ \"Brand\": \"...\", ... }].",
                    System.Net.HttpStatusCode.UnprocessableEntity);

            var rows = new List<Dictionary<string, string>>();
            foreach (var element in array.EnumerateArray())
            {
                var row = new Dictionary<string, string>();
                foreach (var prop in element.EnumerateObject())
                {
                    row[prop.Name] = prop.Value.ValueKind switch
                    {
                        JsonValueKind.Array => string.Join("|", prop.Value.EnumerateArray().Select(v => v.ToString())),
                        JsonValueKind.String => prop.Value.GetString() ?? string.Empty,
                        JsonValueKind.Null => string.Empty,
                        _ => prop.Value.ToString()
                    };
                }
                rows.Add(row);
            }
            return rows;
        }

        private static List<Dictionary<string, string>> ParseExcel(Stream fileStream)
        {
            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheets.First();
            var usedRange = worksheet.RangeUsed();
            if (usedRange == null) return new List<Dictionary<string, string>>();

            var rowsUsed = usedRange.RowsUsed().ToList();
            if (rowsUsed.Count == 0) return new List<Dictionary<string, string>>();

            var headerRow = rowsUsed[0];
            var headers = headerRow.Cells().Select(c => c.GetString().Trim()).ToList();

            var rows = new List<Dictionary<string, string>>();
            foreach (var dataRow in rowsUsed.Skip(1))
            {
                var row = new Dictionary<string, string>();
                for (var i = 0; i < headers.Count; i++)
                {
                    var cell = dataRow.Cell(i + 1);
                    row[headers[i]] = cell.GetString().Trim();
                }
                rows.Add(row);
            }
            return rows;
        }
    }
}
