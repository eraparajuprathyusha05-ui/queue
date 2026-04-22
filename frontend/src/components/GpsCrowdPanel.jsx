function GpsCrowdPanel({ gpsStatus, onStartGpsSharing, selectedLocation }) {
  const hasCoordinates =
    Boolean(selectedLocation?.coordinates?.lat) &&
    Boolean(selectedLocation?.coordinates?.lng);

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold text-white">GPS Crowd Signal</h2>
        <p className="font-body text-sm text-slate-400">
          Share your live position to help estimate crowd density near this location,
          similar to traffic heatmaps but for queue presence.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 font-body text-sm text-slate-300">
          {hasCoordinates
            ? `Tracking radius: ${selectedLocation?.geoFenceRadiusMeters || 250} meters around ${selectedLocation?.name}.`
            : "This location does not have coordinates yet. Add latitude and longitude from the Admin Panel first."}
        </div>

        <button
          className="w-full rounded-2xl bg-emerald-300 px-4 py-3 font-body text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={!hasCoordinates}
          onClick={onStartGpsSharing}
          type="button"
        >
          Start GPS Crowd Sharing
        </button>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 font-body text-sm text-emerald-100">
          {gpsStatus}
        </div>
      </div>
    </div>
  );
}

export default GpsCrowdPanel;
