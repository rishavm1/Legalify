'use client';

import React, { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';

const LANGUAGES = {
  'en': { name: 'English', flag: '🇬🇧' },
  'hi': { name: 'हिंदी', flag: '🇮🇳' },
  'ta': { name: 'தமிழ்', flag: '🇮🇳' },
  'pa': { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
};

export function LanguageSelectorButton() {
  const [language, setLanguage] = useState('en');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) setLanguage(saved);
  }, []);

  const handleChange = async (newLang: string) => {
    console.log('Changing language to:', newLang);
    setLanguage(newLang);
    setShowMenu(false);
    localStorage.setItem('language', newLang);
    
    // Map to voice recognition language codes
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'pa': 'pa-IN',
    };
    localStorage.setItem('voiceLanguage', langMap[newLang] || 'en-IN');

    try {
      await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      });
      console.log('Language changed to:', newLang);
    } catch (error) {
      console.error('Language update error:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          console.log('Language menu toggled');
          setShowMenu(!showMenu);
        }}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Change language"
      >
        <Languages className="h-5 w-5" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
            <button
              key={code}
              onClick={() => handleChange(code)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                language === code ? 'bg-gray-100 dark:bg-gray-700' : ''
              } first:rounded-t-lg last:rounded-b-lg`}
            >
              <span>{flag}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
