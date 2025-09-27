export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-container animate-in fade-in duration-200">
      {children}
    </div>
  )
}