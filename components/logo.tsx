import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "light" | "dark"
  className?: string
  centered?: boolean
}

export function Logo({ variant = "dark", className = "", centered = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-20 w-64">
        <Image 
          src="/images/tutlayt-logo-final.png" 
          alt="Tutlayt Logo" 
          fill
          className={`object-contain ${centered ? "object-center" : "object-left"}`}
          priority
        />
      </div>
    </Link>
  )
}
