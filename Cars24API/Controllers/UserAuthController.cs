using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;
using BCrypt.Net;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAuthController : ControllerBase
{
    private readonly UserService _userService;
    public UserAuthController(UserService userService)
    {
        _userService = userService;
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

    // POST /api/UserAuth/{id}/fcm-token
    // Registers a browser/device's FCM token against this user. Safe to call
    // repeatedly - duplicate tokens are ignored.
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

    // DELETE /api/UserAuth/{id}/fcm-token?token=...
    // Called when the user turns push notifications off for this device.
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

    // GET /api/UserAuth/{id}/notification-preferences
    [HttpGet("{id}/notification-preferences")]
    public async Task<IActionResult> GetNotificationPreferences(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        return Ok(user.NotificationPreferences ?? new NotificationPreferences());
    }

    // PUT /api/UserAuth/{id}/notification-preferences
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
    public async Task<IActionResult> Signup([FromBody] User user)
    {
        var existingUser = await _userService.GetByEmailAsync(user.Email);
        if (existingUser != null)
            return BadRequest(new { message = "User already exists." });

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
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
}