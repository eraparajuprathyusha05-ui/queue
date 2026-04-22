import AdminPanel from "../components/AdminPanel";
import GpsCrowdPanel from "../components/GpsCrowdPanel";
import LastUpdatedBadge from "../components/LastUpdatedBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import LocationSelector from "../components/LocationSelector";
import MetricCard from "../components/MetricCard";
import QueueChart from "../components/QueueChart";
import ThemeToggle from "../components/ThemeToggle";
import UpdateQueueForm from "../components/UpdateQueueForm";

function DashboardPage({
  error,
  gpsStatus,
  isDarkMode,
  isLoading,
  isSaving,
  locations,
  notification,
  onAddLocation,
  onResetQueue,
  onSelectLocation,
  onStartGpsSharing,
  onToggleTheme,
  onUpdateQueue,
  selectedLocation,
  selectedLocationId,
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(135deg,_#020617,_#111827_55%,_#0f172a)] text-slate-100 transition-colors dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="font-body text-sm uppercase tracking-[0.35em] text-cyan-300">
                Smart Queue Prediction
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                QueueSmart Pro
              </h1>
              <p className="max-w-2xl font-body text-sm text-slate-300 sm:text-base">
                Monitor live footfall, predict waiting time, and keep teams ahead of crowd
                spikes from one polished command center.
              </p>
            </div>

            <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
          </div>
        </header>

        {notification ? (
          <div className="animate-pulse rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 font-body text-sm text-emerald-100">
            {notification}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 font-body text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <LocationSelector
                  locations={locations}
                  onChange={onSelectLocation}
                  selectedLocationId={selectedLocationId}
                />
                <LastUpdatedBadge lastUpdated={selectedLocation?.lastUpdated} />
              </div>

              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <MetricCard
                      accent="cyan"
                      label="Estimated People"
                      value={selectedLocation?.estimatedPeople ?? 0}
                    />
                    <MetricCard
                      accent="amber"
                      label="Waiting Time"
                      suffix=" mins"
                      value={selectedLocation?.waitingTime ?? 0}
                    />
                    <MetricCard
                      accent={
                        selectedLocation?.crowdLevel === "High"
                          ? "rose"
                          : selectedLocation?.crowdLevel === "Medium"
                            ? "amber"
                            : "emerald"
                      }
                      label="Crowd Level"
                      value={selectedLocation?.crowdLevel ?? "Low"}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <MetricCard
                      accent="emerald"
                      label="GPS Crowd Signals"
                      value={selectedLocation?.gpsCrowdCount ?? 0}
                    />
                    <MetricCard
                      accent="cyan"
                      label="Blended Active Users"
                      value={selectedLocation?.blendedActiveUsers ?? 0}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
              <div className="mb-4">
                <h2 className="font-display text-2xl font-semibold text-white">
                  Queue Analytics
                </h2>
                <p className="font-body text-sm text-slate-400">
                  Watch queue size movement over time and spot the next surge early.
                </p>
              </div>
              <QueueChart history={selectedLocation?.history || []} />
            </div>
          </div>

          <div className="space-y-6">
            <GpsCrowdPanel
              gpsStatus={gpsStatus}
              onStartGpsSharing={onStartGpsSharing}
              selectedLocation={selectedLocation}
            />
            <UpdateQueueForm isSaving={isSaving} onSubmit={onUpdateQueue} />
            <AdminPanel
              isSaving={isSaving}
              locations={locations}
              onAddLocation={onAddLocation}
              onResetQueue={onResetQueue}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
