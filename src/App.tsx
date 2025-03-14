import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GenerateLeads from './pages/GenerateLeads';
import LeadsTable from './pages/LeadsTable';
import ContentTable from './pages/ContentTable';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ContentGeneration from './pages/ContentGeneration';
import ArticleGeneration from './pages/ArticleGeneration';
import NewsletterGeneration from './pages/NewsletterGeneration';
import KnowledgeBase from './pages/KnowledgeBase';
import SocialMediaPosts from './pages/SocialMediaPosts';
import BrochureGeneration from './pages/BrochureGeneration';
import VideoGeneration from './pages/VideoGeneration';
import ProtectedRoute from './components/ProtectedRoute';
import GenerationHistory from './pages/GenerationHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="leads">
            <Route index element={<GenerateLeads />} />
            <Route path="table" element={<LeadsTable />} />
          </Route>
          <Route path="content" element={<ContentGeneration />} />
          <Route path="content/article" element={<ArticleGeneration />} />
          <Route path="content/newsletter" element={<NewsletterGeneration />} />
          <Route path="content/social" element={<SocialMediaPosts />} />
          <Route path="content/brochure" element={<BrochureGeneration />} />
          <Route path="content/video" element={<VideoGeneration />} />
          <Route path="content/table" element={<ContentTable />} />
          <Route path="kb" element={<KnowledgeBase />} />
          <Route path="history" element={<GenerationHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;