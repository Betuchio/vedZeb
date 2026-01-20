import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { parsePhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

// Country data with flags (emoji) and names
const countryData = {
  GE: { name: 'საქართველო', nameEn: 'Georgia', flag: '🇬🇪' },
  US: { name: 'აშშ', nameEn: 'United States', flag: '🇺🇸' },
  GB: { name: 'გაერთიანებული სამეფო', nameEn: 'United Kingdom', flag: '🇬🇧' },
  DE: { name: 'გერმანია', nameEn: 'Germany', flag: '🇩🇪' },
  FR: { name: 'საფრანგეთი', nameEn: 'France', flag: '🇫🇷' },
  IT: { name: 'იტალია', nameEn: 'Italy', flag: '🇮🇹' },
  ES: { name: 'ესპანეთი', nameEn: 'Spain', flag: '🇪🇸' },
  RU: { name: 'რუსეთი', nameEn: 'Russia', flag: '🇷🇺' },
  UA: { name: 'უკრაინა', nameEn: 'Ukraine', flag: '🇺🇦' },
  TR: { name: 'თურქეთი', nameEn: 'Turkey', flag: '🇹🇷' },
  AZ: { name: 'აზერბაიჯანი', nameEn: 'Azerbaijan', flag: '🇦🇿' },
  AM: { name: 'სომხეთი', nameEn: 'Armenia', flag: '🇦🇲' },
  BY: { name: 'ბელარუსი', nameEn: 'Belarus', flag: '🇧🇾' },
  KZ: { name: 'ყაზახეთი', nameEn: 'Kazakhstan', flag: '🇰🇿' },
  PL: { name: 'პოლონეთი', nameEn: 'Poland', flag: '🇵🇱' },
  NL: { name: 'ნიდერლანდები', nameEn: 'Netherlands', flag: '🇳🇱' },
  BE: { name: 'ბელგია', nameEn: 'Belgium', flag: '🇧🇪' },
  AT: { name: 'ავსტრია', nameEn: 'Austria', flag: '🇦🇹' },
  CH: { name: 'შვეიცარია', nameEn: 'Switzerland', flag: '🇨🇭' },
  SE: { name: 'შვედეთი', nameEn: 'Sweden', flag: '🇸🇪' },
  NO: { name: 'ნორვეგია', nameEn: 'Norway', flag: '🇳🇴' },
  DK: { name: 'დანია', nameEn: 'Denmark', flag: '🇩🇰' },
  FI: { name: 'ფინეთი', nameEn: 'Finland', flag: '🇫🇮' },
  PT: { name: 'პორტუგალია', nameEn: 'Portugal', flag: '🇵🇹' },
  GR: { name: 'საბერძნეთი', nameEn: 'Greece', flag: '🇬🇷' },
  CZ: { name: 'ჩეხეთი', nameEn: 'Czech Republic', flag: '🇨🇿' },
  RO: { name: 'რუმინეთი', nameEn: 'Romania', flag: '🇷🇴' },
  BG: { name: 'ბულგარეთი', nameEn: 'Bulgaria', flag: '🇧🇬' },
  HU: { name: 'უნგრეთი', nameEn: 'Hungary', flag: '🇭🇺' },
  IL: { name: 'ისრაელი', nameEn: 'Israel', flag: '🇮🇱' },
  AE: { name: 'არაბეთის გაერთიანებული საამიროები', nameEn: 'UAE', flag: '🇦🇪' },
  CA: { name: 'კანადა', nameEn: 'Canada', flag: '🇨🇦' },
  AU: { name: 'ავსტრალია', nameEn: 'Australia', flag: '🇦🇺' },
  JP: { name: 'იაპონია', nameEn: 'Japan', flag: '🇯🇵' },
  CN: { name: 'ჩინეთი', nameEn: 'China', flag: '🇨🇳' },
  KR: { name: 'სამხრეთ კორეა', nameEn: 'South Korea', flag: '🇰🇷' },
  IN: { name: 'ინდოეთი', nameEn: 'India', flag: '🇮🇳' },
  BR: { name: 'ბრაზილია', nameEn: 'Brazil', flag: '🇧🇷' },
  MX: { name: 'მექსიკა', nameEn: 'Mexico', flag: '🇲🇽' },
  AR: { name: 'არგენტინა', nameEn: 'Argentina', flag: '🇦🇷' },
  EG: { name: 'ეგვიპტე', nameEn: 'Egypt', flag: '🇪🇬' },
  ZA: { name: 'სამხრეთ აფრიკა', nameEn: 'South Africa', flag: '🇿🇦' },
  NG: { name: 'ნიგერია', nameEn: 'Nigeria', flag: '🇳🇬' },
  SA: { name: 'საუდის არაბეთი', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  TH: { name: 'ტაილანდი', nameEn: 'Thailand', flag: '🇹🇭' },
  VN: { name: 'ვიეტნამი', nameEn: 'Vietnam', flag: '🇻🇳' },
  ID: { name: 'ინდონეზია', nameEn: 'Indonesia', flag: '🇮🇩' },
  MY: { name: 'მალაიზია', nameEn: 'Malaysia', flag: '🇲🇾' },
  SG: { name: 'სინგაპური', nameEn: 'Singapore', flag: '🇸🇬' },
  PH: { name: 'ფილიპინები', nameEn: 'Philippines', flag: '🇵🇭' },
  NZ: { name: 'ახალი ზელანდია', nameEn: 'New Zealand', flag: '🇳🇿' },
  IE: { name: 'ირლანდია', nameEn: 'Ireland', flag: '🇮🇪' },
  LT: { name: 'ლიტვა', nameEn: 'Lithuania', flag: '🇱🇹' },
  LV: { name: 'ლატვია', nameEn: 'Latvia', flag: '🇱🇻' },
  EE: { name: 'ესტონეთი', nameEn: 'Estonia', flag: '🇪🇪' },
  HR: { name: 'ხორვატია', nameEn: 'Croatia', flag: '🇭🇷' },
  RS: { name: 'სერბეთი', nameEn: 'Serbia', flag: '🇷🇸' },
  SK: { name: 'სლოვაკეთი', nameEn: 'Slovakia', flag: '🇸🇰' },
  SI: { name: 'სლოვენია', nameEn: 'Slovenia', flag: '🇸🇮' },
  MD: { name: 'მოლდოვა', nameEn: 'Moldova', flag: '🇲🇩' },
};

// Priority countries (shown first)
const priorityCountries = ['GE', 'US', 'DE', 'RU', 'TR', 'UA', 'AZ', 'AM'];

export default function PhoneInput({ value, onChange, error, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('GE');
  const [nationalNumber, setNationalNumber] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // Get all available countries
  const allCountries = getCountries().filter(code => countryData[code]);

  // Sort countries: priority first, then alphabetically
  const sortedCountries = [
    ...priorityCountries.filter(code => allCountries.includes(code)),
    ...allCountries.filter(code => !priorityCountries.includes(code)).sort((a, b) => {
      const nameA = countryData[a]?.name || a;
      const nameB = countryData[b]?.name || b;
      return nameA.localeCompare(nameB, 'ka');
    })
  ];

  // Filter countries by search
  const filteredCountries = sortedCountries.filter(code => {
    const data = countryData[code];
    if (!data) return false;
    const searchLower = search.toLowerCase();
    const callingCode = getCountryCallingCode(code);
    return (
      data.name.toLowerCase().includes(searchLower) ||
      data.nameEn.toLowerCase().includes(searchLower) ||
      code.toLowerCase().includes(searchLower) ||
      callingCode.includes(search)
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse initial value
  useEffect(() => {
    if (value && value.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          setSelectedCountry(parsed.country || 'GE');
          setNationalNumber(parsed.nationalNumber || '');
        }
      } catch (e) {
        // Invalid number, ignore
      }
    }
  }, []);

  // Update parent value when country or number changes
  const updateValue = (country, number) => {
    if (!number) {
      onChange('');
      return;
    }
    const callingCode = getCountryCallingCode(country);
    const fullNumber = `+${callingCode}${number.replace(/\D/g, '')}`;
    onChange(fullNumber);
  };

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
    setIsOpen(false);
    setSearch('');
    updateValue(code, nationalNumber);
    inputRef.current?.focus();
  };

  const handleNumberChange = (e) => {
    const number = e.target.value.replace(/\D/g, '');
    setNationalNumber(number);
    updateValue(selectedCountry, number);
  };

  const getValidationStatus = () => {
    if (!value) return null;
    try {
      return isValidPhoneNumber(value) ? 'valid' : 'invalid';
    } catch {
      return 'invalid';
    }
  };

  const validationStatus = getValidationStatus();
  const callingCode = getCountryCallingCode(selectedCountry);
  const countryInfo = countryData[selectedCountry] || { flag: '🏳️', name: selectedCountry };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <div className={`flex rounded-xl border ${error ? 'border-red-300' : validationStatus === 'valid' ? 'border-green-300' : 'border-slate-200'} overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white`}>
          {/* Country Selector Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-3 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 transition-colors min-w-[100px]"
          >
            <span className="text-xl">{countryInfo.flag}</span>
            <span className="text-sm font-medium text-slate-700">+{callingCode}</span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Phone Number Input */}
          <input
            ref={inputRef}
            type="tel"
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder="XXX XXX XXX"
            className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
          />

          {/* Validation Icon */}
          {validationStatus && (
            <div className="flex items-center pr-3">
              {validationStatus === 'valid' ? (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Country Dropdown - Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-72"
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 99999
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ძიება..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-56">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                ვერ მოიძებნა
              </div>
            ) : (
              filteredCountries.map((code, index) => {
                const data = countryData[code];
                const cCode = getCountryCallingCode(code);
                const isPriority = priorityCountries.includes(code);
                const isFirstNonPriority = !isPriority && index > 0 && priorityCountries.includes(filteredCountries[index - 1]);

                return (
                  <div key={code}>
                    {isFirstNonPriority && (
                      <div className="border-t border-slate-100 my-1" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleCountrySelect(code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${selectedCountry === code ? 'bg-indigo-50' : ''}`}
                    >
                      <span className="text-xl">{data.flag}</span>
                      <span className="flex-1 text-sm text-slate-700">{data.name}</span>
                      <span className="text-sm text-slate-400">+{cCode}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// Export validation helper
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  try {
    if (isValidPhoneNumber(phone)) {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid phone number format' };
  } catch {
    return { valid: false, error: 'Invalid phone number' };
  }
};
