import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Star } from "lucide-react"
import Link from "next/link"

export function InterpreterList({ interpreters, basePath = "/interpreter" }: { interpreters: any[] | null, basePath?: string }) {
  return (
    <div className="grid gap-6">
      {interpreters?.map((interpreter: any) => (
        <div key={interpreter.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
          {/* Avatar */}
          <div className="w-24 h-24 bg-[var(--azureish-white)] rounded-full flex-shrink-0 overflow-hidden border-2 border-[var(--teal)]/20">
            {interpreter.profiles?.avatar_url ? (
              <img src={interpreter.profiles.avatar_url} alt={interpreter.profiles.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--deep-navy)]">
                {interpreter.profiles?.full_name?.[0] || "?"}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
                  {interpreter.profiles?.full_name}
                  {interpreter.verified && <CheckCircle2 className="w-5 h-5 text-[var(--teal)]" />}
                </h2>
                <p className="text-[var(--medium-blue)] font-medium">{interpreter.city || "Location not specified"}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--deep-navy)]">
                  {interpreter.hourly_rate ? `${interpreter.hourly_rate} TND/hr` : "Rate negotiable"}
                </div>
                <div className="flex items-center justify-end gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium text-black">New</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {interpreter.languages?.map((lang: string) => (
                <Badge key={lang} variant="secondary" className="bg-[var(--azureish-white)] text-[var(--deep-navy)] hover:bg-[var(--light-teal)]">
                  {lang}
                </Badge>
              ))}
            </div>

            <p className="mt-4 text-gray-600 line-clamp-2">
              {interpreter.bio || "No bio available."}
            </p>

            <div className="mt-6 flex gap-3">
              <Link href={`${basePath}/${interpreter.id}`} className="flex-1">
                <Button className="w-full bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white">View Profile</Button>
              </Link>
              <Link href={`${basePath}/${interpreter.id}#availability`} className="flex-1">
                <Button variant="outline" className="w-full border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--azureish-white)]">
                  Check Availability
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {(!interpreters || interpreters.length === 0) && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No interpreters found.</p>
        </div>
      )}
    </div>
  )
}
