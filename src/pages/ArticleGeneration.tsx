import React, { useState, useRef } from 'react';
import { FileText, Sparkles, Loader2, List, Plus, CheckCircle } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { FormTextArea } from '../components/FormTextArea';
import { useToast } from '../hooks/useToast';
import { useOutlines } from '../contexts/OutlineContext';
import { useIdeas } from '../contexts/IdeasContext';
import { OutlineSidebar } from '../components/OutlineSidebar';
import { ArticlesSidebar } from '../components/ArticlesSidebar';
import { IdeasSidebar } from '../components/IdeasSidebar';

interface ArticleTheme {
  title: string;
  description: string;
}

export default function ArticleGeneration() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIdeasSidebarOpen, setIsIdeasSidebarOpen] = useState(false);
  const [isArticlesSidebarOpen, setIsArticlesSidebarOpen] = useState(false);
  const [savingIdeaId, setSavingIdeaId] = useState<number | null>(null);
  const [generatedThemes, setGeneratedThemes] = useState<ArticleTheme[]>([]);
  const { showToast } = useToast();
  const { addOutline } = useOutlines();
  const { addIdea } = useIdeas();
  const formRef = useRef<HTMLDivElement>(null);

  const parseResponse = async (response: Response) => {
    const text = await response.text();
    
    if (text.startsWith('# Article Title:')) {
      const lines = text.split('\n');
      const title = lines[0].replace('# Article Title:', '').trim();
      const outline = lines.slice(1).join('\n');
      
      return {
        'Article Title': title,
        'Article Outline': outline
      };
    }
    
    try {
      return JSON.parse(text);
    } catch (error) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          throw new Error('Failed to parse response format');
        }
      }
      throw new Error('Invalid response format');
    }
  };

  const generateThemes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/02x72t2um7lwt6lvspjftcrrq5kweq5h', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generate_themes'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await parseResponse(response);
      
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid response structure: missing articles array');
      }

      setGeneratedThemes(data.articles);
      showToast('Themes generated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to generate themes', 'error');
      setGeneratedThemes([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThemeSelect = (theme: ArticleTheme) => {
    setTitle(theme.title);
    setDescription(theme.description);
    showToast('Theme selected! Click "Generate Outline" when ready.', 'info');
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveIdea = async (theme: ArticleTheme, index: number) => {
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
    showToast('Idea selected! Click "Generate Outline" when ready.', 'info');
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsGeneratingOutline(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      showToast('Initiating outline generation...', 'info');

      const response = await fetch('https://hook.eu2.make.com/jx0p4944gce9e7gyt9d5bio58jkat3l8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type: 'generate_outline'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await parseResponse(response);
      
      if (!data['Article Title'] || !data['Article Outline'] || 
          typeof data['Article Title'] !== 'string') { 
        throw new Error('Invalid response: missing or invalid article title/outline');
      }

      // Convert the nested outline object into a formatted string
      const formatOutline = (outline: any): string => {
        if (typeof outline === 'string') {
          return outline
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('\n\n');
        }

        let formattedText = '';
        
        for (const [chunkTitle, content] of Object.entries(outline)) {
          formattedText += `${chunkTitle}\n\n`;
          
          if (typeof content === 'object' && content !== null) {
            for (const [heading, subContent] of Object.entries(content as Record<string, any>)) {
              if (heading === 'H2') {
                formattedText += `## ${subContent}\n\n`;
              } else if (heading === 'H3') {
                formattedText += `### ${subContent}\n\n`;
              } else if (Array.isArray(subContent)) {
                subContent.forEach(item => {
                  formattedText += `- ${item}\n`;
                });
                formattedText += '\n';
              }
            }
          }
        }
        
        return formattedText;
      };

      const formattedOutline = formatOutline(data['Article Outline']);

      await addOutline({
        title: data['Article Title'],
        description,
        content: formattedOutline
      });

      showToast('Outline generated and saved successfully!', 'success');
      setIsSidebarOpen(true);
      
      setTitle('');
      setDescription('');
    } catch (error) {
      let errorMessage = 'Failed to generate outline';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message || 'An unexpected error occurred';
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-4">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Article Generation
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create in-depth articles about screw pile technology, applications, and benefits
        </p>
      </div>

      {/* Add Outlines Button */}
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
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transform duration-200"
          >
            <List className="h-5 w-5 mr-2" />
            Outlines
          </button>
          <button 
            onClick={() => setIsArticlesSidebarOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transform duration-200"
          >
            <FileText className="h-5 w-5 mr-2" />
            Articles
          </button>
        </div>
      </div>

      {/* Add Sidebar */}
      <OutlineSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Add Ideas Sidebar */}
      <IdeasSidebar
        isOpen={isIdeasSidebarOpen}
        onClose={() => setIsIdeasSidebarOpen(false)}
        onSelectIdea={handleSelectIdea}
      />
      
      {/* Add Articles Sidebar */}
      <ArticlesSidebar
        isOpen={isArticlesSidebarOpen}
        onClose={() => setIsArticlesSidebarOpen(false)}
      />

      <div className="max-w-2xl mx-auto">
        {/* Theme Generator */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Article Theme Ideas</h2>
            <div className="flex items-center space-x-3">
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
              {generatedThemes.length > 0 && (
                <button
                  onClick={generateThemes}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 0 0-9-9M3 12a9 9 0 0 1 9-9" strokeLinecap="round" />
                      <path d="M21 12c0 4.97-4.03 9-9 9m9-9h-2.5M3 12c0 4.97 4.03 9 9 9m-9-9h2.5" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
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

        {/* Article Form */}
        <div ref={formRef} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Article Details
          </h2>
          
          <form onSubmit={handleGenerateOutline} className="space-y-6">
            <FormInput
              id="title"
              label="Article Title"
              value={title}
              onChange={setTitle}
              placeholder="e.g., The Future of Foundation Systems: Why Screw Piles are Revolutionary"
              required
            />

            <FormTextArea
              id="description"
              label="Article Description"
              value={description}
              onChange={setDescription}
              placeholder="Describe the main points and key takeaways you want to cover in the article..."
              required
              rows={4}
            />

            <button
              type="submit"
              disabled={isGeneratingOutline || !title || !description}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isGeneratingOutline ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Generating Outline...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Outline
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}