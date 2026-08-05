using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;
using Cars24API.Middleware;
using BCrypt.Net;
using System.Net;
using System.Security.Cryptography;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly ReferralService _referralService;
    public UserAuthController(UserService userService, ReferralService referralService)
    {
        _userService = userService;
        _referralService = referralService;
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        return Ok(user);
    }

    public class FcmTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }

    [HttpPost("{id}/fcm-token")]
    public async Task<IActionResult> RegisterFcmToken(string id, [FromBody] FcmTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Token))
            return BadRequest(new { message = "Token is required." });

        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        user.FcmTokens ??= new List<string>();
        if (!user.FcmTokens.Contains(request.Token))
        {
            user.FcmTokens.Add(request.Token);
            await _userService.UpdateAsync(user.Id, user);
        }

        return Ok(new { message = "Token registered." });
    }

    [HttpDelete("{id}/fcm-token")]
    public async Task<IActionResult> UnregisterFcmToken(string id, [FromQuery] string token)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        user.FcmTokens ??= new List<string>();
        if (user.FcmTokens.Remove(token))
        {
            await _userService.UpdateAsync(user.Id, user);
        }

        return NoContent();
    }

    [HttpGet("{id}/notification-preferences")]
    public async Task<IActionResult> GetNotificationPreferences(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        return Ok(user.NotificationPreferences ?? new NotificationPreferences());
    }

    [HttpPut("{id}/notification-preferences")]
    public async Task<IActionResult> UpdateNotificationPreferences(string id, [FromBody] NotificationPreferences preferences)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        user.NotificationPreferences = preferences;
        await _userService.UpdateAsync(user.Id, user);
        return Ok(user.NotificationPreferences);
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] User submitted)
    {
        var existingUser = await _userService.GetByEmailAsync(submitted.Email);
        if (existingUser != null)
            return BadRequest(new { message = "User already exists." });

        var user = new User
        {
            Email = submitted.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(submitted.Password),
            FullName = submitted.FullName,
            Phone = submitted.Phone,
            ReferralCode = await _referralService.GenerateUniqueCodeAsync()
        };

        if (!string.IsNullOrWhiteSpace(submitted.ReferredByCode))
        {
            var referrer = await _userService.GetByReferralCodeAsync(submitted.ReferredByCode.Trim().ToUpperInvariant());
            if (referrer != null)
            {
                user.ReferredByCode = referrer.ReferralCode;
                user.ReferredByUserId = referrer.Id;
            }
        }

        await _userService.CreateAsync(user);

        return Ok(new
        {
            message = "Signup successful",
            user = new
            {
                id = user.Id, // MongoDB-generated ObjectId
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Unauthorized(new { message = "Invalid credentials" });

        return Ok(new
        {
            message = "Login successful",
            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone
            }
        });
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Email))
            throw new ApiException("Please enter your email address.", HttpStatusCode.BadRequest);

        var user = await _userService.GetByEmailAsync(request.Email.Trim());
        const string genericMessage =
            "If an account exists for that email, we've sent password reset instructions.";

        if (user == null)
        {
            return Ok(new { message = genericMessage });
        }

        var rawToken = GenerateResetToken();
        user.PasswordResetTokenHash = BCrypt.Net.BCrypt.HashPassword(rawToken);
        user.PasswordResetExpiresAt = DateTime.UtcNow.AddMinutes(30);
        await _userService.UpdateAsync(user.Id, user);

        return Ok(new
        {
            message = genericMessage,
            devResetToken = rawToken
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Email) ||
            string.IsNullOrWhiteSpace(request.Token) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
            throw new ApiException("Email, token, and a new password are all required.", HttpStatusCode.BadRequest);

        if (request.NewPassword.Length < 8)
            throw new ApiException("Password must be at least 8 characters.", HttpStatusCode.UnprocessableEntity);

        var user = await _userService.GetByEmailAsync(request.Email.Trim());
        var invalidTokenMessage = "This reset link is invalid or has expired. Please request a new one.";

        if (user == null || string.IsNullOrEmpty(user.PasswordResetTokenHash) || user.PasswordResetExpiresAt == null)
            throw new ApiException(invalidTokenMessage, HttpStatusCode.BadRequest);

        if (user.PasswordResetExpiresAt < DateTime.UtcNow)
            throw new ApiException(invalidTokenMessage, HttpStatusCode.BadRequest);

        if (!BCrypt.Net.BCrypt.Verify(request.Token, user.PasswordResetTokenHash))
            throw new ApiException(invalidTokenMessage, HttpStatusCode.BadRequest);

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetExpiresAt = null;
        await _userService.UpdateAsync(user.Id, user);

        return Ok(new { message = "Password updated. You can now sign in." });
    }

    private static string GenerateResetToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}