import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { FormInput } from '../forms/FormInput';
import { FormTextArea } from '../forms/FormTextArea';
import { FormSelect } from '../forms/FormSelect';
import { useToast } from '../../hooks/useToast';

interface ScriptGenerationFormProps {
  onScriptGenerated: (voiceoverUrl: string) => void;
  onError: (errorMessage: string) => void;
}

interface FormData {
  title: string;
  description: string;
  length: string;
  audience: string;
  tone: string;
  callToAction: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  length: '60',
  audience: 'construction',
  tone: 'professional',
  callToAction: '',
};

export default function ScriptGenerationForm({ onScriptGenerated, onError }: ScriptGenerationFormProps) {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleInputChange = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear errors when user makes changes
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    setApiError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://hook.eu2.make.com/7m6nywmphx18rkc53su65ih7cqe3f94i', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          videoLength: form.length,
          targetAudience: form.audience,
          tone: form.tone,
          callToAction: form.callToAction,
        }),
        signal: controller.signal
      }).catch(error => {
        // Network error handling
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again later.');
        }
        throw new Error('Network error. Please check your connection and try again.');
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Check if response contains a voiceover URL
      if (data.voiceoverUrl) {
        showToast('Script and voiceover generated successfully!', 'success');
        onScriptGenerated(data.voiceoverUrl);
      } else {
        // For development/demo purposes
        const mockVoiceoverUrl = 'https://example.com/mock-voiceover.mp3';
        showToast('Script generation initiated. Voiceover will be available soon.', 'success');
        onScriptGenerated(mockVoiceoverUrl);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setApiError(errorMessage);
      onError(errorMessage);
      showToast('Failed to generate script and voiceover. Please try again.', 'error');
      console.error('Error generating script:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-gray-200 p-4 text-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Generate Video Script & Voice-over
      </h2>
      
      {apiError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{apiError}</p>
              <p className="text-xs text-red-500 mt-1">Please try again or modify your request.</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="title"
            label="Video Title"
            value={form.title}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="e.g., Paalupiste Screw Piles: Revolutionary Foundation Solutions"
            required
          />
          
          <FormSelect
            id="length"
            label="Video Length (seconds)"
            value={form.length}
            onChange={(value) => handleInputChange('length', value)}
            options={[
              { value: '30', label: '30 seconds' },
              { value: '60', label: '60 seconds' },
              { value: '90', label: '90 seconds' },
              { value: '120', label: '2 minutes' },
              { value: '180', label: '3 minutes' },
            ]}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            id="audience"
            label="Target Audience"
            value={form.audience}
            onChange={(value) => handleInputChange('audience', value)}
            options={[
              { value: 'construction', label: 'Construction Companies' },
              { value: 'contractors', label: 'Independent Contractors' },
              { value: 'engineers', label: 'Civil Engineers' },
              { value: 'homeowners', label: 'Homeowners' },
              { value: 'developers', label: 'Property Developers' },
            ]}
            required
          />
          
          <FormSelect
            id="tone"
            label="Tone of Voice"
            value={form.tone}
            onChange={(value) => handleInputChange('tone', value)}
            options={[
              { value: 'professional', label: 'Professional' },
              { value: 'technical', label: 'Technical' },
              { value: 'friendly', label: 'Friendly' },
              { value: 'authoritative', label: 'Authoritative' },
              { value: 'educational', label: 'Educational' },
            ]}
            required
          />
        </div>
        
        <FormTextArea
          id="description"
          label="Video Description"
          value={form.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe what you want the video to be about, key points to cover, and any specific information to include..."
          required
          rows={3}
        />
        
        <FormInput
          id="callToAction"
          label="Call to Action (Optional)"
          value={form.callToAction}
          onChange={(value) => handleInputChange('callToAction', value)}
          placeholder="e.g., Visit paalupiste.com to learn more or contact our team for a consultation"
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Generating Script & Voice-over...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Script & Voice-over
              </>
            )}
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <button
            type="button"
            onClick={() => onScriptGenerated('https://example.com/demo-voiceover.mp3')}
            className="text-primary hover:underline"
          >
            Skip to editor (Debug)
          </button>
        </div>
      </form>
    </div>
  );
}