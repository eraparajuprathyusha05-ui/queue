function LocationSelector({ locations, onChange, selectedLocationId }) {
  return (
    <label className="flex flex-1 flex-col gap-2 font-body text-sm text-slate-300">
      Select a location
      <select
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
        onChange={(event) => onChange(event.target.value)}
        value={selectedLocationId}
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name} ({location.category})
          </option>
        ))}
      </select>
    </label>
  );
}

export default LocationSelector;
