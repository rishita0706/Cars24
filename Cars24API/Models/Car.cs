using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
namespace Cars24API.Models;

public class Specs
{
    public int Year { get; set; }
    public string Km { get; set; } = string.Empty;
    public string Fuel { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Insurance { get; set; } = string.Empty;
}
public class Car
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public List<string> Images { get; set; } = new List<string>();
    public string Title { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public string Emi { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Specs Specs { get; set; } = new Specs();
    public List<string> Features { get; set; } = new List<string>();
    public List<string> Highlights { get; set; } = new List<string>();

    // Popularity signal for search ranking. Incremented each time a car's
    // detail page is fetched (see CarController.GetById). Never set by the
    // client - Create() always starts a new listing at 0.
    public int ViewCount { get; set; } = 0;
}