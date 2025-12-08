import { AvailabilityCalendar } from "@/components/availability-calendar"

export default function InterpreterAvailabilityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Availability</h1>
      <p className="text-gray-500">Manage your availability slots for bookings.</p>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <AvailabilityCalendar />
      </div>
    </div>
  )
}
