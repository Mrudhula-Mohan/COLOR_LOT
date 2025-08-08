
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, disabled }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Propagate the reset to the parent
    if (preview === null) {
      onImageUpload(null);
    }
  }, [preview, onImageUpload]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPreview(dataUri);
        onImageUpload(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    if (preview) return; // Don't re-open file dialog if image is already there
    inputRef.current?.click();
  };
  
  const clearImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent re-opening the file dialog
    setPreview(null);
    onImageUpload(null);
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  }

  const containerClasses = `relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors ${
      dragActive ? 'border-primary bg-secondary' : 'border-border bg-card/50'
    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`;

  return (
      <div
        onClick={onButtonClick}
        className={containerClasses}
        aria-disabled={disabled}
      >
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className="absolute inset-0"></div>
        <Input
          ref={inputRef}
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
        />
        {preview ? (
          <div className="relative w-full max-w-md aspect-video">
             <Image src={preview} alt="Uploaded preview" fill className="rounded-md object-contain" />
             <Button
                variant="destructive"
                size="icon"
                className="absolute -top-3 -right-3 rounded-full h-7 w-7 z-10"
                onClick={clearImage}
             >
                <X className="h-4 w-4" />
             </Button>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="mt-4 font-semibold text-foreground">Click to upload or drag & drop</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
  );
}
