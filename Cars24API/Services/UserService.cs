using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(MongoContext context)
    {
        _users = context.Users;
    }

    public async Task<User?> GetByEmailAsync(string email) =>
        await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task CreateAsync(User user) =>
        await _users.InsertOneAsync(user);

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }
    public async Task UpdateAsync(string id, User user)
    {
        await _users.ReplaceOneAsync(u => u.Id == id, user);
    }

}
