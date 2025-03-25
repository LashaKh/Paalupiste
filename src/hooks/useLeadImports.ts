import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LeadImport, LeadImportCreate } from '../types/leadImports';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';
import { Lead } from '../types/leads';

export function useLeadImports() {
  const [imports, setImports] = useState<LeadImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load all imports for the current user
  const fetchImports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get imports with count of converted leads
      const { data: importsData, error } = await supabase
        .from('lead_imports')
        .select('*')
        .eq('user_id', user.id)
        .order('import_date', { ascending: false });

      if (error) throw error;

      if (importsData) {
        // Format and transform data
        const formattedImports: LeadImport[] = await Promise.all(
          importsData.map(async (imp) => {
            // Get lead count for this import
            const { count: leadCount, error: leadError } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('import_id', imp.id);
              
            // Get count of converted leads
            const { count: convertedCount, error: convError } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('import_id', imp.id)
              .eq('status', 'converted');
              
            return {
              id: imp.id,
              name: imp.name,
              source: imp.source,
              sourceDetails: imp.source_details || {},
              importDate: imp.import_date,
              leadCount: imp.lead_count || (leadError ? 0 : leadCount || 0),
              notes: imp.notes || '',
              tags: imp.tags || [],
              userId: imp.user_id,
              historyId: imp.history_id,
              createdAt: imp.created_at,
              updatedAt: imp.updated_at,
              convertedCount: convError ? 0 : convertedCount || 0
            };
          })
        );
        
        setImports(formattedImports);
      }
    } catch (error) {
      console.error('Error fetching imports:', error);
      showToast('Failed to load imports', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load imports on component mount
  useEffect(() => {
    if (user) {
      fetchImports();
    }
  }, [user]);

  // Get leads for a specific import
  const fetchLeadsByImport = async (importId: string) => {
    if (!user) return [];
    
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .eq('import_id', importId);
        
      if (error) throw error;
      
      return leads || [];
    } catch (error) {
      console.error('Error fetching leads by import:', error);
      showToast('Failed to load leads', 'error');
      return [];
    }
  };

  // Create a new import
  const createImport = async (importData: LeadImportCreate) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('lead_imports')
        .insert({
          name: importData.name,
          source: importData.source,
          source_details: importData.sourceDetails || {},
          notes: importData.notes,
          tags: importData.tags || [],
          history_id: importData.historyId,
          user_id: user.id
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newImport: LeadImport = {
          id: data[0].id,
          name: data[0].name,
          source: data[0].source,
          sourceDetails: data[0].source_details || {},
          importDate: data[0].import_date,
          leadCount: data[0].lead_count || 0,
          notes: data[0].notes || '',
          tags: data[0].tags || [],
          userId: data[0].user_id,
          historyId: data[0].history_id,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at,
          convertedCount: 0
        };
        
        setImports(prev => [newImport, ...prev]);
        return newImport;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating import:', error);
      showToast('Failed to create import', 'error');
      return null;
    }
  };

  // Update an existing import
  const updateImport = async (id: string, updates: Partial<LeadImport>) => {
    if (!user) return false;
    
    try {
      // Convert from camelCase to snake_case for DB
      const dbUpdates: Record<string, any> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.source) dbUpdates.source = updates.source;
      if (updates.sourceDetails) dbUpdates.source_details = updates.sourceDetails;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.tags) dbUpdates.tags = updates.tags;
      
      const { error } = await supabase
        .from('lead_imports')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setImports(prev => 
        prev.map(imp => 
          imp.id === id 
            ? { ...imp, ...updates, updatedAt: new Date().toISOString() } 
            : imp
        )
      );
      
      showToast('Import updated successfully', 'success');
      return true;
    } catch (error) {
      console.error('Error updating import:', error);
      showToast('Failed to update import', 'error');
      return false;
    }
  };

  // Delete an import
  const deleteImport = async (id: string) => {
    if (!user) return false;
    
    try {
      // First update any leads to remove the import_id
      const { error: leadsError } = await supabase
        .from('leads')
        .update({ import_id: null })
        .eq('import_id', id)
        .eq('user_id', user.id);
        
      if (leadsError) throw leadsError;
      
      // Then delete the import
      const { error } = await supabase
        .from('lead_imports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setImports(prev => prev.filter(imp => imp.id !== id));
      
      // If the deleted import was selected, clear selection
      if (selectedImportId === id) {
        setSelectedImportId(null);
      }
      
      showToast('Import deleted successfully', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting import:', error);
      showToast('Failed to delete import', 'error');
      return false;
    }
  };

  // Import leads to an import
  const importLeadsToImport = async (importId: string, leads: Partial<Lead>[]) => {
    if (!user || !importId) return false;
    
    try {
      // Prepare leads with import_id
      const leadsWithImport = leads.map(lead => ({
        ...lead,
        import_id: importId,
        user_id: user.id
      }));
      
      // Insert the leads
      const { error } = await supabase
        .from('leads')
        .insert(leadsWithImport);
        
      if (error) throw error;
      
      // Update the lead count in the import
      const { error: updateError } = await supabase
        .from('lead_imports')
        .update({ 
          lead_count: leads.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', importId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setImports(prev => 
        prev.map(imp => 
          imp.id === importId 
            ? { ...imp, leadCount: leads.length, updatedAt: new Date().toISOString() } 
            : imp
        )
      );
      
      showToast(`Successfully imported ${leads.length} leads`, 'success');
      return true;
    } catch (error) {
      console.error('Error importing leads:', error);
      showToast('Failed to import leads', 'error');
      return false;
    }
  };

  // Parse and import leads from webhook response
  const importLeadsFromWebhook = async (webhookResponse: string) => {
    if (!user) return null;
    
    try {
      console.log('Starting webhook import with response:', webhookResponse);

      // Parse the response as a JSON array
      let rawLeads;
      try {
        // Clean up the response string
        const cleanedResponse = webhookResponse
          .replace(/\r?\n/g, '') // Remove newlines
          .replace(/\]\s*,\s*\[/g, '],[') // Clean up array formatting
          .trim();

        // Extract just the array part
        const startIdx = cleanedResponse.indexOf('[');
        const endIdx = cleanedResponse.lastIndexOf(']') + 1;
        const arrayPart = cleanedResponse.slice(startIdx, endIdx);
        
        rawLeads = JSON.parse(arrayPart);
        console.log('Parsed leads:', rawLeads);
        
        // Validate the structure
        if (!Array.isArray(rawLeads)) {
          throw new Error('Webhook response is not an array');
        }

      } catch (e) {
        console.error('JSON parsing error:', e);
        throw new Error('Failed to parse webhook response: ' + (e instanceof Error ? e.message : 'Unknown error'));
      }

      console.log('Creating leads from parsed data...');
      const leads: Partial<Lead>[] = [];
      
      // Process the leads array
      if (Array.isArray(rawLeads[0])) {
        // We have an array of arrays (multiple leads)
        for (const leadArray of rawLeads) {
          if (!Array.isArray(leadArray)) {
            console.warn('Skipping invalid lead data:', leadArray);
            continue;
          }

          // Map array indices to fields
          const lead = {
            company_name: leadArray[0] || '',
            website: leadArray[1] || '',
            description: leadArray[2] || '',
            contact_person: leadArray[3] || '',
            email: leadArray[4] || '',
            phone: leadArray[5] || '',
            notes: leadArray[6] || '',
            status: 'new' as const,
            source: 'webhook_import',
            priority: 'medium' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user.id
          };

          // Only add leads that have at least a company name
          if (lead.company_name) {
            console.log('Created lead:', lead);
            leads.push(lead);
          } else {
            console.warn('Skipping lead with no company name:', leadArray);
          }
        }
      } else {
        // We have a flat array (single lead with multiple fields)
        const lead = {
          company_name: rawLeads[0] || '',
          website: rawLeads[1] || '',
          description: rawLeads[2] || '',
          contact_person: rawLeads[3] || '',
          email: rawLeads[4] || '',
          phone: rawLeads[5] || '',
          notes: rawLeads[6] || '',
          status: 'new' as const,
          source: 'webhook_import',
          priority: 'medium' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id
        };

        if (lead.company_name) {
          console.log('Created single lead:', lead);
          leads.push(lead);
        } else {
          console.warn('Skipping lead with no company name:', rawLeads);
        }
      }

      console.log(`Total leads to import: ${leads.length}`);

      if (leads.length === 0) {
        throw new Error('No valid leads found in webhook response');
      }

      console.log('Creating import record...');
      // Create a new import record
      const importRecord = await createImport({
        name: `Lead Import ${new Date().toLocaleString()}`,
        source: 'webhook_import',
        sourceDetails: { 
          type: 'webhook', 
          count: leads.length,
          timestamp: new Date().toISOString()
        },
        notes: `Imported ${leads.length} leads from webhook`,
        tags: ['webhook', 'auto-import']
      });

      if (!importRecord) {
        throw new Error('Failed to create import record');
      }

      console.log('Importing leads to database...');
      // Import all leads in a single batch since we've already filtered out invalid ones
      const importSuccess = await importLeadsToImport(importRecord.id, leads);
      
      if (!importSuccess) {
        throw new Error('Failed to import leads to database');
      }

      // Refresh the imports list
      await fetchImports();

      console.log('Import completed successfully');
      showToast(`Successfully imported ${leads.length} leads`, 'success');
      return importRecord;
    } catch (error) {
      console.error('Error importing leads from webhook:', error);
      showToast('Failed to import leads: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      return null;
    }
  };

  return {
    imports,
    loading,
    selectedImportId,
    setSelectedImportId,
    fetchImports,
    fetchLeadsByImport,
    createImport,
    updateImport,
    deleteImport,
    importLeadsToImport,
    importLeadsFromWebhook
  };
} 