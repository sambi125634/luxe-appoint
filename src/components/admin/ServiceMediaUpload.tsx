import { useState, useRef } from "react";
import { Upload, X, Image, Video, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaFile {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
}

interface ServiceMediaUploadProps {
  media: MediaFile[];
  onChange: (media: MediaFile[]) => void;
  maxFiles?: number;
}

export function ServiceMediaUpload({ media, onChange, maxFiles = 5 }: ServiceMediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const remainingSlots = maxFiles - media.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      
      if (!isVideo && !isImage) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMedia: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: isVideo ? "video" : "image",
          url: e.target?.result as string,
          name: file.name,
        };
        onChange([...media, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id: string) => {
    onChange(media.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          media.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => media.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={media.length >= maxFiles}
        />
        <Upload className={cn(
          "w-8 h-8 mx-auto mb-2",
          dragActive ? "text-primary" : "text-muted-foreground"
        )} />
        <p className="text-sm font-medium">
          {dragActive ? "Upuść pliki tutaj" : "Przeciągnij pliki lub kliknij"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Obrazy (JPG, PNG, WebP) i wideo (MP4, WebM) • Max {maxFiles} plików
        </p>
      </div>

      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative aspect-video rounded-lg overflow-hidden bg-muted group"
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreviewMedia(item)}
                />
              ) : (
                <div 
                  className="w-full h-full relative cursor-pointer"
                  onClick={() => setPreviewMedia(item)}
                >
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>
              )}
              <div className="absolute top-1 left-1">
                {item.type === "image" ? (
                  <Image className="w-4 h-4 text-white drop-shadow-lg" />
                ) : (
                  <Video className="w-4 h-4 text-white drop-shadow-lg" />
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeMedia(item.id);
                }}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-card rounded-full"
            onClick={() => setPreviewMedia(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full" onClick={e => e.stopPropagation()}>
            {previewMedia.type === "image" ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
