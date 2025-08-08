'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, disabled }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.click();
  };
  
  const containerClasses = `relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors ${
      dragActive ? 'border-primary bg-secondary' : 'border-border bg-card/50'
    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`;

  return (
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={containerClasses}
        aria-disabled={disabled}
      >
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
