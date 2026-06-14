export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-zinc-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-muro" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
