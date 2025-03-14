import React from 'react';
import { X, Building2, Globe, Mail, Phone, MapPin, Calendar, FileText, User, Briefcase, Linkedin } from 'lucide-react';
import { Lead } from '../../types/leads';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="lead-details-modal" role="dialog">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lead.companyName}</h2>
              {lead.website && (
                <a 
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary-hover flex items-center mt-1"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {lead.website}
                </a>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Company Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-primary" />
                    Company Information
                  </h3>
                  
                  <div className="space-y-4">
                    {lead.company_description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-900">{lead.company_description}</p>
                      </div>
                    )}
                    
                    {lead.companyAddress && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Address</p>
                          <p className="text-gray-900">{lead.companyAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Status & Notes
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${
                            lead.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lead.status === 'qualified'
                              ? 'bg-green-100 text-green-800'
                              : lead.status === 'converted'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Priority</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${
                            lead.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : lead.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }
                        `}>
                          {lead.priority}
                        </span>
                      </div>
                    </div>

                    {lead.lastContactDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Last Contact</p>
                          <p className="text-gray-900">
                            {new Date(lead.lastContactDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {lead.notes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Decision Maker Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Decision Maker
                </h3>
                
                <div className="space-y-4">
                  {lead.decisionMakerName && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="text-gray-900">{lead.decisionMakerName}</p>
                    </div>
                  )}

                  {lead.decisionMakerTitle && (
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Title</p>
                        <p className="text-gray-900">{lead.decisionMakerTitle}</p>
                      </div>
                    </div>
                  )}

                  {lead.decisionMakerEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <a 
                          href={`mailto:${lead.decisionMakerEmail}`}
                          className="text-primary hover:text-primary-hover"
                        >
                          {lead.decisionMakerEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.decisionMakerLinkedIn && (
                    <div className="flex items-center">
                      <Linkedin className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">LinkedIn</p>
                        <a 
                          href={lead.decisionMakerLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}