import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EquipmentBookingDialog } from "@/components/equipment-booking-dialog"
import { Headphones, Speaker, Projector, Radio, Disc, Settings, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getClientTemplates } from "@/lib/documents"

export default async function EquipmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isCompanyUser = false
  let documentsVerified = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'company') {
      isCompanyUser = true

      const { data: company } = await supabase
        .from('companies')
        .select('documents')
        .eq('id', user.id)
        .single()

      if (company) {
        const templates = await getClientTemplates()
        const signedDocs: Record<string, any> = company.documents || {}
        documentsVerified = templates.length > 0 && templates.every((t: any) => !!signedDocs[t.name])
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32 bg-[var(--deep-navy)] text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--deep-navy)] via-[var(--deep-navy)]/95 to-[var(--deep-navy)]/90"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Professional <span className="text-[var(--teal)]">Interpretation Equipment</span> Rental
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Ensure your multilingual events run seamlessly with our state-of-the-art audio-visual solutions. 
              From ISO-compliant booths to crystal-clear headsets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EquipmentBookingDialog isCompanyUser={isCompanyUser} documentsVerified={documentsVerified} isLoggedIn={!!user} />
            </div>
          </div>
        </section>

        {/* Equipment Catalog */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--deep-navy)] mb-4">Our Equipment Inventory</h2>
              <p className="text-lg text-[var(--medium-blue)] max-w-2xl mx-auto">
                We provide top-tier equipment maintained to the highest standards to guarantee excellent audio quality for interpreters and delegates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Booths */}
              <div className="bg-slate-50 rounded-2xl p-8 border hover:shadow-lg transition-all hover:border-[var(--teal)]/30 group">
                <div className="w-14 h-14 bg-[var(--teal)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                  <Disc className="w-7 h-7 text-[var(--teal)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">Interpretation Booths</h3>
                <p className="text-[var(--medium-blue)] mb-6 text-sm leading-relaxed">
                  ISO 4043 compliant soundproof booths. Available in tabletop or full-size configurations for 1, 2, or 3 interpreters. Ventilation included.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Soundproof & Ventilated</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Quick Assembly</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Large viewing windows</li>
                </ul>
              </div>

              {/* Consoles */}
              <div className="bg-slate-50 rounded-2xl p-8 border hover:shadow-lg transition-all hover:border-[var(--teal)]/30 group">
                <div className="w-14 h-14 bg-[var(--teal)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                  <Settings className="w-7 h-7 text-[var(--teal)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">Interpreter Consoles</h3>
                <p className="text-[var(--medium-blue)] mb-6 text-sm leading-relaxed">
                  Digital interpreter units with intuitive controls, relay interpretation capabilities, and clear display screens for channel management.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Digital Audio Quality</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Relay & A/B Switching</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Hearing Protection</li>
                </ul>
              </div>

              {/* Headsets */}
              <div className="bg-slate-50 rounded-2xl p-8 border hover:shadow-lg transition-all hover:border-[var(--teal)]/30 group">
                <div className="w-14 h-14 bg-[var(--teal)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                  <Headphones className="w-7 h-7 text-[var(--teal)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">Headsets & Microphones</h3>
                <p className="text-[var(--medium-blue)] mb-6 text-sm leading-relaxed">
                  Professional lightweight headsets for interpreters and delegates. Variety of microphones including gooseneck, lapel, and handheld.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Noise Cancelling</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Hygienic Covers</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Crystal Clear Audio</li>
                </ul>
              </div>

              {/* Receivers */}
              <div className="bg-slate-50 rounded-2xl p-8 border hover:shadow-lg transition-all hover:border-[var(--teal)]/30 group">
                <div className="w-14 h-14 bg-[var(--teal)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                  <Radio className="w-7 h-7 text-[var(--teal)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">Infrared Receivers</h3>
                <p className="text-[var(--medium-blue)] mb-6 text-sm leading-relaxed">
                  Wireless infrared receivers for audience members. Multi-channel selection allowing delegates to tune into their preferred language.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Long Battery Life</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Secure Transmission</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Easy to Use</li>
                </ul>
              </div>

              {/* Sound Systems */}
              <div className="bg-slate-50 rounded-2xl p-8 border hover:shadow-lg transition-all hover:border-[var(--teal)]/30 group">
                <div className="w-14 h-14 bg-[var(--teal)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                  <Speaker className="w-7 h-7 text-[var(--teal)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">Sound Reinforcement</h3>
                <p className="text-[var(--medium-blue)] mb-6 text-sm leading-relaxed">
                  Complete PA systems for conferences including speakers, mixers, amplifiers, and feedback suppression for clear room audio.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Room Coverage</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Digital Mixers</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Feedback Control</li>
                </ul>
              </div>

              {/* Video */}
              <div className="bg-slate-50 rounded-2xl p-8 border hover:shadow-lg transition-all hover:border-[var(--teal)]/30 group">
                <div className="w-14 h-14 bg-[var(--teal)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                  <Projector className="w-7 h-7 text-[var(--teal)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">Video Projection</h3>
                <p className="text-[var(--medium-blue)] mb-6 text-sm leading-relaxed">
                  High-lumen projectors and screens for presentations. Seamless integration with interpretation video feeds if required.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> HD/4K Quality</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Various Screen Sizes</li>
                  <li className="flex items-center text-sm text-[var(--deep-navy)]"><CheckCircle className="w-4 h-4 text-[var(--teal)] mr-2" /> Signal Distribution</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-[var(--azureish-white)]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[var(--deep-navy)] mb-6">Full-Service Technical Support</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--teal)] text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--deep-navy)] mb-2">Site Inspection & Planning</h3>
                      <p className="text-[var(--medium-blue)]">We visit your venue beforehand to determine the optimal setup and equipment requirements for your specific event.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--teal)] text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--deep-navy)] mb-2">Professional Installation</h3>
                      <p className="text-[var(--medium-blue)]">Our technicians handle delivery, setup, and testing well before your event starts to ensure everything is perfect.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--teal)] text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--deep-navy)] mb-2">On-Site Technicians</h3>
                      <p className="text-[var(--medium-blue)]">An experienced technician stays throughout the event to monitor audio levels and resolve any issues instantly.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <EquipmentBookingDialog isCompanyUser={isCompanyUser} documentsVerified={documentsVerified} />
                </div>
              </div>
              <div className="relative">
                 <div className="aspect-video rounded-2xl shadow-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://www.languagesunlimited.com/wp-content/uploads/2022/08/mic-1.webp"
                      alt="Professional simultaneous interpretation and translation equipment"
                      className="w-full h-full object-cover"
                    />
                 </div>
                 {/* Decorative elements */}
                 <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[var(--teal)]/20 rounded-full blur-2xl"></div>
                 <div className="absolute -top-6 -left-6 w-32 h-32 bg-[var(--deep-navy)]/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
