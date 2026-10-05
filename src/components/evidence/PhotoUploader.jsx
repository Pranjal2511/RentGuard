import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import "./PhotoUploader.css";

export default function PhotoUploader({ onPhotosSelected }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  function handleFiles(files) {
    const newPreviews = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onPhotosSelected?.(updated.map((p) => p.file));
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removePhoto(id) {
    const updated = previews.filter((p) => p.id !== id);
    setPreviews(updated);
    onPhotosSelected?.(updated.map((p) => p.file));
  }

  return (
    <div className="photo-uploader">
      <div
        className="photo-uploader__dropzone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        id="photo-dropzone"
        aria-label="Upload photos"
      >
        <Upload size={24} strokeWidth={1.5} />
        <p className="photo-uploader__hint">
          Drag photos here or <span className="photo-uploader__browse">browse</span>
        </p>
        <p className="photo-uploader__sub">JPEG, PNG up to 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
          id="photo-file-input"
        />
      </div>

      {previews.length > 0 && (
        <div className="photo-uploader__previews">
          {previews.map((p) => (
            <div key={p.id} className="photo-preview">
              <img src={p.url} alt={p.name} className="photo-preview__img" />
              <button
                className="photo-preview__remove"
                onClick={() => removePhoto(p.id)}
                aria-label={`Remove ${p.name}`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
