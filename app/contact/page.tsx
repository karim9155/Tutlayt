import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--deep-navy)] mb-12 text-center">Contact Us</h1>
          
          <div className="max-w-2xl mx-auto bg-[var(--deep-navy)] text-white rounded-2xl shadow-xl overflow-hidden p-10">
            <h2 className="text-2xl font-bold mb-10 text-center">Get in Touch</h2>
            <div className="space-y-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--teal)]/10 flex items-center justify-center mb-1">
                  <MapPin className="h-6 w-6 text-[var(--teal)]" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-[var(--light-teal)] text-lg">Visit Us</h3>
                  <p className="text-[var(--azureish-white)]/80 leading-relaxed">
                    15 Rue Abdelhamid Ibn Badis<br />
                    Alain Savary 2000<br />
                    Tunis, Tunisia
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--teal)]/10 flex items-center justify-center mb-1">
                  <Mail className="h-6 w-6 text-[var(--teal)]" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-[var(--light-teal)] text-lg">Email Us</h3>
                  <a href="mailto:mustaphab@tutlayt-translations.com" className="text-[var(--azureish-white)]/80 hover:text-white transition-colors block">
                    mustaphab@tutlayt-translations.com
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--teal)]/10 flex items-center justify-center mb-1">
                  <Phone className="h-6 w-6 text-[var(--teal)]" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-[var(--light-teal)] text-lg">Call Us</h3>
                  <a href="tel:+21693250241" className="text-[var(--azureish-white)]/80 hover:text-white transition-colors block">
                    +216 93 250 241
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
