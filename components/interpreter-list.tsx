import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Star, MapPin, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function InterpreterList({ interpreters, basePath = "/interpreter" }: { interpreters: any[] | null, basePath?: string }) {
  return (
    <div className="grid gap-6">
      {interpreters?.map((interpreter: any) => {
        // Calculate average rating
        // Reviews are nested in profiles now
        const reviews = interpreter.profiles?.reviews || []
        const ratings = reviews.map((r: any) => r.rating)
        const avgRating = ratings.length > 0 
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
          : "New"
        const reviewCount = ratings.length

        return (
        <div key={interpreter.id} className="bg-white p-6 rounded-xl shadow-sm border border-[var(--teal)]/10 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
          {/* Avatar */}
          <div className="w-24 h-24 bg-[var(--azureish-white)] rounded-full flex-shrink-0 overflow-hidden border-2 border-[var(--teal)]/20 relative">
            {interpreter.profiles?.avatar_url ? (
              <img src={interpreter.profiles.avatar_url} alt={interpreter.profiles.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--deep-navy)]">
                {interpreter.profiles?.full_name?.[0] || "?"}
              </div>
            )}
            {interpreter.verified && (
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[var(--teal)] fill-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
                  {interpreter.profiles?.full_name}
                  {interpreter.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-[var(--medium-blue)]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{interpreter.city || "Location not specified"}</span>
                  </div>
                  {interpreter.years_experience > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{interpreter.years_experience} years exp.</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--deep-navy)]">
                  {interpreter.hourly_rate ? `${interpreter.hourly_rate} TND/hr` : "Negotiable"}
                </div>
                <div className="flex items-center justify-end gap-1 text-yellow-500 text-sm mt-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium text-black">{avgRating}</span>
                  <span className="text-gray-400">({reviewCount})</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {/* Languages Display Logic */}
              {(interpreter.languages_a?.length > 0 || interpreter.languages_b?.length > 0) ? (
                <div className="flex flex-wrap gap-2 text-sm">
                  {interpreter.languages_a?.map((lang: string) => (
                    <Badge key={`a-${lang}`} className="bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)] text-white border-0">
                      Native: {lang}
                    </Badge>
                  ))}
                  {interpreter.languages_b?.map((lang: string) => (
                    <Badge key={`b-${lang}`} className="bg-[var(--teal)] hover:bg-[var(--teal)] text-white border-0">
                      Active: {lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interpreter.languages?.map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="bg-[var(--azureish-white)] text-[var(--deep-navy)] hover:bg-[var(--light-teal)]">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Specializations */}
              {interpreter.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interpreter.specializations.slice(0, 3).map((spec: string) => (
                    <Badge key={spec} variant="outline" className="text-xs text-gray-500 border-gray-200">
                      {spec}
                    </Badge>
                  ))}
                  {interpreter.specializations.length > 3 && (
                    <span className="text-xs text-gray-400 self-center">+{interpreter.specializations.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            <p className="mt-4 text-[var(--medium-blue)] line-clamp-2 text-sm">
              {interpreter.bio || "No bio available."}
            </p>

            <div className="mt-6 flex gap-3">
              <Link href={`${basePath}/${interpreter.id}`} className="flex-1">
                <Button className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white shadow-md shadow-teal-900/10">View Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      )})}

      {(!interpreters || interpreters.length === 0) && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[var(--teal)]/20">
          <p className="text-[var(--medium-blue)]">No interpreters found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
