"use client";

import { FileText, Shield, Building2, Users, ScrollText, FileCheck } from "lucide-react";

const templates = [
  { icon: FileText, label: "Legal Notice" },
  { icon: Shield, label: "Privacy Policy" },
  { icon: Building2, label: "Terms of Service" },
  { icon: Users, label: "Partnership Agreement" },
  { icon: ScrollText, label: "NDA" },
  { icon: FileCheck, label: "Contract" },
];

export function DocumentTemplates() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {templates.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </div>
  );
}
