import React, { useRef, useState } from "react";
import { Upload, X, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { uploadCarImages } from "@/lib/uploadApi";
import { notifyError, notifySuccess } from "@/lib/notify";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGES = 10;

type ImageUploaderProps = {
  images: string[]; // uploaded image URLs, in display order (index 0 = cover)
  onChange: (images: string[]) => void;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_IMAGES - images.length;

  const triggerFileInput = () => fileInputRef.current?.click();

  const validateFiles = (files: File[]): File[] => {
    const valid: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        notifyError(new Error("Unsupported file type"), {
          fallback: `"${file.name}" isn't a supported image type. Please use JPG, PNG, or WEBP.`,
        });
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        notifyError(new Error("File too large"), {
          fallback: `"${file.name}" is too large. Each photo must be under 8 MB.`,
        });
        continue;
      }
      valid.push(file);
    }
    return valid;
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    if (remainingSlots <= 0) {
      notifyError(new Error("Image limit reached"), {
        fallback: `You can upload up to ${MAX_IMAGES} photos.`,
      });
      return;
    }

    const files = validateFiles(Array.from(fileList)).slice(0, remainingSlots);
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadCarImages(files, setProgress);
      onChange([...images, ...result.urls]);
      notifySuccess(
        result.urls.length === 1 ? "Photo uploaded." : `${result.urls.length} photos uploaded.`
      );
    } catch (err) {
      notifyError(err, { fallback: "Failed to upload photos. Please try again." });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 bg-gray-50/50"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
            <p className="text-sm text-gray-600">Uploading photos...</p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              Drag & drop car photos here or click to browse
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Device Photos
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Up to {MAX_IMAGES} photos (JPG, PNG, WEBP, max 8 MB each) &middot;{" "}
              {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} left
            </p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image}
              className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={image}
                alt={`Car preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    title="Move earlier"
                    className="p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  title="Remove photo"
                  className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    title="Move later"
                    className="p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Cover Photo
                </div>
              )}
            </div>
          ))}
          {images.length < MAX_IMAGES && !uploading && (
            <button
              type="button"
              onClick={triggerFileInput}
              className="aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
