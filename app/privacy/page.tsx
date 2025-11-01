import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-neutral-400 hover:text-white mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-neutral-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-neutral-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information you provide when using Legalify, including document inputs, account details, and usage data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p>Your information is used to generate legal documents, improve our services, and communicate with you about your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption and secure storage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
            <p>We use OpenRouter AI for document generation. Your data is processed according to their privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <p>You have the right to access, modify, or delete your personal data. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
            <p>For privacy concerns, contact us at privacy@legalify.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}
