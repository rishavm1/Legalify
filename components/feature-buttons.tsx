"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Scale, BookOpen, Gavel, Search, Activity } from 'lucide-react';

interface FeatureButtonsProps {
  onFeatureClick: (feature: string) => void;
}

export function FeatureButtons({ onFeatureClick }: FeatureButtonsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <Button
        onClick={() => onFeatureClick('research')}
        variant="outline"
        className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Legal Research</span>
      </Button>

      <Button
        onClick={() => onFeatureClick('memo')}
        variant="outline"
        className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700"
      >
        <FileText className="w-4 h-4" />
        <span className="text-sm">Generate Memo</span>
      </Button>

      <Button
        onClick={() => onFeatureClick('argument')}
        variant="outline"
        className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700"
      >
        <Gavel className="w-4 h-4" />
        <span className="text-sm">Generate Argument</span>
      </Button>

      <Button
        onClick={() => onFeatureClick('review')}
        variant="outline"
        className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-sm">Review Draft</span>
      </Button>

      <Button
        onClick={() => onFeatureClick('analyze')}
        variant="outline"
        className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700"
      >
        <Scale className="w-4 h-4" />
        <span className="text-sm">Analyze Document</span>
      </Button>

      <Button
        onClick={() => onFeatureClick('dashboard')}
        variant="outline"
        className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700"
      >
        <Activity className="w-4 h-4" />
        <span className="text-sm">Usage Dashboard</span>
      </Button>
    </div>
  );
}
