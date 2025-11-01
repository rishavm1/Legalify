"use client";

import { Button } from "./ui/button";
import { Download, Copy, RotateCcw, Check, FileText } from "lucide-react";
import { useState } from "react";
import { exportToDocx } from "@/lib/docx-export";
import { useSession } from "next-auth/react";

interface DocumentResultProps {
  document: string;
  onReset: () => void;
}

export function DocumentResult({ document, onReset }: DocumentResultProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: session } = useSession();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(document);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = async () => {
    setDownloading(true);
    try {
      await exportToDocx(document, `legal-document-${Date.now()}.docx`);
      
      if (session?.user) {
        try {
          await fetch('/api/documents/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document, templateId: 'unknown', answers: {} }),
          });
        } catch (saveError) {
          console.error('Failed to save document:', saveError);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
    setDownloading(false);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Legal Document</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <pre>${document}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Document is Ready</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            onClick={handleDownloadWord}
            disabled={downloading}
            variant="outline"
            className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Word"}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={onReset}
            className="bg-white text-black hover:bg-neutral-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8">
        <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
          {document}
        </pre>
      </div>
    </div>
  );
}
