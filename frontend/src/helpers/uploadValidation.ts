export const MAX_UPLOAD_SIZE_MB = 20;
export const MAX_EXPORT_DIMENSION = 2560;

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(
  file: File,
  options: { videoUploadEnabled: boolean }
): UploadValidationResult {
  if (file.type.startsWith("video/") && !options.videoUploadEnabled) {
    return {
      valid: false,
      error: `"${file.name}" - העלאת סרטונים אינה מופעלת עבור אירוע זה`,
    };
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return {
      valid: false,
      error: `"${file.name}" - סוג קובץ לא נתמך`,
    };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_UPLOAD_SIZE_MB) {
    return {
      valid: false,
      error: `"${file.name}" חורג מהמגבלה של ${MAX_UPLOAD_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}
