import React, { useState, useMemo } from 'react';
import { Building2, MapPin, Users, Sparkles, Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormInput } from './FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useGenerationHistory } from '../../contexts/GenerationHistoryContext';
import { LeadGenerationService } from '../../lib/LeadGenerationService';
import { SuccessModal } from '../ui/SuccessModal';
import { FormData, GenerationHistory } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

// Webhook URL for lead generation
const LEAD_GENERATION_WEBHOOK_URL = 'https://hook.eu2.make.com/8xqjvc4pyrhei7f1nc3w6364sqahzkj5';

// Industry categories with subcategories
const INDUSTRY_CATEGORIES = [
  {
    id: 'building',
    name: 'A: Building Construction / Talonrakennus',
    industries: [
      'Residential Construction Companies – Omakotitalorakentajat ja pientalorakentajat',
      'Multi-Family Housing Developers – Kerrostalojen ja rivitalojen rakennuttajat',
      'Modular & Prefabricated Building Manufacturers – Modulaaristen ja elementtirakennusten valmistajat',
      'Vacation Home Builders – Loma-asuntojen rakentajat',
      'Tiny House Builders & Installers – Pikkutalojen rakentajat ja asentajat',
      'Log & Timber Frame House Companies – Hirsitalojen ja puurunkoisten talojen rakentajat',
      'Foundation Contractors for Buildings – Talonperustusten rakentajat',
      'Renovation & Extension Contractors – Saneeraus- ja laajennusurakoitsijat',
      'Building Construction General Contractors – Talonrakentamisen pääurakoitsijat',
      'Turnkey Housing Developers – Avaimet käteen -talopakettien toimittajat'
    ]
  },
  {
    id: 'infrastructure',
    name: 'B: Infrastructure Construction / Infrarakentaminen',
    industries: [
      'Road & Highway Contractors – Tie- ja katu-urakoitsijat',
      'Bridge & Tunnel Builders – Silta- ja tunnelirakentajat',
      'Railway Infrastructure Contractors – Rautatieinfran urakoitsijat',
      'Utility Infrastructure Contractors – Vesi-, viemäri- ja sähköverkkojen rakentajat',
      'Telecom Infrastructure Installers – Tietoliikenneverkon rakentajat',
      'Street Lighting & Signage Contractors – Katuvalaistus- ja liikennemerkkien asentajat',
      'Public Works Contractors – Kunnallistekniikan ja julkisten rakenteiden urakoitsijat',
      'Noise Barrier & Retaining Wall Contractors – Meluesteiden ja tukimuurien rakentajat',
      'Groundworks & Excavation Companies – Pohjarakentamisen ja maanrakennuksen urakoitsijat',
      'Coastal & Waterway Infrastructure Builders – Ranta-, laivaväylä- ja vesirakenteiden rakentajat',
      'Parking & Pavement Contractors – Pysäköintialueiden ja asfaltoinnin urakoitsijat'
    ]
  },
  {
    id: 'landscaping',
    name: 'C: Landscaping & Outdoor Construction / Piha- ja ympäristörakentaminen',
    industries: [
      'Landscape Construction Contractors – Viher- ja piharakentamisen urakoitsijat',
      'Garden & Park Builders – Puutarhojen ja puistojen rakentajat',
      'Deck & Patio Installers – Terassien ja patioiden rakentajat ja asentajat',
      'Pergola & Outdoor Structure Builders – Pergoloiden ja muiden piharakenteiden rakentajat',
      'Fence & Gate Installers – Aitojen ja porttien asentajat',
      'Retaining Wall Contractors – Tukimuurien rakentajat',
      'Noise Barrier Builders – Meluesteiden rakentajat',
      'Outdoor Lighting & Smart Garden Installers – Ulkovalaistusratkaisujen ja älypihajärjestelmien asentajat',
      'Playground & Outdoor Sports Area Contractors – Leikki- ja liikunta-alueiden rakentajat',
      'Dock & Waterfront Construction Companies – Laituri- ja rantarakentajat',
      'Dock & Pier Manufacturers and Installers – Laitureiden ja laiturirakenteiden valmistajat ja asentajat',
      'Terrace Glazing Manufacturers and Installers – Terassilasitusten valmistajat ja asentajat',
      'Flagpole Manufacturers and Installers – Lipputankojen valmistajat ja asentajat'
    ]
  },
  {
    id: 'design',
    name: 'D: Design & Engineering Firms / Suunnittelu- ja insinööritoimistot',
    industries: [
      'Architectural Design Studios – Arkkitehtitoimistot',
      'Structural Engineering Consultants – Rakennesuunnittelijat',
      'Geotechnical Engineering Firms – Geotekniset suunnittelutoimistot',
      'Civil Engineering Consultants – Infrasuunnittelijat ja yleiset insinööritoimistot',
      'Foundation Design Specialists – Perustussuunnitteluun erikoistuneet toimistot',
      'Urban & Land Use Planners – Kaupunkisuunnittelu- ja kaavoitustoimistot',
      'Landscape Architects & Designers – Maisema-arkkitehdit ja pihasuunnittelijat',
      'Infrastructure Design Firms – Tie-, katu- ja verkostosuunnittelutoimistot',
      'Marine & Coastal Engineering Firms – Vesirakenteiden ja rannikkoinfran suunnittelutoimistot',
      'Environmental & Permitting Consultants – Ympäristökonsultit ja lupaprosessien asiantuntijat',
      'Modular & Prefabricated Design Services – Modulaaristen rakennusten suunnittelutoimistot'
    ]
  },
  {
    id: 'maintenance',
    name: 'E: Maintenance & Public Sector / Huolto- ja julkisyhteisöt',
    industries: [
      'Property Maintenance Companies – Kiinteistöhuolto- ja ylläpitoyritykset',
      'Municipal Construction & Maintenance Units – Kuntien rakentamis- ja kunnossapitoyksiköt',
      'Public Housing Authorities – Julkiset asuntotoimistot ja vuokrataloyhtiöt',
      'Energy & Utility Companies (civil infra needs) – Energia- ja verkkoyhtiöt, joilla on infraurakointitarpeita',
      'School & Healthcare Facility Managers – Koulujen ja terveydenhuollon tilahallinnosta vastaavat',
      'Park & Recreation Departments – Kuntien puisto- ja virkistysalueyksiköt',
      'Cemetery & Church Property Managers – Hautausmaiden ja seurakuntien kiinteistövastaavat',
      'Port & Marina Authorities – Satamien ja venesatamien hallinnoijat',
      'Road Maintenance Agencies – Teiden kunnossapitoyksiköt',
      'Military & Government Facility Managers – Armeijan ja valtion kiinteistöhallinnot'
    ]
  },
  {
    id: 'energy_dev',
    name: 'F: Energy Project Developers / Energiahankkeiden kehittäjät',
    industries: [
      'Solar Energy Project Developers – Aurinkovoimahankkeiden kehittäjät',
      'Wind Energy Project Developers (Small to Medium Scale) – Tuulivoimahankkeiden kehittäjät (pienet ja keskisuuret)',
      'Battery Energy Storage System (BESS) Investors & Developers – Akkuvarastohankkeiden kehittäjät ja sijoittajat',
      'Grid Infrastructure Investors – Sähköasemien ja voimalinjojen kehittäjät',
      'Hybrid Energy Project Developers (Solar + BESS + Wind) – Yhdistettyjen energiaratkaisujen kehittäjät',
      'Renewable Energy Asset Owners – Uusiutuvan energian tuotantolaitosten omistajat',
      'Fossil Fuel Power Plant Developers – Fossiilisiin polttoaineisiin perustuvien voimaloiden kehittäjät',
      'Nuclear Energy Project Developers – Ydinvoimahankkeiden kehittäjät',
      'Municipal & Cooperative Energy Companies – Kunnalliset ja osuuskuntapohjaiset energiayhtiöt',
      'Independent Power Producers (IPPs) – Riippumattomat sähkön tuottajat'
    ]
  },
  {
    id: 'energy_eng',
    name: 'G: Energy Engineering, Design & Consulting / Energiarakentamisen suunnittelijat ja konsultit',
    industries: [
      'Energy Sector Engineering Firms (civil, structural, electrical) – Energiahankkeisiin erikoistuneet suunnittelu- ja insinööritoimistot',
      'Renewable Energy Design Consultants – Uusiutuvan energian suunnitteluasiantuntijat',
      'Grid & Substation Design Engineers – Sähköverkon ja sähköasemien suunnittelijat',
      'Geotechnical & Foundation Design Consultants – Geotekniikan ja perustusten suunnittelijat',
      'EPC Designers (working under EPC contractors) – EPC-hankkeiden sisäiset suunnittelijat',
      'Environmental & Permitting Consultants – Ympäristö- ja lupakonsultit',
      'Energy System Planners & Technical Advisors – Energiajärjestelmien suunnittelijat ja tekniset neuvonantajat'
    ]
  },
  {
    id: 'energy_const',
    name: 'H: Energy Construction & Installation Contractors / Energia-alan rakentajat ja asentajat',
    industries: [
      'EPC Contractors (Engineering, Procurement, Construction) – EPC-urakoitsijat',
      'Solar PV Installers & Contractors – Aurinkopaneeliasennusten urakoitsijat',
      'Wind Turbine Installers (Small & Mid Scale) – Tuulivoimaloiden asentajat (pieni ja keskikokoluokka)',
      'BESS System Integrators & Contractors – Akkuvarastojärjestelmien asentajat ja integroijat',
      'Substation & Grid Connection Contractors – Sähköasemien ja verkkoonliitäntöjen urakoitsijat',
      'Civil Engineering Contractors (energy infra) – Rakennusurakoitsijat, jotka erikoistuneet energiarakentamiseen',
      'Foundation Contractors (incl. helical/screw piles) – Perustusten rakentajat (ml. ruuvipaalut)',
      'Utility Infrastructure Contractors (cabling, trenching, etc.) – Sähkö- ja tiedonsiirtokaapeloinnin urakoitsijat',
      'Heavy Equipment & Crane Operators for Energy Projects – Nosto- ja raskaskalustopalvelut energia-alalle'
    ]
  }
];

// Flattened list for compatibility with existing code
const INDUSTRIES = INDUSTRY_CATEGORIES.flatMap(category => category.industries);

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
  companySize: [],
  additionalIndustries: ''
};

const steps = [
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'industries', title: 'Industries', icon: Building2 },
  { id: 'company-size', title: 'Company Size', icon: Users },
];

export default function ProductForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addGeneration } = useGenerationHistory();
  const navigate = useNavigate();

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return formData.location.country !== '';
      case 1:
        return formData.industries.length > 0 || (formData.additionalIndustries && formData.additionalIndustries.trim() !== '');
      case 2:
        return formData.companySize.length > 0;
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => {
      const industries = prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry];
      return { ...prev, industries };
    });
  };
  
  // Track expanded categories in the industries section
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAdditionalIndustriesChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalIndustries: value
    }));
  };

  const handleLocationChange = (field: 'country' | 'state') => (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: field === 'country' ? COUNTRIES.find(c => c.value === value)?.label || value : value
      }
    }));
  };

  const handleCompanySizeChange = (sizeValue: string) => {
    setFormData(prev => {
      const currentSizes = prev.companySize;
      const newSizes = currentSizes.includes(sizeValue)
        ? currentSizes.filter(s => s !== sizeValue)
        : [...currentSizes, sizeValue];
      return {
        ...prev,
        companySize: newSizes
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to generate leads', 'error');
      return;
    }

    setIsLoading(true);
    const generationId = uuidv4();

    try {
      const leadGenService = new LeadGenerationService();
      const response = await leadGenService.generateLeads(formData, {
        onStatusChange: (status, message) => {
          console.log(`Generation status: ${status} - ${message}`);
        },
        onComplete: (sheetId, sheetLink) => {
          console.log('Generation complete:', { sheetId, sheetLink });
        },
        onError: (error) => {
          console.error('Generation error:', error);
          showToast(error.message, 'error');
        }
      });

      if (response.success) {
        const historyEntry: GenerationHistory = {
          id: generationId,
          timestamp: new Date().toISOString(),
          status: 'completed',
          location: formData.location,
          industries: formData.industries,
          companySize: formData.companySize,
          additionalIndustries: formData.additionalIndustries,
          formData,
          productName: "Lead Generation",
          productDescription: `Generated leads for ${formData.industries.join(", ")} in ${formData.location.country}${formData.location.state ? `, ${formData.location.state}` : ''} (Sizes: ${formData.companySize.join(', ') || 'Any'})`,
          sheetId: response.sheetId,
          sheetLink: response.sheetLink,
          leadsCount: response.leadsCount || 0,
          results: {
            convertedLeads: 0 // Initialize with 0, will be updated when leads are converted
          }
        };

        addGeneration(historyEntry);
        setGeneratedId(generationId);
        setFormData(prev => ({ ...prev, sheetLink: response.sheetLink }));
        setShowSuccessModal(true);
      } else {
        showToast('Failed to generate leads. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Lead generation error:', error);
      showToast('An error occurred while generating leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/app/leads/history');
  };

  const renderStepContent = (step: number) => {
    return (
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  value={COUNTRIES.find(c => c.label === formData.location.country)?.value || ''}
                  onChange={(e) => handleLocationChange('country')(e.target.value)}
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/State
                </label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => handleLocationChange('state')(e.target.value)}
                  placeholder="Enter city or state"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {formData.location.country && formData.location.state && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10"
              >
                <p className="text-sm text-gray-600">
                  Selected Location: <span className="font-medium text-gray-900">{formData.location.country}</span>
                  {formData.location.state && (
                    <>, <span className="font-medium text-gray-900">{formData.location.state}</span></>
                  )}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Target Industries
              </label>
              <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
                <div className="max-h-[500px] overflow-y-auto p-1">
                  {INDUSTRY_CATEGORIES.map((category) => (
                    <div key={category.id} className="mb-2 border-b border-gray-100 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="flex justify-between items-center w-full p-3 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm">{category.name}</span>
                        <svg
                          className={`w-5 h-5 transition-transform ${expandedCategories.includes(category.id) ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {expandedCategories.includes(category.id) && (
                        <div className="px-3 pb-3">
                          <div className="space-y-1 ml-2">
                            {category.industries.map((industry) => (
                              <div
                                key={industry}
                                onClick={() => handleIndustryChange(industry)}
                                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center h-5 mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={formData.industries.includes(industry)}
                                    onChange={() => {}}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary/20 cursor-pointer"
                                  />
                                </div>
                                <label className="text-sm text-gray-700 cursor-pointer select-none flex-1 group-hover:text-gray-900">
                                  {industry}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {formData.industries.length > 0 && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Industries ({formData.industries.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.industries.map(industry => (
                      <span
                        key={industry}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary group"
                      >
                        {industry}
                        <button
                          type="button"
                          onClick={() => handleIndustryChange(industry)}
                          className="ml-1 hover:text-primary-hover focus:outline-none"
                          aria-label={`Remove ${industry}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Industries (Optional)
                </label>
                <textarea
                  value={formData.additionalIndustries || ''}
                  onChange={(e) => handleAdditionalIndustriesChange(e.target.value)}
                  placeholder="Enter any additional industries not listed above..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size (Select one or more)
              </label>
              <div className="grid grid-cols-1 gap-4">
                {COMPANY_SIZES.map(size => (
                  <button
                    key={size.value}
                    type="button"
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      formData.companySize.includes(size.value)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                    } transition-colors`}
                    onClick={() => handleCompanySizeChange(size.value)}
                  >
                    <span className="font-medium">{size.label}</span>
                    {formData.companySize.includes(size.value) && (
                      <Check className="h-5 w-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                  } ${isStepComplete(index) ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${index < currentStep ? '100%' : '0%'}`
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        {renderStepContent(currentStep)}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleBack}
          className={`flex items-center px-6 py-2.5 text-sm font-medium rounded-lg ${
            currentStep === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            type="submit"
            disabled={isLoading || !canProceed}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium ${
              canProceed && !isLoading
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Leads
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium ${
              canProceed
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        sheetLink={formData.sheetLink || ''}
      />
    </form>
  );
}