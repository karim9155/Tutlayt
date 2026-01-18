import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--deep-navy)] mb-4 text-center">Privacy Policy</h1>
          <p className="text-center text-[var(--medium-blue)] mb-12">Last updated: 12/01/2026</p>
          
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[var(--teal)]/10 text-[var(--deep-navy)] leading-relaxed space-y-8">
            
            <section>
              <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
              <p>
                Tutlayt Translations respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
              <p className="mb-2">We may collect:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Personal information (name, email address, phone number)</li>
                <li>Business information (company name, billing details)</li>
                <li>Documents and content submitted for translation</li>
                <li>Website usage data (via cookies or analytics tools)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
              <p className="mb-2">Your information is used to:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Provide and manage our services</li>
                <li>Communicate with you regarding projects or inquiries</li>
                <li>Process payments and invoices</li>
                <li>Improve our website and service quality</li>
              </ul>
              <p>We do not sell or trade your personal data.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Confidentiality of Content</h2>
              <p>
                All documents and materials submitted for translation or interpretation are treated as confidential. Access is limited to authorized personnel or collaborators bound by confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Data Storage & Security</h2>
              <p>
                We implement reasonable technical and organizational measures to protect your data against unauthorized access, loss, or misuse. However, no system is 100% secure, and absolute security cannot be guaranteed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Cookies</h2>
              <p>
                Our website may use cookies to enhance user experience and analyze traffic. You may disable cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Third Parties</h2>
              <p>
                We may use trusted third-party service providers (e.g., payment processors) strictly for operational purposes. These providers are required to protect your data and use it only as necessary.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Your Rights</h2>
              <p className="mb-2">Depending on applicable laws, you may have the right to:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Access your personal data</li>
                <li>Request correction or deletion</li>
                <li>Withdraw consent</li>
              </ul>
              <p>Requests can be made by contacting us directly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Contact</h2>
              <p>
                For privacy-related inquiries, please contact:<br />
                <a href="mailto:mustaphab@tutlayt-translations.com" className="text-[var(--teal)] hover:underline">mustaphab@tutlayt-translations.com</a>
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
