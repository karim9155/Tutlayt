import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--deep-navy)] mb-4 text-center">Terms of Service</h1>
          <p className="text-center text-[var(--medium-blue)] mb-12">Last updated: 12/01/2026</p>
          
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[var(--teal)]/10 text-[var(--deep-navy)] leading-relaxed space-y-8">
            
            <section>
              <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
              <p>
                Welcome to Tutlayt Translations (“we,” “our,” or “us”). By accessing our website or using our translation and interpretation services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Services</h2>
              <p className="mb-2">
                Tutlayt Translations provides professional translation, interpretation, and related language services. All services are delivered based on the information and materials provided by the client.
              </p>
              <p>
                We reserve the right to refuse or discontinue services at our discretion, particularly in cases involving unlawful, unethical, or abusive content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Client Responsibilities</h2>
              <p className="mb-2">Clients agree to:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Provide complete, accurate, and lawful source materials</li>
                <li>Ensure they hold the necessary rights to submit documents for translation</li>
                <li>Clearly communicate deadlines, formats, and specific requirements</li>
              </ul>
              <p>
                Tutlayt Translations is not responsible for errors resulting from incomplete, unclear, or inaccurate source materials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Accuracy & Disclaimer</h2>
              <p>
                While we strive for the highest level of linguistic accuracy and cultural appropriateness, translations are interpretative by nature. Tutlayt Translations does not guarantee that translated content will be free from all errors or suitable for all purposes, including legal or medical use, unless explicitly agreed upon in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Confidentiality</h2>
              <p>
                All client materials are treated as strictly confidential. We do not share, sell, or disclose client content to third parties except where required by law or necessary to fulfill the service (e.g., trusted collaborators under confidentiality obligations).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
              <p className="mb-2">Unless otherwise agreed:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Clients retain ownership of their original content</li>
                <li>Translated content becomes the client’s property upon full payment</li>
              </ul>
              <p>
                Tutlayt Translations retains the right to reference anonymized project descriptions for portfolio or marketing purposes unless the client objects in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Payment & Fees</h2>
              <p>
                Fees, payment terms, and deadlines are agreed upon prior to project commencement. Late payments may result in delays, suspension of services, or additional charges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Limitation of Liability</h2>
              <p>
                Tutlayt Translations shall not be liable for indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Governing Law</h2>
              <p>
                These Terms shall be governed and interpreted in accordance with applicable laws in the jurisdiction where Tutlayt Translations operates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Changes to Terms</h2>
              <p>
                We reserve the right to update these Terms of Service at any time. Continued use of our services constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">11. Contact</h2>
              <p>
                For any questions regarding these Terms, please contact us at:<br />
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
