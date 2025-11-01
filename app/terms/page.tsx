import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-neutral-400 hover:text-white mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-neutral-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-neutral-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By using Legalify, you agree to these Terms of Service. If you disagree, please discontinue use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
            <p>Legalify provides AI-powered legal document generation. Documents are for informational purposes and should be reviewed by legal professionals.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p>You are responsible for the accuracy of information provided and the appropriate use of generated documents.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations of Liability</h2>
            <p>Legalify is not a law firm and does not provide legal advice. We are not liable for outcomes resulting from document use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
            <p>Generated documents belong to you. Legalify retains rights to the platform and underlying technology.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Termination</h2>
            <p>We reserve the right to terminate accounts that violate these terms or engage in misuse.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
