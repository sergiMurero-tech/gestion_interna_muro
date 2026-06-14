export default function LicenseBadge({ has }: { has: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        has ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${has ? 'bg-green-500' : 'bg-red-500'}`} />
      {has ? 'Licencia disponible' : 'Sin licencia'}
    </span>
  )
}
