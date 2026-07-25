export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-5 py-6 text-sm text-mute">
        <span className="font-display font-semibold text-ink">Adopta</span>
        <span>A demo project</span>
        <span>{year}</span>
      </div>
    </footer>
  )
}
