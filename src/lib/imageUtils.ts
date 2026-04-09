import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    preserveExif: false,
  };
  const compressed = await imageCompression(file, options);
  return fileToBase64(compressed);
}

export async function createThumbnail(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 600,
    useWebWorker: true,
  };
  const compressed = await imageCompression(file, options);
  return fileToBase64(compressed);
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1]);
  const arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
