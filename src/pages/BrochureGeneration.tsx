import React, { useState, useRef } from 'react';
import { FileType, Sparkles, Loader2, List, Plus, CheckCircle, FileText, Eye, X } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { FormTextArea } from '../components/FormTextArea';
import { useToast } from '../contexts/ToastContext';
import { useIdeas } from '../contexts/IdeasContext';
import { useBrochures } from '../contexts/BrochureContext';
import { IdeasSidebar } from '../components/IdeasSidebar';
import { BrochuresSidebar } from '../components/BrochuresSidebar';
import { BrochureTemplate } from '../components/BrochureTemplate';
import { BrochurePreview } from '../components/BrochurePreview';
import { BrochureEditor } from '../components/BrochureEditor';
import { brochureTemplates } from '../lib/brochureTemplates';
import { ImageUpload } from '../components/ImageUpload';

interface BrochureTheme {
  title: string;
  description: string;
}

export default function BrochureGeneration() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBrochure, setIsGeneratingBrochure] = useState(false);
  const [isIdeasSidebarOpen, setIsIdeasSidebarOpen] = useState(false);
  const [savingIdeaId, setSavingIdeaId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template-1');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [generatedThemes, setGeneratedThemes] = useState<BrochureTheme[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isBrochuresSidebarOpen, setIsBrochuresSidebarOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { showToast } = useToast();
  const { addIdea } = useIdeas();
  const { addBrochure } = useBrochures();
  const formRef = useRef<HTMLDivElement>(null);

  const generateThemes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/02x72t2um7lwt6lvspjftcrrq5kweq5h', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generate_brochure_themes'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid response structure: missing articles array');
      }

      setGeneratedThemes(data.articles);
      showToast('Brochure themes generated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to generate themes', 'error');
      setGeneratedThemes([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThemeSelect = (theme: BrochureTheme) => {
    setTitle(theme.title);
    setDescription(theme.description);
    showToast('Theme selected! Click "Generate Brochure" when ready.', 'info');
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveIdea = async (theme: BrochureTheme, index: number) => {
    if (savingIdeaId !== null) return;
    setSavingIdeaId(index);
    try {
      await addIdea({
        title: theme.title,
        description: theme.description
      });
      showToast('Idea saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save idea', 'error');
    } finally {
      setTimeout(() => setSavingIdeaId(null), 1000);
    }
  };

  const handleSelectIdea = (idea: { title: string; description: string }) => {
    setTitle(idea.title);
    setDescription(idea.description);
    setIsIdeasSidebarOpen(false);
    showToast('Idea selected! Click "Generate Brochure" when ready.', 'info');
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGenerateHTML = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://hook.eu2.make.com/j4oytwfyjdyes6ua1qxfb8x7a06fse3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type: 'generate_content'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const content = await response.text();
      setEditorContent(content);
      return content;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to generate content', 'error');
      return '';
    }
  };

  const handleGenerateBrochure = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !selectedTemplate) {
      showToast('Please fill in all fields and select a template', 'error');
      return;
    }

    setIsGeneratingBrochure(true);

    try {
      // Find selected template
      const template = brochureTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }

      // Get HTML content from webhook
      const response = await fetch('https://hook.eu2.make.com/j4oytwfyjdyes6ua1qxfb8x7a06fse3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          templateId: selectedTemplate,
          templateName: template.name,
          type: 'brochure'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate brochure');
      }

      const htmlContent = await response.text();
      
      // Save brochure to context
      await addBrochure({
        title,
        description,
        templateId: selectedTemplate,
        pdfUrl: '',
        html_content: htmlContent
      });
      
      // Open brochures sidebar to show the new brochure
      setIsBrochuresSidebarOpen(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      showToast('Brochure generated successfully!', 'success');
    } catch (error) {
      console.error('Error in brochure generation:', error);
      showToast(error instanceof Error ? error.message : 'Failed to generate brochure', 'error');
    } finally {
      setIsGeneratingBrochure(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-4">
          <FileType className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Brochure Generation
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create professional brochures showcasing Paalupiste's screw pile solutions and benefits
        </p>
      </div>

      {/* Sidebar Button */}
      <div className="fixed left-4 top-20 z-50">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setIsIdeasSidebarOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transform duration-200"
          >
            <FileText className="h-5 w-5 mr-2" />
            Ideas
          </button>
          <button
            onClick={() => setIsBrochuresSidebarOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transform duration-200"
          >
            <FileType className="h-5 w-5 mr-2" />
            Templates
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="relative max-w-6xl mx-auto mb-12 overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Template</h2>
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {brochureTemplates.map((template) => (
            <BrochureTemplate
              key={template.id}
              id={template.id}
              name={template.name}
              preview={template.preview}
              selected={selectedTemplate === template.id}
              onSelect={setSelectedTemplate}
              onPreview={() => setPreviewImage(template.preview)}
            />
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="preview-modal" role="dialog">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
          <div className="relative h-full flex items-center justify-center p-4 select-none">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl max-h-[85vh]">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <img 
                src={previewImage} 
                alt="Template Preview" 
                className="w-full h-full object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ideas Sidebar */}
      <IdeasSidebar
        isOpen={isIdeasSidebarOpen}
        onClose={() => setIsIdeasSidebarOpen(false)}
        onSelectIdea={handleSelectIdea}
      />

      {/* Brochures Sidebar */}
      <BrochuresSidebar
        isOpen={isBrochuresSidebarOpen}
        onClose={() => setIsBrochuresSidebarOpen(false)}
        onSelectHTML={(html) => setEditorContent(html)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Content Generation */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Generate Content
            </h2>
            
            <form onSubmit={handleGenerateHTML} className="space-y-6">
              <FormInput
                id="title"
                label="Brochure Title"
                value={title}
                onChange={setTitle}
                placeholder="e.g., Paalupiste Screw Piles: Innovative Foundation Solutions"
                required
              />

              <FormTextArea
                id="description"
                label="Brochure Description"
                value={description}
                onChange={setDescription}
                placeholder="Describe the key features, benefits, and applications you want to highlight in the brochure..."
                required
                rows={4}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Images
                </label>
                <ImageUpload onImagesUploaded={setUploadedImages} />
              </div>

              <button
                type="submit"
                disabled={isGeneratingBrochure || !title || !description}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              >
                {isGeneratingBrochure ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Theme Generator */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Content Ideas</h2>
              <button
                onClick={generateThemes}
                disabled={isGenerating}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {generatedThemes.map((theme, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => handleThemeSelect(theme)}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{theme.title}</h3>
                  <p className="text-gray-600 text-sm">{theme.description}</p>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveIdea(theme, index);
                      }}
                      disabled={savingIdeaId === index}
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 
                        ${savingIdeaId === index 
                          ? 'bg-green-50 text-green-600 cursor-not-allowed'
                          : 'text-primary hover:bg-primary/10 hover:scale-105'
                        }`}
                    >
                      {savingIdeaId === index ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1.5" />
                          Save Idea
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleThemeSelect(theme)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Use Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HTML Editor */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              HTML Editor
            </h2>
            <div className="text-sm text-gray-500">
              Edit and preview your brochure's HTML content
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <BrochureEditor
              initialContent={editorContent}
              onContentChange={setEditorContent}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewContent && (
        <BrochurePreview
          content={previewContent}
          onClose={() => setPreviewContent(null)}
        />
      )}
    </div>
  );
}