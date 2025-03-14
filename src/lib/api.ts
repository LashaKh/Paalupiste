import { FormData } from '../types';

export interface WebhookResponse {
  status: 'processing' | 'complete';
  message?: string;
  requestId?: string;
  SheetID?: string;
  SheetLink?: string;
  error?: string;
}

// Use the Netlify function as proxy
const WEBHOOK_URL = '/.netlify/functions/webhook';
const POLL_INTERVAL = 15000;
const MAX_RETRIES = 60;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    if (text.toLowerCase().includes('accepted')) {
      return {
        status: 'processing',
        message: 'Request accepted',
        requestId: Date.now().toString()
      };
    }
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

export async function pollGenerationStatus(requestId: string): Promise<WebhookResponse> {
  try {
    const response = await fetch(`${WEBHOOK_URL}/status/${requestId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Status check error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to check generation status');
  }
}

export async function generateLeads(formData: FormData): Promise<WebhookResponse> {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const initialResponse = await handleResponse(response);
    
    if (!initialResponse.requestId) {
      throw new Error('No request ID received in response');
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      await sleep(POLL_INTERVAL);
      const status = await pollGenerationStatus(initialResponse.requestId);
      
      if (status.status === 'complete') {
        if (!status.SheetLink || !status.SheetID) {
          throw new Error('Invalid completion response: missing SheetLink or SheetID');
        }
        return status;
      }
      retries++;
    }
    
    throw new Error('Generation timed out after 15 minutes');
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

export async function enrichLeads(sheetId: string, userEmail: string): Promise<boolean> {
  try {
    const response = await fetch('https://hook.eu2.make.com/onkwar3s8ivyyz8wjve5g4x4pnp1l18j', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sheetId, userEmail })
    });

    if (!response.ok) {
      throw new Error(`Failed to enrich leads: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error enriching leads:', error);
    throw error;
  }
}

export async function enrichCompanyDetails(sheetId: string, userEmail: string): Promise<boolean> {
  try {
    const response = await fetch('https://hook.eu2.make.com/c2kkcswz6a5xye1j1yifvqp1muqeduua', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sheetId, userEmail })
    });

    if (!response.ok) {
      throw new Error(`Failed to enrich company details: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error enriching company details:', error);
    throw error;
  }
}

export async function enrichCompanyDetailsSecondary(sheetId: string, userEmail: string): Promise<boolean> {
  try {
    const response = await fetch('https://hook.eu2.make.com/zcsy8gtz2zcmcgzwfwdcuk0yjs0o0d76', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sheetId, userEmail })
    });

    if (!response.ok) {
      throw new Error(`Failed to enrich company details (secondary): ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error enriching company details (secondary):', error);
    throw error;
  }
}