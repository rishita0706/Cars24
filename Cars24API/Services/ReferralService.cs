using Cars24API.Models;

namespace Cars24API.Services
{
    public class ReferralService
    {
        private readonly UserService _userService;
        private readonly WalletService _walletService;

        private const int ReferrerRewardPoints = 500;
        private const int ReferredRewardPoints = 250;

        public ReferralService(UserService userService, WalletService walletService)
        {
            _userService = userService;
            _walletService = walletService;
        }

        public async Task<string> GenerateUniqueCodeAsync()
        {
            for (var attempt = 0; attempt < 5; attempt++)
            {
                var candidate = GenerateCode();
                var existing = await _userService.GetByReferralCodeAsync(candidate);
                if (existing == null) return candidate;
            }
            // Astronomically unlikely to still collide with a longer code,
            // but fall back rather than looping forever.
            return GenerateCode(10);
        }

        private static string GenerateCode(int length = 6)
        {
            const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = Random.Shared;
            return new string(Enumerable.Range(0, length)
                .Select(_ => alphabet[random.Next(alphabet.Length)])
                .ToArray());
        }

        public async Task<bool> TryGrantRewardAsync(User referredUser)
        {
            if (referredUser.ReferralRewardGranted) return false;
            if (string.IsNullOrEmpty(referredUser.ReferredByUserId)) return false;
            if (referredUser.ReferredByUserId == referredUser.Id) return false; // defensive - shouldn't be reachable

            var referrer = await _userService.GetByIdAsync(referredUser.ReferredByUserId);
            if (referrer == null || referrer.Id == null || referredUser.Id == null)
                return false; // referrer account no longer exists - nothing to credit

            await _walletService.CreditAsync(
                referrer.Id, ReferrerRewardPoints,
                $"Referral bonus - {referredUser.FullName} completed their first purchase/sale.");

            await _walletService.CreditAsync(
                referredUser.Id, ReferredRewardPoints,
                "Welcome bonus for signing up with a referral code.");

            await _userService.SetReferralRewardGrantedAsync(referredUser.Id);

            return true;
        }
    }
}
