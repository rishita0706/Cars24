using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models;

public class NewCar
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Variant { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string Mileage { get; set; } = string.Empty; 
    public string Transmission { get; set; } = string.Empty;
    public string Fuel { get; set; } = string.Empty;
    public string Engine { get; set; } = string.Empty; 
    public string Power { get; set; } = string.Empty; 

    public List<string> Images { get; set; } = new();
    public List<string> Features { get; set; } = new();

    public string? ImportBatchId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class NewCarImportRowResult
{
    public int RowNumber { get; set; }
    public bool Success { get; set; }
    public string? Error { get; set; }
    public NewCar? Car { get; set; }
}

public class NewCarImportResult
{
    public string ImportBatchId { get; set; } = string.Empty;
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<NewCarImportRowResult> Rows { get; set; } = new();
}
