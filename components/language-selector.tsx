'use client';

import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Change language">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={currentLang === code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
