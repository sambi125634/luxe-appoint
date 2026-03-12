import { useState, useRef } from "react";
import { Upload, X, Image, Video, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  serviceId?: string;
  salonId?: string;
}

export function ServiceMediaUpload({ media, onChange, maxFiles = 5, serviceId, salonId }: ServiceMediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleFiles = async (files: File[]) => {
    const remainingSlots = maxFiles - media.length;
    const filesToProcess = files.slice(0, remainingSlots);
    const validFiles = filesToProcess.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));

    if (validFiles.length === 0) return;

    // If we have salonId, upload to storage; otherwise fall back to base64
    if (salonId) {
      setUploading(true);
      const newMedia: MediaFile[] = [];

      for (const file of validFiles) {
        const isVideo = file.type.startsWith("video/");
        const fileExt = file.name.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const path = `services/${serviceId || "new"}/${uniqueName}`;

        const { error } = await supabase.storage
          .from("salon-media")
          .upload(path, file, { upsert: true });

        if (error) {
          toast({ title: "Błąd uploadu", description: error.message, variant: "destructive" });
          continue;
        }

        const { data: urlData } = supabase.storage.from("salon-media").getPublicUrl(path);

        newMedia.push({
          id: uniqueName,
          type: isVideo ? "video" : "image",
          url: urlData.publicUrl,
          name: file.name,
        });
      }

      onChange([...media, ...newMedia]);
      setUploading(false);
    } else {
      // Fallback: base64 for demo mode
      for (const file of validFiles) {
        const isVideo = file.type.startsWith("video/");
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
      }
    }
  };

  const removeMedia = (id: string) => {
    onChange(media.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
          (media.length >= maxFiles || uploading) && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => media.length < maxFiles && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={media.length >= maxFiles || uploading}
        />
        <Upload className={cn("w-8 h-8 mx-auto mb-2", dragActive ? "text-primary" : "text-muted-foreground")} />
        <p className="text-sm font-medium">
          {uploading ? "Przesyłanie..." : dragActive ? "Upuść pliki tutaj" : "Przeciągnij pliki lub kliknij"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Obrazy (JPG, PNG, WebP) i wideo (MP4, WebM) • Max {maxFiles} plików
        </p>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {media.map((item) => (
            <div key={item.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
              {item.type === "image" ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewMedia(item)} />
              ) : (
                <div className="w-full h-full relative cursor-pointer" onClick={() => setPreviewMedia(item)}>
                  <video src={item.url} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>
              )}
              <div className="absolute top-1 left-1">
                {item.type === "image" ? <Image className="w-4 h-4 text-white drop-shadow-lg" /> : <Video className="w-4 h-4 text-white drop-shadow-lg" />}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewMedia(null)}>
          <button className="absolute top-4 right-4 p-2 bg-card rounded-full" onClick={() => setPreviewMedia(null)}>
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full" onClick={e => e.stopPropagation()}>
            {previewMedia.type === "image" ? (
              <img src={previewMedia.url} alt={previewMedia.name} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <video src={previewMedia.url} controls autoPlay className="w-full h-full object-contain rounded-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
