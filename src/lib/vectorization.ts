// Polyfill for global in browser environments
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

interface VectorizationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class VectorizationService {
  private static WEBHOOK_URL = "https://hook.eu2.make.com/1t6pg5ye0g3570mvdw5cnywygghie8d8";
  private static MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
  private static MAX_TXT_SIZE = 5 * 1024 * 1024; // 5MB
  private static TIMEOUT = 240000; // 4 minutes
  private static PROGRESS_INTERVALS = {
    STARTED: 10,
    UPLOADING: 30,
    PROCESSING: 60,
    VECTORIZING: 80,
    COMPLETE: 100
  };

  static async processFile(file: File, onProgress?: (progress: number) => void): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if browser is online
      if (!navigator.onLine) {
        return {
          success: false,
          error: "You are currently offline. Please check your internet connection and try again."
        };
      }

      // Special handling for PDF files
      if (file.type === 'application/pdf' && file.size > this.MAX_PDF_SIZE) {
        return {
          success: false,
          error: "PDF files must be under 10MB. For larger files, please convert to TXT format first."
        };
      }

      // Validate TXT file size
      if (file.type === 'text/plain' && file.size > this.MAX_TXT_SIZE) {
        return {
          success: false,
          error: "TXT files must be under 5MB. Please split larger files into smaller chunks."
        };
      }

      // Validate file type
      const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: "Invalid file type. Please upload a TXT, PDF, or DOCX file"
        };
      }

      onProgress?.(this.PROGRESS_INTERVALS.STARTED); // Started upload

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      onProgress?.(this.PROGRESS_INTERVALS.UPLOADING); // File prepared

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      try {
        // Simulate progress during the potentially long processing time
        const progressInterval = setInterval(() => {
          const currentProgress = Math.min(
            this.PROGRESS_INTERVALS.VECTORIZING,
            (this.PROGRESS_INTERVALS.PROCESSING + this.PROGRESS_INTERVALS.VECTORIZING) / 2
          );
          onProgress?.(currentProgress);
        }, 5000); // Update progress every 5 seconds

        // Send to webhook
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearInterval(progressInterval);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        onProgress?.(this.PROGRESS_INTERVALS.COMPLETE); // Upload complete

        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return {
              success: false,
              error: "The upload process took longer than expected (4 minutes). Please try again with a smaller file or check your connection speed."
            };
          }
        }
        throw error;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: "Failed to upload file. Please try again later."
      };
    }
  }
}