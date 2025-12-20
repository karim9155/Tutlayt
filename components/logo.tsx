import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "light" | "dark"
  className?: string
  centered?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ variant = "dark", className = "", centered = false, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-16 w-52",
    md: "h-24 w-80",
    lg: "h-40 w-80 md:h-56 md:w-[36rem]",
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className={`relative max-w-full ${sizes[size]}`}>
        <Image 
          src="/images/tutlayt-logo-final.png" 
          alt="Tutlayt Logo" 
          fill
          className={`object-contain ${centered ? "object-center" : "object-left"} ${variant === 'light' ? 'brightness-0 invert' : ''}`}
          priority
        />
      </div>
    </Link>
  )
}
