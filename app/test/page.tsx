"use client";

import { HeroSection } from "@/components/hero-section";
import Footer from "@/components/ui/animated-footer";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="absolute top-4 right-4 z-50">
        <div className="text-white text-sm">Test Mode - No Auth Required</div>
      </div>
      <HeroSection />
      <Footer
        leftLinks={[
          { href: "/terms", label: "Terms of Service" },
          { href: "/privacy", label: "Privacy Policy" },
        ]}
        rightLinks={[
          { href: "/about", label: "About" },
          { href: "/faq", label: "FAQ" },
        ]}
        copyrightText={`© ${new Date().getFullYear()} Legalify. All Rights Reserved.`}
        barCount={23}
      />
    </main>
  );
}