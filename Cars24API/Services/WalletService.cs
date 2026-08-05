using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class WalletService
    {
        private readonly IMongoCollection<WalletTransaction> _transactions;
        private readonly UserService _userService;

        private const int MinRedemption = 100;
        private const int RedemptionBlockSize = 100;

        public WalletService(MongoContext context, UserService userService)
        {
            _transactions = context.WalletTransactions;
            _userService = userService;
        }

        public async Task CreditAsync(string userId, int points, string reason)
        {
            if (points <= 0) throw new ArgumentOutOfRangeException(nameof(points), "Credit amount must be positive.");

            await _userService.IncrementWalletBalanceAsync(userId, points);
            await _transactions.InsertOneAsync(new WalletTransaction
            {
                UserId = userId,
                Type = "Earned",
                Points = points,
                Reason = reason,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task<(bool Success, string? Error, int NewBalance)> RedeemAsync(string userId, int points)
        {
            if (points < MinRedemption)
                return (false, $"Minimum redemption is {MinRedemption} points.", 0);

            if (points % RedemptionBlockSize != 0)
                return (false, $"Points must be redeemed in blocks of {RedemptionBlockSize}.", 0);

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return (false, "User not found.", 0);

            if (user.WalletBalance < points)
                return (false, "Insufficient balance.", user.WalletBalance);

            var discountValue = points; 

            await _userService.IncrementWalletBalanceAsync(userId, -points);
            await _transactions.InsertOneAsync(new WalletTransaction
            {
                UserId = userId,
                Type = "Redeemed",
                Points = -points,
                Reason = $"Redeemed for Rs.{discountValue} platform credit.",
                CreatedAt = DateTime.UtcNow
            });

            var updated = await _userService.GetByIdAsync(userId);
            return (true, null, updated?.WalletBalance ?? 0);
        }

        public async Task<List<WalletTransaction>> GetHistoryAsync(string userId)
        {
            return await _transactions
                .Find(t => t.UserId == userId)
                .SortByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
    }
}
