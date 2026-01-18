import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)] font-sans">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--deep-navy)] mb-12 text-center">Careers</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--teal)]/10">
              <h2 className="text-2xl font-bold text-[var(--deep-navy)] mb-4">Job Openings</h2>
              <p className="text-[var(--medium-blue)] mb-8">
                Are you a skilled interpreter or translator? Join our network of language professionals and access opportunities that value your expertise.
              </p>
              <Link href="/signup?role=interpreter">
                <Button className="w-full bg-[var(--deep-navy)] text-white hover:bg-[var(--dark-blue)]">
                  Apply as Language Professional <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--teal)]/10">
              <h2 className="text-2xl font-bold text-[var(--deep-navy)] mb-4">Become a Partner</h2>
              <p className="text-[var(--medium-blue)] mb-8">
                We are always looking for organizations and institutions to partner with. Let's work together to bridge communication gaps.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--deep-navy)] hover:text-white">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
