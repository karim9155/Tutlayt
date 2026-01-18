import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--deep-navy)] mb-12 text-center">About Us</h1>
          
          <div className="space-y-12 text-lg text-[var(--medium-blue)] leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-[var(--deep-navy)] mb-4">History</h2>
              <p className="mb-4">
                Tutlayt Translations was founded by Mustapha Bouarrouj, an internationally experienced interpreter and language professional whose career spans humanitarian, institutional, and cross-cultural contexts across North Africa, the Middle East, Europe, and the United States.
              </p>
              <p className="mb-4">
                With years of experience working alongside international organizations, NGOs, and global platforms, Mustapha has operated in environments where language is not simply communication—it is access, protection, and credibility. His work has involved sensitive subject matter, multicultural stakeholders, and high-pressure settings where accuracy, neutrality, and cultural intelligence are non-negotiable.
              </p>
              <p className="mb-4">
                Tutlayt Translations was born from a clear realization: many translation services focus on words, but overlook meaning, power dynamics, and cultural nuance. As both an interpreter and entrepreneur, Mustapha founded the company to offer something different—language services rooted in professional ethics, contextual understanding, and human awareness.
              </p>
              <p>
                Today, Tutlayt Translations works with individuals, businesses, and international actors seeking reliable, culturally informed communication. The company collaborates with a trusted network of professional translators and interpreters who share the same standards of excellence, confidentiality, and respect for linguistic diversity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--deep-navy)] mb-4">Mission & Vision</h2>
              <p className="mb-4">
                At its core, Tutlayt Translations reflects its founder’s belief that language should never distort a message, erase a voice, or create inequality. It should connect, clarify, and empower—across borders, cultures, and institutions.
              </p>
              <p className="mb-4">
                Our mission is to deliver precise, culturally intelligent translations that preserve meaning, tone, and intent—never just words. We believe language is not a technical exercise, but a responsibility.
              </p>
              <p>
                Our vision is to become a trusted translation and interpretation partner, recognized for linguistic excellence, ethical professionalism, and deep respect for cultural diversity—especially in sensitive, human-centered contexts such as humanitarian work, social issues, and institutional communication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--deep-navy)] mb-4">Our Team & Expertise</h2>
              <p className="mb-4">
                Tutlayt Translations works with a curated network of professional translators, interpreters, and language specialists. Our team brings together linguistic rigor, subject-matter expertise, and cultural fluency across multiple language pairs and fields, including humanitarian affairs, human rights, institutional communication, and business.
              </p>
              <p>
                Every project is handled with strict confidentiality, attention to detail, and a clear understanding that behind every text, there is a human voice that deserves to be faithfully conveyed.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
