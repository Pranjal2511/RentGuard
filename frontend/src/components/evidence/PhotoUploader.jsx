import { useRef, useState, useEffect } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import "./PhotoUploader.css";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function PhotoUploader({ onPhotosSelected }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url && p.url.startsWith("blob:")) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [previews]);

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    setErrorMessage("");

    const validNewPreviews = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`"${file.name}" is not an image file.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        return;
      }

      validNewPreviews.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file,
      });
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
    }

    if (validNewPreviews.length > 0) {
      const updated = [...previews, ...validNewPreviews];
      setPreviews(updated);
      onPhotosSelected?.(updated.map((p) => p.file));
    }

    // Reset input value so same file can be re-selected if removed
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  function removePhoto(id) {
    const photoToRemove = previews.find((p) => p.id === id);
    if (photoToRemove?.url && photoToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(photoToRemove.url);
    }
    const updated = previews.filter((p) => p.id !== id);
    setPreviews(updated);
    onPhotosSelected?.(updated.map((p) => p.file));
  }

  return (
    <div className="photo-uploader">
      <div
        className={`photo-uploader__dropzone ${isDragging ? "photo-uploader__dropzone--dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        id="photo-dropzone"
        aria-label="Upload evidence photos (JPEG, PNG up to 10MB each)"
      >
        <Upload size={24} strokeWidth={1.5} />
        <p className="photo-uploader__hint">
          Drag photos here or <span className="photo-uploader__browse">browse from device</span>
        </p>
        <p className="photo-uploader__sub">JPEG, PNG up to 10MB each (Local preview)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
          id="photo-file-input"
        />
      </div>

      {errorMessage && (
        <div className="photo-uploader__error">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {previews.length > 0 && (
        <div className="photo-uploader__previews-container">
          <span className="photo-uploader__preview-label">
            Selected for upload ({previews.length}):
          </span>
          <div className="photo-uploader__previews">
            {previews.map((p) => (
              <div key={p.id} className="photo-preview">
                <img src={p.url} alt={p.name} className="photo-preview__img" />
                <button
                  type="button"
                  className="photo-preview__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(p.id);
                  }}
                  aria-label={`Remove photo ${p.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
