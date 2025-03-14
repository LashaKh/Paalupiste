import React, { useState, useMemo } from 'react';
import { Building2, MapPin, Users, Sparkles, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormInput } from './FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useGenerationHistory } from '../../contexts/GenerationHistoryContext';
import { LeadGenerationService } from '../../lib/LeadGenerationService';
import { SuccessModal } from '../ui/SuccessModal';
import { FormData, GenerationHistory } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const INDUSTRIES = [
  'Construction & Civil Engineering',
  'Infrastructure & Public Works',
  'Renewable Energy Projects',
  'Marine & Coastal Construction',
  'Industrial & Manufacturing Facilities',
  'Oil, Gas & Mining',
  'Transportation & Logistics',
  'Specialty Contractors & Engineering Services',
  'Real Estate Development',
  'Government & Municipal Projects',
  'Educational & Healthcare Facilities',
  'Sports, Entertainment & Hospitality',
  'Agricultural & Rural Infrastructure',
  'Environmental Remediation & Site Restoration',
  'Urban Development & Smart Cities',
  'Water, Sewer & Waste Management',
  'Technology Infrastructure & Data Centers',
  'Disaster Recovery & Resilience Projects',
  'Utility Infrastructure',
  'Offshore & Marine Energy Installations'
];

const COMPANY_SIZES = [
  { value: 'small', label: 'Small (1-10 employees)' },
  { value: 'medium', label: 'Medium (11-50 employees)' },
  { value: 'large', label: 'Large (50+ employees)' }
];

// Comprehensive list of countries
const COUNTRIES = [
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BN', label: 'Brunei' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'CV', label: 'Cape Verde' },
  { value: 'CF', label: 'Central African Republic' },
  { value: 'TD', label: 'Chad' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros' },
  { value: 'CG', label: 'Congo' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estonia' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GR', label: 'Greece' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KP', label: 'North Korea' },
  { value: 'KR', label: 'South Korea' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'LA', label: 'Laos' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'MX', label: 'Mexico' },
  { value: 'FM', label: 'Micronesia' },
  { value: 'MD', label: 'Moldova' },
  { value: 'MC', label: 'Monaco' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PW', label: 'Palau' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'KN', label: 'Saint Kitts and Nevis' },
  { value: 'LC', label: 'Saint Lucia' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'WS', label: 'Samoa' },
  { value: 'SM', label: 'San Marino' },
  { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'SO', label: 'Somalia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SY', label: 'Syria' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VU', label: 'Vanuatu' },
  { value: 'VA', label: 'Vatican City' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'YE', label: 'Yemen' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' }
];

const initialFormData: FormData = {
  location: {
    country: '',
    state: ''
  },
  industries: [],
  companySize: '',
  additionalIndustries: ''
};

export default function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [successSheetLink, setSuccessSheetLink] = useState<string | null>(null);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addGeneration } = useGenerationHistory();
  const leadGenService = useMemo(() => new LeadGenerationService(), []);

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      industries: selected
    }));
  };

  const handleLocationChange = (field: 'country' | 'state') => (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Please sign in to generate leads', 'error');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setGenerationStatus('');

    try {
      const response = await leadGenService.generateLeads(formData, {
        onStatusChange: (status, message) => {
          setGenerationStatus(message);
        },
        onComplete: (sheetId, sheetLink) => {
          setSuccessSheetLink(sheetLink);
          addGeneration({
            productName: "Lead Generation",
            productDescription: `Generated leads for ${formData.industries.join(", ")} in ${formData.location.country}${formData.location.state ? `, ${formData.location.state}` : ''}`,
            location: {
              country: formData.location.country,
              state: formData.location.state
            },
            industries: formData.industries,
            companySize: formData.companySize,
            additionalIndustries: formData.additionalIndustries,
            timestamp: new Date().toISOString(),
            status: 'success'
          });
          setGenerationStatus('success');
        },
        onError: (error) => {
          showToast(error.message, 'error');
          addGeneration({
            productName: "Lead Generation",
            productDescription: `Failed lead generation for ${formData.industries.join(", ")} in ${formData.location.country}${formData.location.state ? `, ${formData.location.state}` : ''}`,
            location: {
              country: formData.location.country,
              state: formData.location.state
            },
            industries: formData.industries,
            companySize: formData.companySize,
            additionalIndustries: formData.additionalIndustries,
            status: 'error',
            errorMessage: error.message,
            timestamp: new Date().toISOString()
          });
          setGenerationStatus('error');
        }
      });

      if (!response.success && response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate leads';
      showToast(errorMessage, 'error');
      setGenerationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessSheetLink(null);
    navigate('/app/history');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Target Industries */}
        <div className="relative">
          <div className="absolute -left-12 top-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Target Industries
            <span className="text-xs text-gray-500 ml-2">(Select multiple)</span>
          </label>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              {INDUSTRIES.map(industry => (
                <div
                  key={industry}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    const isSelected = selectedIndustries.includes(industry);
                    const newSelected = isSelected
                      ? selectedIndustries.filter(i => i !== industry)
                      : [...selectedIndustries, industry];
                    setSelectedIndustries(newSelected);
                    setFormData(prev => ({ ...prev, industries: newSelected }));
                  }}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    selectedIndustries.includes(industry)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300'
                  }`}>
                    {selectedIndustries.includes(industry) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{industry}</span>
                </div>
              ))}
            </div>
            {selectedIndustries.length === 0 && (
              <p className="mt-2 text-sm text-red-600">Please select at least one industry</p>
            )}
          </div>
        </div>

        {/* Additional Industries */}
        <div className="relative">
          <div className="absolute -left-12 top-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <FormInput
            id="additionalIndustries"
            label="Additional Industries (Optional)"
            value={formData.additionalIndustries || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, additionalIndustries: value }))}
            placeholder="Enter any additional industries not listed above"
          />
        </div>

        {/* Location Selection */}
        <div className="relative">
          <div className="absolute -left-12 top-2">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4 relative">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                list="countries"
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                value={formData.location.country}
                onChange={(e) => handleLocationChange('country')(e.target.value)}
                placeholder="Select or type country"
                required
              />
              <datalist id="countries">
                {COUNTRIES.map(country => (
                  <option key={country.value} value={country.label} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="cityState" className="block text-sm font-medium text-gray-900 mb-2">
                City/State
              </label>
              <input
                type="text"
                id="cityState"
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                value={formData.location.state}
                onChange={(e) => handleLocationChange('state')(e.target.value)}
                placeholder="Enter city or state"
              />
            </div>
          </div>
        </div>

        {/* Company Size */}
        <div className="relative">
          <div className="absolute -left-12 top-2">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="relative">
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-900 mb-2">
              Company Size (Optional)
            </label>
            <select
              id="companySize"
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
              value={formData.companySize}
              onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
            >
              <option value="">Select Company Size</option>
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || !user || !formData.location.country.trim() || selectedIndustries.length === 0}
          className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg ${
            isLoading || !user || !formData.location.country.trim() || selectedIndustries.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover transform hover:scale-[1.02]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              {generationStatus === 'success' ? 'Leads Generated Successfully' : generationStatus === 'error' ? 'Failed to Generate Leads' : 'Generating Leads...'}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Targeted Leads
            </>
          )}
        </button>
        {selectedIndustries.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedIndustries.map(industry => (
              <span
                key={industry}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {industry}
              </span>
            ))}
          </div>
        )}
      </div>

      {successSheetLink && (
        <SuccessModal
          sheetLink={successSheetLink}
          onClose={handleCloseSuccessModal}
        />
      )}
    </form>
  );
}