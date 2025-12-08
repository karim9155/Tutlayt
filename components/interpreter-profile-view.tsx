import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, MapPin, Star, Calendar as CalendarIcon } from "lucide-react"
import { AvailabilityCalendar } from "@/components/availability-calendar"

export function InterpreterProfileView({ interpreter }: { interpreter: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Profile Info */}
      <div className="md:col-span-2 space-y-8">
        {/* Header Card */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-32 h-32 border-4 border-[var(--azureish-white)] shadow-md">
                <AvatarImage src={interpreter.profiles?.avatar_url} />
                <AvatarFallback className="text-4xl bg-[var(--deep-navy)] text-white">{interpreter.profiles?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
                      {interpreter.profiles?.full_name}
                      {interpreter.verified && <CheckCircle2 className="w-6 h-6 text-[var(--teal)]" />}
                    </h1>
                    <div className="flex items-center gap-2 text-[var(--medium-blue)] mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{interpreter.city || "Location not specified"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--deep-navy)]">
                      {interpreter.hourly_rate ? `${interpreter.hourly_rate} TND/hr` : "Negotiable"}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-yellow-500 mt-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-medium text-black">New</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {interpreter.languages?.map((lang: string) => (
                    <Badge key={lang} className="bg-[var(--teal)] hover:bg-[var(--light-teal)]">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3 text-[var(--deep-navy)]">About</h2>
              <p className="text-gray-600 leading-relaxed">
                {interpreter.bio || "No biography provided."}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3 text-[var(--deep-navy)]">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {interpreter.specializations?.map((spec: string) => (
                  <Badge key={spec} variant="outline" className="border-[var(--medium-blue)] text-[var(--medium-blue)]">
                    {spec}
                  </Badge>
                ))}
                {(!interpreter.specializations || interpreter.specializations.length === 0) && (
                  <span className="text-gray-500 italic">No specializations listed.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Section */}
        <Card id="availability" className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--deep-navy)]">
              <CalendarIcon className="w-5 h-5 text-[var(--teal)]" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar interpreterId={interpreter.id} readOnly />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Booking Action */}
      <div className="md:col-span-1">
        <Card className="sticky top-24 border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[var(--deep-navy)]">Book this Interpreter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[var(--azureish-white)] p-4 rounded-xl text-sm text-[var(--deep-navy)] border border-[var(--teal)]/20">
              <p className="font-semibold mb-1">Ready to work?</p>
              <p>Check the calendar for available slots and proceed to booking.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hourly Rate</span>
                <span className="font-medium text-[var(--deep-navy)]">{interpreter.hourly_rate} TND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service Fee</span>
                <span className="font-medium text-[var(--deep-navy)]">15%</span>
              </div>
            </div>

            <Button className="w-full bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white shadow-md hover:shadow-lg transition-all" size="lg">
              Request Booking
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              You won't be charged until the booking is confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
