import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  label?: string;
}

const ImageUploader = ({ onImageSelect, label = "Upload Microscopy Image" }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelect(file, url);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => setPreview(null);

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border/50 group">
        <img src={preview} alt="Upload preview" className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="outline" size="sm" onClick={clear} className="border-border/50">
            <X className="w-4 h-4 mr-2" /> Remove
          </Button>
        </div>
        <div className="absolute top-3 left-3 bg-primary/20 backdrop-blur-md rounded-md px-2 py-1">
          <span className="text-xs font-mono text-primary">Ready for analysis</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer ${
        dragActive
          ? "border-primary bg-primary/5 box-glow"
          : "border-border/50 hover:border-primary/40 hover:bg-secondary/30"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          {dragActive ? (
            <ImageIcon className="w-7 h-7 text-primary animate-pulse-glow" />
          ) : (
            <Upload className="w-7 h-7 text-primary/60" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse • PNG, TIFF, JPG</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
