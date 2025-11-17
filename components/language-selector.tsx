'use client';

import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES = {
  'en': { name: 'English', flag: '🇬🇧' },
  'hi': { name: 'हिंदी', flag: '🇮🇳' },
  'ta': { name: 'தமிழ்', flag: '🇮🇳' },
  'pa': { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  'te': { name: 'తెలుగు', flag: '🇮🇳' },
  'mr': { name: 'मराठी', flag: '🇮🇳' },
  'bn': { name: 'বাংলা', flag: '🇮🇳' },
  'gu': { name: 'ગુજરાતી', flag: '🇮🇳' },
};

interface LanguageSelectorProps {
  onLanguageChange: (lang: string) => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState('en');
  const [showMenu, setShowMenu] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    onLanguageChange(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && LANGUAGES[saved as keyof typeof LANGUAGES]) {
      setCurrentLang(saved);
    }
  }, []);

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="icon" 
        title="Change language"
        onClick={() => setShowMenu(!showMenu)}
      >
        <Languages className="h-4 w-4" />
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-50">
          {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
            <button
              key={code}
              onClick={() => {
                handleLanguageChange(code);
                setShowMenu(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentLang === code ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <span className="mr-2">{flag}</span>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
