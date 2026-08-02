using Cars24API.Models;

namespace Cars24API.Services
{
    // Referral code generation + the "both sides get rewarded once the
    // referred user completes a real purchase or sale" logic.
    //
    // Deliberately does NOT reward on signup alone - that's the main
    // anti-abuse guardrail the original feature spec asked for ("clear rules
    // and validations to prevent misuse"): a bot/farm signing up empty
    // accounts with someone else's code earns nothing until an account
    // behind it actually books a car or lists one for sale. A referral code
    // can also only be applied at signup time (see UserAuthController.Signup) -
    // there's no "apply code to my existing account" endpoint, which closes
    // off retroactively gaming an already-active account.
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
            // No 0/O/1/I - avoids codes that are ambiguous when read aloud or
            // typed in by hand, which is the whole point of a referral code.
            const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = Random.Shared;
            return new string(Enumerable.Range(0, length)
                .Select(_ => alphabet[random.Next(alphabet.Length)])
                .ToArray());
        }

        // Called after a booking or a car listing is successfully created.
        // Safe to call unconditionally every time - only actually grants once
        // per referred user (guarded by ReferralRewardGranted).
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

            // Targeted field update, not a full User replace - the wallet
            // credits above already changed WalletBalance in the database out
            // from under this in-memory referredUser object, and a full
            // replace here would silently overwrite that back to its stale
            // pre-credit value.
            await _userService.SetReferralRewardGrantedAsync(referredUser.Id);

            return true;
        }
    }
}
