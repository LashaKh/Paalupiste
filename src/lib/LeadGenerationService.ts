import { FormData } from '../types';

interface WebhookResponse {
  status: string;
  SheetID: string;
  message: string;
  SheetLink: string;
  requestId: string;
}

export class LeadGenerationService {
  private static WEBHOOK_URL = 'https://hook.eu2.make.com/8xqjvc4pyrhei7f1nc3w6364sqahzkj5';
  private static IMPORT_WEBHOOK_URL = 'https://hook.eu2.make.com/neljqr5sqfmzh0cfagnkzdl8a9nmtr3b';

  /**
   * Get the correct webhook URL for importing leads
   */
  static getImportWebhookUrl() {
    return LeadGenerationService.IMPORT_WEBHOOK_URL;
  }

  async generateLeads(
    formData: FormData,
    callbacks: {
      onStatusChange?: (status: string, message: string) => void;
      onComplete?: (sheetId: string, sheetLink: string) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<{ success: boolean; sheetId?: string; sheetLink?: string; error?: string }> {
    try {
      const response = await fetch(LeadGenerationService.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to start lead generation');
      }

      const data: WebhookResponse = await response.json();
      
      if (data.status === 'processing' && data.SheetLink) {
        callbacks.onStatusChange?.('success', 'Results will be available at the provided link in 10 minutes');
        callbacks.onComplete?.(data.SheetID, data.SheetLink);
        return {
          success: true,
          sheetId: data.SheetID,
          sheetLink: data.SheetLink
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      callbacks.onError?.(new Error(errorMessage));
      return { success: false, error: errorMessage };
    }
  }
}