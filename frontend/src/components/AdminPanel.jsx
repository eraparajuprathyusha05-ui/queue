import { useState } from "react";

function AdminPanel({ isSaving, locations, onAddLocation, onResetQueue }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hospital");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoFenceRadiusMeters, setGeoFenceRadiusMeters] = useState("250");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    await onAddLocation({
      name: name.trim(),
      category,
      lat: Number(lat),
      lng: Number(lng),
      geoFenceRadiusMeters: Number(geoFenceRadiusMeters),
    });

    setName("");
    setCategory("Hospital");
    setLat("");
    setLng("");
    setGeoFenceRadiusMeters("250");
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold text-white">Admin Panel</h2>
        <p className="font-body text-sm text-slate-400">
          Add locations with coordinates, view live queue stats, and reset stale queue
          data.
        </p>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
          onChange={(event) => setName(event.target.value)}
          placeholder="New location name"
          value={name}
        />
        <select
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option>Hospital</option>
          <option>Bank</option>
          <option>Canteen</option>
          <option>Other</option>
        </select>
        <input
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
          onChange={(event) => setLat(event.target.value)}
          placeholder="Latitude, for example 28.6139"
          value={lat}
        />
        <input
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
          onChange={(event) => setLng(event.target.value)}
          placeholder="Longitude, for example 77.2090"
          value={lng}
        />
        <input
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
          min="50"
          onChange={(event) => setGeoFenceRadiusMeters(event.target.value)}
          placeholder="GPS radius in meters"
          type="number"
          value={geoFenceRadiusMeters}
        />
        <button
          className="rounded-2xl bg-white px-4 py-3 font-body text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : "Add Location"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  {location.name}
                </h3>
                <p className="font-body text-sm text-slate-400">
                  {location.category} | {location.estimatedPeople} people |{" "}
                  {location.waitingTime} mins | GPS crowd {location.gpsCrowdCount || 0}
                </p>
              </div>
              <button
                className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-2 font-body text-sm text-rose-100 transition hover:bg-rose-400/20"
                onClick={() => onResetQueue(location.id)}
                type="button"
              >
                Reset Queue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;
