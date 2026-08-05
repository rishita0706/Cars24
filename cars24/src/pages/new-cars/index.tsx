import React, { useEffect, useState } from "react";
import {
  Search,
  UploadCloud,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Fuel,
  Settings,
  Gauge,
} from "lucide-react";
import { getNewCars, NewCar, NewCarPagedResult } from "@/lib/NewCarApi";
import { previewNewCarsDataset, uploadNewCarsDataset, NewCarImportResult } from "@/lib/uploadApi";
import { notifyError, notifySuccess } from "@/lib/notify";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const PAGE_SIZE = 12;

const NewCarsPage = () => {
  const [result, setResult] = useState<NewCarPagedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [page, setPage] = useState(1);

  const [showUploadPanel, setShowUploadPanel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getNewCars({
          search: search || undefined,
          brand: brand || undefined,
          fuel: fuel || undefined,
          transmission: transmission || undefined,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setError(true);
          notifyError(err, { fallback: "Couldn't load new cars. Please try again." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [search, brand, fuel, transmission, page]);

  // Any filter change resets to page 1, otherwise you can land on an
  // out-of-range page for the new filtered result set.
  useEffect(() => {
    setPage(1);
  }, [search, brand, fuel, transmission]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">New Cars</h1>
              <p className="text-gray-600">Browse the latest models, straight from the showroom.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadPanel((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 self-start"
            >
              <UploadCloud className="h-4 w-4" />
              {showUploadPanel ? "Hide panel" : "Upload Dataset"}
            </button>
          </div>

          {showUploadPanel && (
            <DatasetUploadPanel onImported={() => setPage(1)} />
          )}

          {/* Search + filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, model, variant..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Brands</option>
                {(result?.availableBrands ?? []).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Fuel Types</option>
                {["Petrol", "Diesel", "CNG", "Electric", "Hybrid"].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              {["Manual", "Automatic", "AMT", "CVT"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransmission(transmission === t ? "" : t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    transmission === t
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-600 mb-4">Something went wrong while loading cars.</p>
              <button
                type="button"
                onClick={() => setPage((p) => p)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : !result || result.items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-600">
                No cars match your filters yet. {result?.totalResults === 0 && result.availableBrands.length === 0
                  ? "You  can upload a dataset using the panel above to get started."
                  : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.items.map((car) => (
                  <NewCarCard key={car.id} car={car} />
                ))}
              </div>

              {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {result.page} of {result.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= result.totalPages}
                    onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const NewCarCard: React.FC<{ car: NewCar }> = ({ car }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
    <div className="aspect-video bg-gray-100 overflow-hidden">
      {car.images?.[0] ? (
        <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
          No image available
        </div>
      )}
    </div>
    <div className="p-4 flex flex-col flex-1">
      <h3 className="font-semibold text-gray-900">
        {car.brand} {car.model}
      </h3>
      {car.variant && <p className="text-xs text-gray-500">{car.variant}</p>}
      <p className="text-lg font-bold text-gray-900 mt-2">{formatINR(car.price)}</p>

      <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
        {car.fuel && (
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {car.fuel}
          </span>
        )}
        {car.transmission && (
          <span className="flex items-center gap-1">
            <Settings className="h-3.5 w-3.5" /> {car.transmission}
          </span>
        )}
        {car.mileage && (
          <span className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" /> {car.mileage}
          </span>
        )}
      </div>

      <button
        type="button"
        className="mt-auto w-full py-2 mt-4 rounded-md border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
      >
        View Details
      </button>
    </div>
  </div>
);

const DatasetUploadPanel: React.FC<{ onImported: () => void }> = ({ onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewResult, setPreviewResult] = useState<NewCarImportResult | null>(null);
  const [busy, setBusy] = useState<"preview" | "upload" | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewResult(null);
  };

  const handlePreview = async () => {
    if (!file) {
      notifyError(new Error("No file selected"), { fallback: "Please choose a CSV, JSON, or Excel file first." });
      return;
    }
    setBusy("preview");
    setProgress(0);
    try {
      const res = await previewNewCarsDataset(file, setProgress);
      setPreviewResult(res);
      if (res.failureCount === 0) {
        notifySuccess(`All ${res.successCount} rows look good. Review below, then confirm the import.`);
      } else {
        notifyError(new Error("Some rows failed validation"), {
          fallback: `${res.failureCount} of ${res.totalRows} rows have errors - check the preview below.`,
        });
      }
    } catch (err) {
      notifyError(err, { fallback: "Couldn't parse that file. Please check the format and try again." });
    } finally {
      setBusy(null);
      setProgress(0);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file) return;
    setBusy("upload");
    setProgress(0);
    try {
      const res = await uploadNewCarsDataset(file, setProgress);
      notifySuccess(`Imported ${res.successCount} of ${res.totalRows} cars into the catalog.`);
      setFile(null);
      setPreviewResult(null);
      onImported();
    } catch (err) {
      notifyError(err, { fallback: "Import failed. Please try again." });
    } finally {
      setBusy(null);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload New Cars Dataset</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV, JSON, or Excel file with columns like Brand, Model, Variant, Price, Mileage,
        Transmission, Fuel, Engine, Power, Images, Features. Preview first to catch errors before
        anything is saved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <input
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileChange}
          className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!file || busy !== null}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {busy === "preview" && <Loader2 className="h-4 w-4 animate-spin" />}
            Preview
          </button>
          <button
            type="button"
            onClick={handleConfirmUpload}
            disabled={!file || !previewResult || previewResult.successCount === 0 || busy !== null}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {busy === "upload" && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Import
          </button>
        </div>
      </div>

      {busy && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-4 max-w-xs">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {previewResult && (
        <div className="mt-5">
          <div className="flex items-center gap-4 text-sm mb-3">
            <span className="flex items-center gap-1 text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {previewResult.successCount} valid
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" /> {previewResult.failureCount} invalid
            </span>
            <span className="text-gray-500">{previewResult.totalRows} rows total</span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-md">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Row</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Brand / Model</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewResult.rows.map((row) => (
                  <tr key={row.rowNumber} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {row.car ? `${row.car.brand ?? ""} ${row.car.model ?? ""}`.trim() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {row.success ? (
                        <span className="text-green-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> OK
                        </span>
                      ) : (
                        <span className="text-red-600 inline-flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCarsPage;
