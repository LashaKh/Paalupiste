import React, { useState } from 'react';
import { useGenerationHistory } from '../contexts/GenerationHistoryContext';
import { History, ExternalLink, Info, CheckCircle, XCircle, MapPin, Package, FileText, Calendar, Link as LinkIcon, Trash2, UserPlus, Loader2, Building2, DownloadCloud } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { enrichLeads, enrichCompanyDetails, enrichCompanyDetailsSecondary } from '../lib/api';
import { supabase } from '../lib/supabase';

interface EnrichConfirmModalProps {
  type: 'contacts' | 'company';
  onConfirm: () => void;
  onCancel: () => void;
}

const EnrichConfirmModal = ({ type, onConfirm, onCancel }: EnrichConfirmModalProps) => (
  <Modal onClose={onCancel}>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Confirm {type === 'contacts' ? 'Decision Maker Search' : 'Company'} Enrichment
      </h2>
      <p className="text-gray-600">
        {type === 'contacts' 
          ? 'This will initiate a comprehensive decision-maker contact detail research process.'
          : 'This will initiate a comprehensive company details research process.'}
        {' '}The enrichment may take 5-10 minutes before the lead list is updated.
      </p>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover"
        >
          Start Enrichment
        </button>
      </div>
    </div>
  </Modal>
);

interface ImportConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ImportConfirmModal = ({ onConfirm, onCancel }: ImportConfirmModalProps) => (
  <Modal onClose={onCancel}>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Confirm Lead Import
      </h2>
      <p className="text-gray-600">
        This will import leads directly from the generated data into your leads table.
        This process will take a few moments to complete.
      </p>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover"
        >
          Import Leads
        </button>
      </div>
    </div>
  </Modal>
);

const StatusBadge = ({ status }: { status: 'success' | 'error' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
    status === 'success' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }`}>
    {status === 'success' ? (
      <CheckCircle className="w-4 h-4 mr-1.5" />
    ) : (
      <XCircle className="w-4 h-4 mr-1.5" />
    )}
    {status === 'success' ? 'Success' : 'Error'}
  </span>
);

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">
      <Icon className="w-5 h-5 text-primary mt-0.5" />
    </div>
    <div className="flex-grow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

function GenerationHistory() {
  const { history = [], deleteGeneration } = useGenerationHistory();
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [enrichConfirmType, setEnrichConfirmType] = useState<'contacts' | 'company' | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState<boolean>(false);
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState<'contacts' | 'company' | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const { user } = useAuth();

  const importLeads = async () => {
    if (!selectedEntry?.sheetId || !user?.id) {
      showToast('Missing Sheet ID or user information', 'error');
      return;
    }

    setIsImporting(true);
    setShowImportConfirm(false);

    try {
      // Call the webhook with the sheet ID
      const response = await fetch('https://hook.eu2.make.com/neljqr5sqfmzh0cfagnkzdl8a9nmtr3b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sheetId: selectedEntry.sheetId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to import leads. Server returned: ' + response.status);
      }

      // Read the response text first
      const responseText = await response.text();
      
      // Process the response text which might not be valid JSON
      let leads = [];
      
      try {
        // First try to parse as standard JSON
        if (responseText && responseText.trim()) {
          leads = JSON.parse(responseText);
        }
      } catch (parseError) {
        // If parsing fails, the data might be in a different format
        // Try to fix the format and parse it
        try {
          // The response seems to be array entries without the outer brackets
          // Add outer brackets to make it valid JSON
          const fixedJson = '[' + responseText + ']';
          leads = JSON.parse(fixedJson);
        } catch (secondError) {
          // If that still doesn't work, try to manually parse the array format
          // The format appears to be array lines of the form ["company", "website", ...]
          leads = parseLeadArrays(responseText);
        }
      }
      
      if (!Array.isArray(leads) || leads.length === 0) {
        throw new Error('No valid leads data found in the response');
      }
      
      // Process each lead and add to database
      let importedCount = 0;
      
      for (const [
        companyName,
        website,
        companyDescription,
        decisionMakerName,
        decisionMakerTitle,
        decisionMakerEmail,
        decisionMakerLinkedIn
      ] of leads) {
        // Skip empty entries or non-array items
        if (!companyName) continue;
        
        // Create a new lead in the database
        const { error } = await supabase
          .from('leads')
          .insert({
            companyName: companyName || 'Unknown Company',
            website: website || '',
            company_description: companyDescription || '',
            decisionMakerName: decisionMakerName || '',
            decisionMakerTitle: decisionMakerTitle || '',
            decisionMakerEmail: decisionMakerEmail || '',
            decisionMakerLinkedIn: decisionMakerLinkedIn || '',
            user_id: user.id,
            status: 'new',
            priority: 'medium',
            history_id: selectedEntry.id // Track which history entry this lead came from
          });
          
        if (error) {
          console.error('Error adding lead:', error);
          continue;
        }
        
        importedCount++;
      }
      
      if (importedCount > 0) {
        showToast(`Successfully imported ${importedCount} leads`, 'success');
      } else {
        showToast('No valid leads found to import', 'info');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast(`Failed to import leads: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Helper function to manually parse array data that isn't valid JSON
  const parseLeadArrays = (text: string) => {
    const results = [];
    
    // Split by array entries - each should start with [ and end with ],
    const lines = text.split(/\[\s*"/);
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      
      // Add the opening bracket back (we split it off)
      line = '["' + line;
      
      // Fix the end - replace trailing comma or add closing bracket if needed
      if (line.endsWith(',')) {
        line = line.substring(0, line.length - 1);
      }
      if (!line.endsWith(']')) {
        line += ']';
      }
      
      try {
        // Try to parse this individual array
        const entry = JSON.parse(line);
        if (Array.isArray(entry) && entry.length > 0) {
          results.push(entry);
        }
      } catch (e) {
        console.warn('Failed to parse lead entry:', line);
      }
    }
    
    return results;
  };

  const startEnrichment = async (type: 'contacts' | 'company') => {
    if (!selectedEntry?.sheetId || !user?.email) {
      showToast('Sheet ID not found', 'error');
      return;
    }

    setIsEnriching(type);
    setEnrichConfirmType(null);

    try {
      if (type === 'contacts') {
        await enrichLeads(selectedEntry.sheetId, user.email);
        showToast('Started enriching leads with contact information', 'success');
      } else {
        await enrichCompanyDetails(selectedEntry.sheetId, user.email);
        await enrichCompanyDetailsSecondary(selectedEntry.sheetId, user.email);
        showToast('Started enriching leads with company details', 'success');
      }
    } catch (error) {
      showToast(`Failed to start ${type} enrichment`, 'error');
    } finally {
      setIsEnriching(null);
    }
  };

  const handleEnrichClick = (type: 'contacts' | 'company') => {
    setEnrichConfirmType(type);
  };

  const handleImportClick = () => {
    setShowImportConfirm(true);
  };

  const handleRowClick = (entry: any) => {
    setSelectedEntry(entry);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) return;

    try {
      setDeletingId(id);
      await deleteGeneration(id);
      showToast('History entry deleted successfully', 'success');
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    } catch (error) {
      showToast('Failed to delete history entry', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const closeModal = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-4">
          <History className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Lead-Gen History</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          View and manage your past lead generation requests and their results.
        </p>
      </div>

      <div className="mt-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Industries</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sheet Link</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Details</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(entry)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-primary mr-1.5" />
                        {entry.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {entry.industries?.slice(0, 2).map((industry, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary truncate"
                          >
                            {industry}
                          </span>
                        ))}
                        {entry.industries?.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{entry.industries.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.sheetLink ? (
                        <a
                          href={entry.sheetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(entry);
                        }}
                        className="text-primary hover:text-primary-hover"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleDelete(entry.id, e)}
                        disabled={deletingId === entry.id}
                        className={`text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                          deletingId === entry.id ? 'animate-pulse' : ''
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedEntry && (
        <Modal onClose={closeModal}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Generation Details</h2>
                <p className="text-sm text-gray-500">Helical Piles Lead Generation Campaign</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedEntry.status} />
                {selectedEntry.sheetLink && (
                  <a
                    href={selectedEntry.sheetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Results
                  </a>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Campaign Details */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Campaign Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Generated On</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedEntry.timestamp).toLocaleString(undefined, {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target Location</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company Size</p>
                    <p className="text-gray-900 font-medium">
                      {selectedEntry.companySize ? selectedEntry.companySize : 'Any Size'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Industries */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary" />
                  Target Industries
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.industries?.map((industry: string) => (
                      <div key={industry} className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {industry}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedEntry.additionalIndustries && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Additional Industries</p>
                      <p className="text-gray-900">{selectedEntry.additionalIndustries}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
              
            {/* Actions */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleEnrichClick('contacts')}
                  disabled={isEnriching !== null || isImporting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-white border border-primary/20 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnriching === 'contacts' ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Decision-Makers
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleEnrichClick('company')}
                  disabled={isEnriching !== null || isImporting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-white border border-primary/20 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnriching === 'company' ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Enrich Company Details
                    </>
                  )}
                </button>
                <button
                  onClick={handleImportClick}
                  disabled={isEnriching !== null || isImporting || !selectedEntry.sheetId}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Import to Leads Table
                    </>
                  )}
                </button>
              </div>
            </div>
              
            {/* Error Message */}
            {selectedEntry.errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h3 className="text-red-800 font-medium mb-2 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Error Details
                </h3>
                <p className="text-red-600">{selectedEntry.errorMessage}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
      
      {enrichConfirmType && (
        <EnrichConfirmModal
          type={enrichConfirmType}
          onConfirm={() => startEnrichment(enrichConfirmType)}
          onCancel={() => setEnrichConfirmType(null)}
        />
      )}

      {showImportConfirm && (
        <ImportConfirmModal
          onConfirm={importLeads}
          onCancel={() => setShowImportConfirm(false)}
        />
      )}
    </div>
  );
}

export default GenerationHistory;