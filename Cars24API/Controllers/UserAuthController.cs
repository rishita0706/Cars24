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