import React, { useState, useRef } from 'react';
import { Share2, Sparkles, Loader2, Plus, CheckCircle, FileText } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { FormTextArea } from '../components/FormTextArea';
import { FormSelect } from '../components/FormSelect';
import { useToast } from '../hooks/useToast';
import { useIdeas } from '../contexts/IdeasContext';
import { useSocialPosts } from '../contexts/SocialPostsContext';
import { IdeasSidebar } from '../components/IdeasSidebar';
import { SocialPostsSidebar } from '../components/SocialPostsSidebar';

interface SocialTheme {
  title: string;
  description: string;
}

export default function SocialMediaPosts() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isIdeasSidebarOpen, setIsIdeasSidebarOpen] = useState(false);
  const [isPostsSidebarOpen, setIsPostsSidebarOpen] = useState(false);
  const [savingIdeaId, setSavingIdeaId] = useState<number | null>(null);
  const [generatedThemes, setGeneratedThemes] = useState<SocialTheme[]>([]);
  const { showToast } = useToast();
  const { addIdea } = useIdeas();
  const { addPost } = useSocialPosts();
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
          type: 'generate_social_themes'
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
      showToast('Social media themes generated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to generate themes', 'error');
      setGeneratedThemes([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThemeSelect = (theme: SocialTheme) => {
    setTitle(theme.title);
    setDescription(theme.description);
    showToast('Theme selected! Click "Generate Post" when ready.', 'info');
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveIdea = async (theme: SocialTheme, index: number) => {
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
    showToast('Idea selected! Click "Generate Post" when ready.', 'info');
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsGeneratingPost(true);

    try {
      const response = await fetch('https://hook.eu2.make.com/2uik0mj8v6igdalqo55c61tapxwf8zld', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type: 'social_post',
          platform: postType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate social media post');
      }

      const text = await response.text();
      
      // Save the generated post
      await addPost({
        title,
        content: text,
        platform: postType as 'linkedin' | 'facebook'
      });

      showToast('Social media post generated and saved successfully!', 'success');
      
      // Open the posts sidebar to show the new post
      setIsPostsSidebarOpen(true);
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to generate post', 'error');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-4">
          <Share2 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Social Media Posts
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create engaging social media content for LinkedIn and Facebook to showcase Paalupiste's solutions
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
            onClick={() => setIsPostsSidebarOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transform duration-200"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Posts
          </button>
        </div>
      </div>

      {/* Ideas Sidebar */}
      <IdeasSidebar
        isOpen={isIdeasSidebarOpen}
        onClose={() => setIsIdeasSidebarOpen(false)}
        onSelectIdea={handleSelectIdea}
      />
      
      {/* Posts Sidebar */}
      <SocialPostsSidebar
        isOpen={isPostsSidebarOpen}
        onClose={() => setIsPostsSidebarOpen(false)}
      />

      <div className="max-w-2xl mx-auto">
        {/* Theme Generator */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Social Media Theme Ideas</h2>
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

        {/* Post Form */}
        <div ref={formRef} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Post Details
          </h2>
          
          <form onSubmit={handleGeneratePost} className="space-y-6">
            <FormInput
              id="title"
              label="Post Title"
              value={title}
              onChange={setTitle}
              placeholder="e.g., Revolutionizing Construction: The Power of Screw Pile Technology"
              required
            />

            <FormSelect
              id="postType"
              label="Post Type"
              value={postType}
              onChange={setPostType}
              options={[
                { value: 'linkedin', label: 'LinkedIn Post' },
                { value: 'facebook', label: 'Facebook Post' }
              ]}
              required
            />

            <FormTextArea
              id="description"
              label="Post Description"
              value={description}
              onChange={setDescription}
              placeholder="Describe the key message and points you want to highlight in the social media post..."
              required
              rows={4}
            />

            <button
              type="submit"
              disabled={isGeneratingPost || !title || !description}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isGeneratingPost ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Generating Post...
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5 mr-2" />
                  Generate Post
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}