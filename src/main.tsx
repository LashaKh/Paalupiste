import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { GenerationHistoryProvider } from './contexts/GenerationHistoryContext';
import { OutlineProvider } from './contexts/OutlineContext';
import { NewsletterProvider } from './contexts/NewsletterContext';
import { IdeasProvider } from './contexts/IdeasContext';
import { ArticlesProvider } from './contexts/ArticlesContext';
import { BrochureProvider } from './contexts/BrochureContext';
import { SocialPostsProvider } from './contexts/SocialPostsContext';
import { ToastProvider } from './contexts/ToastContext';
import { LeadImportsProvider } from './contexts/LeadImportsContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <GenerationHistoryProvider>
          <IdeasProvider>
            <ArticlesProvider>
              <OutlineProvider>
                <SocialPostsProvider>
                  <BrochureProvider>
                    <NewsletterProvider>
                      <LeadImportsProvider>
                        <App />
                      </LeadImportsProvider>
                    </NewsletterProvider>
                  </BrochureProvider>
                </SocialPostsProvider>
              </OutlineProvider>
            </ArticlesProvider>
          </IdeasProvider>
        </GenerationHistoryProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);