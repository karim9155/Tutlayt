import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, MapPin, Star, Calendar as CalendarIcon, ShieldCheck, Clock, Globe, GraduationCap } from "lucide-react"
import { ClientAvailabilityView } from "@/components/client-availability-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingDialog } from "@/components/booking-dialog"
import { format } from "date-fns"

interface InterpreterProfileViewProps {
  interpreter: any
  reviews?: any[]
  stats?: {
    averageRating: number
    totalReviews: number
  }
}

export function InterpreterProfileView({ interpreter, reviews = [], stats = { averageRating: 0, totalReviews: 0 } }: InterpreterProfileViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Profile Info */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header Card */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[var(--deep-navy)] to-[var(--teal)] opacity-90"></div>
          <CardContent className="relative pt-0 pb-8 px-8">
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
                <AvatarImage src={interpreter.profiles?.avatar_url} className="object-cover" />
                <AvatarFallback className="text-4xl bg-[var(--azureish-white)] text-[var(--deep-navy)] font-bold">
                  {interpreter.profiles?.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pt-14 md:pt-12 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
                      {interpreter.profiles?.full_name}
                      {interpreter.verified && (
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-[var(--medium-blue)] mt-2 text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--teal)]" />
                        <span>{interpreter.city || "Location not specified"}</span>
                      </div>
                      {interpreter.years_experience > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[var(--teal)]" />
                          <span>{interpreter.years_experience} Years Experience</span>
                        </div>
                      )}
                      {interpreter.signed_policy_url && (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Policy Signed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--deep-navy)]">
                      {interpreter.hourly_rate ? (
                        <span>{interpreter.hourly_rate} <span className="text-base font-normal text-gray-500">TND/hr</span></span>
                      ) : (
                        <span className="text-xl">Negotiable</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-yellow-500 mt-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-black text-lg">{stats.averageRating > 0 ? stats.averageRating : "New"}</span>
                      <span className="text-gray-400 text-sm">({stats.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Native Language</h3>
                  <div className="flex flex-wrap gap-2">
                    {interpreter.languages_a?.length > 0 ? (
                      interpreter.languages_a.map((lang: string) => (
                        <Badge key={lang} className="bg-[var(--deep-navy)] text-white hover:bg-[var(--deep-navy)] border-0 text-sm py-1">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {interpreter.languages_b?.length > 0 ? (
                      interpreter.languages_b.map((lang: string) => (
                        <Badge key={lang} className="bg-[var(--teal)] text-white hover:bg-[var(--teal)] border-0 text-sm py-1">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Passive Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {interpreter.languages_c?.length > 0 ? (
                      interpreter.languages_c.map((lang: string) => (
                        <Badge key={lang} variant="outline" className="border-gray-300 text-gray-600 text-sm py-1">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start bg-white p-1 rounded-xl border border-gray-100 mb-6">
            <TabsTrigger value="about" className="flex-1 md:flex-none px-8 data-[state=active]:bg-[var(--azureish-white)] data-[state=active]:text-[var(--deep-navy)]">About</TabsTrigger>
            <TabsTrigger value="availability" className="flex-1 md:flex-none px-8 data-[state=active]:bg-[var(--azureish-white)] data-[state=active]:text-[var(--deep-navy)]">Availability</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 md:flex-none px-8 data-[state=active]:bg-[var(--azureish-white)] data-[state=active]:text-[var(--deep-navy)]">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--deep-navy)]">Professional Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--medium-blue)] leading-relaxed whitespace-pre-wrap">
                  {interpreter.bio || "No biography provided."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--deep-navy)]">Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interpreter.specializations?.map((spec: string) => (
                    <Badge key={spec} variant="secondary" className="bg-[var(--azureish-white)] text-[var(--deep-navy)] hover:bg-[var(--light-teal)] px-3 py-1 text-sm">
                      {spec}
                    </Badge>
                  ))}
                  {(!interpreter.specializations || interpreter.specializations.length === 0) && (
                    <span className="text-[var(--medium-blue)]/70 italic">No specializations listed.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--deep-navy)]">
                  <CalendarIcon className="w-5 h-5 text-[var(--teal)]" />
                  Weekly Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientAvailabilityView interpreterId={interpreter.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--deep-navy)] flex items-center gap-2">
                  Client Reviews
                  <Badge variant="secondary" className="ml-2 bg-[var(--azureish-white)] text-[var(--deep-navy)]">
                    {stats.totalReviews}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-gray-100">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback className="bg-[var(--azureish-white)] text-[var(--deep-navy)]">
                              {review.reviewer?.full_name?.[0] || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-[var(--deep-navy)]">
                              {review.reviewer?.full_name || "Client"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(review.created_at), "MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <span className="font-bold text-yellow-700 text-sm">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-[var(--medium-blue)] text-sm leading-relaxed mt-3 pl-[52px]">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Star className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-[var(--deep-navy)]">No reviews yet</h3>
                    <p className="text-gray-500 mt-1">This interpreter hasn't received any reviews yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Booking Action */}
      <div className="lg:col-span-1">
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
                <span className="text-[var(--medium-blue)]">Hourly Rate</span>
                <span className="font-medium text-[var(--deep-navy)]">{interpreter.hourly_rate} TND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--medium-blue)]">Service Fee</span>
                <span className="font-medium text-[var(--deep-navy)]">15%</span>
              </div>
            </div>

            <BookingDialog 
              interpreterId={interpreter.id} 
              interpreterName={interpreter.profiles?.full_name} 
              hourlyRate={interpreter.hourly_rate} 
            />
            
            <p className="text-xs text-center text-[var(--medium-blue)]/70 mt-4">
              You won't be charged until the booking is confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
