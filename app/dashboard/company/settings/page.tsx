export default function CompanySettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Settings</h1>
      <p className="text-gray-500">Manage your account settings and preferences.</p>
      <div className="p-12 border border-dashed border-gray-200 rounded-xl bg-white text-center">
        <div className="mx-auto h-12 w-12 text-gray-300 mb-3 flex items-center justify-center bg-[var(--azureish-white)] rounded-full">
           <span className="text-2xl">⚙️</span>
        </div>
        <h3 className="text-lg font-medium text-[var(--deep-navy)]">Settings coming soon</h3>
        <p className="text-gray-500 mt-1">We are working on adding more configuration options.</p>
      </div>
    </div>
  )
}
