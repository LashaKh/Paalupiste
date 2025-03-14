import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Target, Users, ArrowRight, Search, UserCheck, Mail, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from "../components/layout/Logo";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo />
                <span className="ml-2 text-xl font-bold text-gray-900">Lead & Content Generation</span>
              </Link>
            </div>
            <div className="flex space-x-4">
              {user ? (
                <Link
                  to="/app"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="pt-16 pb-12 md:pt-24 md:pb-20 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Platform for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Leads & Content Generation
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Generate targeted leads and compelling content for Paalupiste's innovative screw pile solutions. 
              Connect with potential clients and create engaging content that showcases our foundation systems.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              {user ? (
                <Link
                  to="/app"
                  className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg text-lg font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Generating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg text-lg font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 border-2 border-primary rounded-lg text-lg font-medium text-primary hover:bg-primary hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 py-12">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary/50 transition-colors duration-300 shadow-lg">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Lead Generation</h3>
              <p className="text-gray-600">
                AI identifies and connects with businesses that need our screw pile solutions,
                from contractors to large construction firms.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary/50 transition-colors duration-300 shadow-lg">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Creation</h3>
              <p className="text-gray-600">
                Generate engaging content that highlights our foundation solutions' benefits,
                from technical specifications to case studies.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary/50 transition-colors duration-300 shadow-lg">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Decision Maker Outreach</h3>
              <p className="text-gray-600">
                Connect with key decision-makers using personalized content and targeted
                messaging that resonates with their needs.
              </p>
            </div>
          </div>

          {/* Solutions Section */}
          <div className="py-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Comprehensive Solutions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lead Generation</h3>
                <p className="text-gray-600">
                  Find and connect with businesses needing efficient foundation solutions
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Creation</h3>
                <p className="text-gray-600">
                  Generate compelling content about our screw pile technology
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Analysis</h3>
                <p className="text-gray-600">
                  Identify market opportunities and potential growth areas
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Campaign Management</h3>
                <p className="text-gray-600">
                  Streamline outreach with targeted content and leads
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-16 text-center">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Generate leads and content that showcase the power of Paalupiste's innovative foundation solutions.
              </p>
              {user ? (
                <Link
                  to="/app"
                  className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg text-lg font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Generating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg text-lg font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo className="h-6" />
              <span className="ml-2 text-lg font-semibold text-gray-900">Lead & Content Generation</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}