import React, { useCallback, useEffect, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

interface UseImageUploadProps {
  initialUrl?: string | null;
  onUpload?: (url: string) => void;
  storagePath?: string;
}

export function useImageUpload({ initialUrl, onUpload, storagePath = "uploads" }: UseImageUploadProps = {}) {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (initialUrl && !previewUrl) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        
        // Local preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const url = reader.result as string;
            setPreviewUrl(url);
            previewRef.current = url;
          };
          reader.readAsDataURL(file);
        } else {
           const url = URL.createObjectURL(file);
           setPreviewUrl(url);
           previewRef.current = url;
        }

        // Upload to Firebase
        setUploading(true);
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const fileRef = ref(storage, `${storagePath}/${uniqueFileName}`);
        
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            setUploading(false);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onUpload?.(downloadUrl);
            setUploading(false);
            setUploadProgress(100);
          }
        );
      }
    },
    [onUpload, storagePath],
  );

  const handleRemove = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUpload?.("");
  }, [previewUrl, onUpload]);

  useEffect(() => {
    return () => {
      if (previewRef.current && previewRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    uploading,
    uploadProgress,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}
