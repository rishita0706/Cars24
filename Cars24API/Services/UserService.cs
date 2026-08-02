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

    public async Task<User?> GetByReferralCodeAsync(string code)
    {
        return await _users.Find(u => u.ReferralCode == code).FirstOrDefaultAsync();
    }

    // Targeted field updates, not a full ReplaceOneAsync - these run right
    // after a wallet credit/debit in the same request in some call sites, and
    // a full replace using an in-memory User snapshot fetched BEFORE that
    // credit would silently undo it. Keep these as $inc/$set, not UpdateAsync.
    public async Task IncrementWalletBalanceAsync(string id, int amount)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        var update = Builders<User>.Update.Inc(u => u.WalletBalance, amount);
        await _users.UpdateOneAsync(filter, update);
    }

    public async Task SetReferralRewardGrantedAsync(string id)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        var update = Builders<User>.Update.Set(u => u.ReferralRewardGranted, true);
        await _users.UpdateOneAsync(filter, update);
    }

}
