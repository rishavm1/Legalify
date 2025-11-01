"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    q: "What is Legalify?",
    a: "Legalify is an AI-powered legal document drafting tool that helps you create professional legal documents through a simple question-and-answer process.",
  },
  {
    q: "How does it work?",
    a: "Select a document template, answer a series of targeted questions, and our AI generates a complete, professionally formatted legal document based on your inputs.",
  },
  {
    q: "Is the generated document legally binding?",
    a: "While our AI generates professional documents, we recommend having them reviewed by a qualified attorney before use in legal matters.",
  },
  {
    q: "What types of documents can I create?",
    a: "You can create Legal Notices, Privacy Policies, Terms of Service, NDAs, Contracts, and Partnership Agreements.",
  },
  {
    q: "How much does it cost?",
    a: "Legalify offers flexible pricing plans. Contact us for current pricing information.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we take data security seriously. All information is encrypted and handled according to our Privacy Policy.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-neutral-400 hover:text-white mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-neutral-400 mb-12">Everything you need to know about Legalify</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-800 transition-colors"
              >
                <span className="font-semibold text-lg">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-neutral-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
