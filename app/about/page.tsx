import Link from "next/link";
import { Sparkles, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-neutral-400 hover:text-white mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold mb-4">About Legalify</h1>
        <p className="text-xl text-neutral-400 mb-12">
          Making legal document creation accessible to everyone
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-neutral-300 text-lg leading-relaxed">
              Legalify democratizes access to legal documentation by combining AI technology with legal expertise. 
              We believe everyone should have access to professional-quality legal documents without the complexity and cost.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-6">Why Choose Legalify?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <Sparkles className="w-10 h-10 mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                <p className="text-neutral-400">
                  Advanced AI generates professional documents tailored to your needs
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <Zap className="w-10 h-10 mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Fast & Simple</h3>
                <p className="text-neutral-400">
                  Answer a few questions and get your document in minutes
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <Shield className="w-10 h-10 mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Secure</h3>
                <p className="text-neutral-400">
                  Your data is encrypted and protected with industry-standard security
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-neutral-300 mb-4">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <a
              href="mailto:hello@legalify.app"
              className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
            >
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
