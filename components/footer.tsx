import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[var(--deep-navy)] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-white tracking-tight">TUTLAYT</span>
            </div>
            <p className="text-sm text-[var(--azureish-white)]/80 leading-relaxed max-w-xs">
              We elevate communication, empower professionals, and celebrate the art of language.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[var(--light-teal)] mb-6 uppercase text-xs tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm text-[var(--azureish-white)]/80">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Find Interpreters
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--light-teal)] mb-6 uppercase text-xs tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-[var(--azureish-white)]/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--light-teal)] mb-6 uppercase text-xs tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm text-[var(--azureish-white)]/80">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-[var(--azureish-white)]/60">
          © {new Date().getFullYear()} Tutlayt Translations. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
