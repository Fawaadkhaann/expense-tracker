function Skeleton({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg bg-line/70 motion-safe:animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      className="flex min-h-screen bg-canvas"
    >
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-nav-border bg-nav-surface p-5 lg:flex">
        <div className="flex items-center gap-3 border-b border-nav-border pb-5">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="mb-5 h-3 w-16" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="mt-auto flex items-center gap-3 border-t border-nav-border pt-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[4.5rem] items-center gap-3 border-b border-line bg-card px-4 sm:px-6">
          <Skeleton className="h-9 w-9 rounded-xl lg:hidden" />
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] space-y-7 bg-canvas px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
          <div className="ledger-card space-y-3 border-line bg-card p-6 sm:p-8">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-52 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="ledger-card space-y-4 border-line bg-card p-5 sm:p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80 max-w-full" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-20 w-full rounded-xl"
                />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.85fr)]">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
          <p className="sr-only">Loading your expenses…</p>
        </main>
      </div>
    </div>
  );
}
