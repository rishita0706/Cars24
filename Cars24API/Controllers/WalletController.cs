using Microsoft.AspNetCore.Mvc;
using Cars24API.Services;

namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly WalletService _walletService;

        public WalletController(UserService userService, WalletService walletService)
        {
            _userService = userService;
            _walletService = walletService;
        }

        // GET /api/Wallet/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetWallet(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var history = await _walletService.GetHistoryAsync(userId);

            return Ok(new
            {
                balance = user.WalletBalance,
                referralCode = user.ReferralCode,
                transactions = history
            });
        }

        public class RedeemRequest
        {
            public int Points { get; set; }
        }

        // POST /api/Wallet/{userId}/redeem
        [HttpPost("{userId}/redeem")]
        public async Task<IActionResult> Redeem(string userId, [FromBody] RedeemRequest request)
        {
            var (success, error, newBalance) = await _walletService.RedeemAsync(userId, request.Points);
            if (!success) return BadRequest(new { message = error });

            return Ok(new { message = "Redeemed successfully.", balance = newBalance });
        }
    }
}