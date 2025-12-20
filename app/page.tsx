import Link from "next/link"
import { Search, ShieldCheck, Globe, Users, Star, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center rounded-full border border-[var(--teal)]/30 bg-white/50 px-4 py-1.5 text-sm font-medium text-[var(--deep-navy)] mb-8 backdrop-blur-sm shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[var(--teal)] mr-2 animate-pulse"></span>
                The Premier Marketplace for Language Professionals
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-[var(--deep-navy)] sm:text-6xl md:text-7xl mb-8 leading-[1.1]">
                We elevate communication, <br className="hidden md:block" />
                <span className="text-[var(--teal)]">empower professionals</span>, <br className="hidden md:block" />
                and celebrate the art of language.
              </h1>
              
              <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-[var(--medium-blue)] mb-12 font-light">
                Connect with certified interpreters and translators who bridge cultures with precision, ethics, and a human touch.
              </p>

              {/* Main Search Component */}
              <div className="mx-auto max-w-4xl bg-white p-2 rounded-2xl shadow-xl shadow-[var(--deep-navy)]/5 border border-[var(--teal)]/10">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <Select>
                      <SelectTrigger className="h-14 border-0 bg-gray-50 hover:bg-gray-100 focus:ring-0 px-4 rounded-xl text-[var(--deep-navy)] font-medium transition-colors">
                        <SelectValue placeholder="Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interpretation">Interpretation</SelectItem>
                        <SelectItem value="translation">Translation</SelectItem>
                        <SelectItem value="sworn_translation">Sworn Translation</SelectItem>
                        <SelectItem value="proofreading">Proofreading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Select>
                      <SelectTrigger className="h-14 border-0 bg-gray-50 hover:bg-gray-100 focus:ring-0 px-4 rounded-xl text-[var(--deep-navy)] font-medium transition-colors">
                        <SelectValue placeholder="Source Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Select>
                      <SelectTrigger className="h-14 border-0 bg-gray-50 hover:bg-gray-100 focus:ring-0 px-4 rounded-xl text-[var(--deep-navy)] font-medium transition-colors">
                        <SelectValue placeholder="Target Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Link href="/search" className="w-full">
                      <Button className="h-14 w-full rounded-xl bg-[var(--teal)] text-white hover:bg-[var(--teal-blue)] font-bold text-base shadow-lg shadow-teal-900/10 transition-all hover:shadow-teal-900/20">
                        <Search className="mr-2 h-5 w-5" /> Search
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-[var(--light-teal)]/10 blur-3xl"></div>
            <div className="absolute bottom-[10%] left-[5%] w-[25%] h-[25%] rounded-full bg-[var(--medium-blue)]/5 blur-3xl"></div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--deep-navy)] sm:text-4xl mb-6">
                Our Expertise
              </h2>
              <p className="text-lg text-[var(--medium-blue)] font-light">
                Comprehensive language solutions tailored to your specific industry needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Interpretation",
                  desc: "Simultaneous, consecutive, and liaison interpretation for conferences and meetings.",
                  icon: Users
                },
                {
                  title: "Sworn Translation",
                  desc: "Certified translations for legal documents, contracts, and official certificates.",
                  icon: ShieldCheck
                },
                {
                  title: "Proofreading",
                  desc: "Meticulous review of your documents to ensure linguistic perfection and clarity.",
                  icon: CheckCircle2
                }
              ].map((service, i) => (
                <div key={i} className="group p-8 rounded-2xl bg-[var(--azureish-white)]/30 border border-transparent hover:border-[var(--teal)]/20 hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-[var(--deep-navy)] text-white flex items-center justify-center mb-6 group-hover:bg-[var(--teal)] transition-colors">
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--deep-navy)] mb-3">{service.title}</h3>
                  <p className="text-[var(--medium-blue)] leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-24 bg-[var(--deep-navy)] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 pattern-grid-lg"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-[var(--teal)]/20 rounded-full blur-2xl"></div>
                <div className="relative aspect-square max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                   {/* Placeholder for Founder Image - using a generic pro image if specific one not available */}
                   <div className="w-full h-full bg-[var(--dark-blue)] flex items-center justify-center text-white/20">
                      <Image 
                        src="/placeholder-user.jpg" 
                        alt="Mustapha Bouarrouj"
                        width={500}
                        height={500}
                        className="object-cover w-full h-full"
                      />
                   </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center rounded-full border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-3 py-1 text-xs font-medium text-[var(--light-teal)] mb-6">
                  Leadership
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  "Language is not just about words. It's about understanding, empathy, and connection."
                </h2>
                <div className="space-y-6 text-[var(--azureish-white)]/80 text-lg font-light leading-relaxed mb-8">
                  <p>
                    At Tutlayt, we believe in the power of human connection. Our mission is to provide ethical, fair, and efficient language services that respect the nuance of every interaction.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div>
                    <h3 className="text-xl font-bold text-white">Mustapha Bouarrouj</h3>
                    <p className="text-[var(--teal)]">Founder/CEO & Senior Interpreter/Translator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-[var(--azureish-white)] relative">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-[var(--deep-navy)] mb-6">
              Ready to bridge the gap?
            </h2>
            <p className="text-xl text-[var(--medium-blue)] mb-10 max-w-2xl mx-auto font-light">
              Join a community that values quality, ethics, and professional growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup?role=client">
                <Button size="lg" className="bg-[var(--deep-navy)] text-white hover:bg-[var(--dark-blue)] rounded-full px-10 h-14 font-bold shadow-xl shadow-blue-900/10 transition-all hover:shadow-blue-900/20">
                  Hire a Professional
                </Button>
              </Link>
              <Link href="/signup?role=interpreter">
                <Button size="lg" variant="outline" className="border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--deep-navy)] hover:text-white rounded-full px-10 h-14 font-bold bg-transparent transition-all">
                  Join as Interpreter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

