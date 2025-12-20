import { MissionCard } from "@/components/mission-card"

interface MissionListProps {
  missions: any[]
  viewMode?: 'interpreter' | 'client'
}

export function MissionList({ missions, viewMode = 'interpreter' }: MissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="p-12 border border-dashed border-gray-200 rounded-xl bg-white text-center">
        <div className="mx-auto h-12 w-12 text-gray-300 mb-3 flex items-center justify-center bg-[var(--azureish-white)] rounded-full">
           <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-medium text-[var(--deep-navy)]">No missions found</h3>
        <p className="text-gray-500 mt-1">Your mission history will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} viewMode={viewMode} />
      ))}
    </div>
  )
}
