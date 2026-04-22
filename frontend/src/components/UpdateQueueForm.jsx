import { useState } from "react";

function UpdateQueueForm({ isSaving, onSubmit }) {
  const [people, setPeople] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (people === "") {
      return;
    }

    await onSubmit(Number(people));
    setPeople("");
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold text-white">Update Queue</h2>
        <p className="font-body text-sm text-slate-400">
          Add a new manual observation. The backend keeps only the latest 10 entries.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 font-body text-sm text-slate-300">
          People observed
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70"
            min="0"
            onChange={(event) => setPeople(event.target.value)}
            placeholder="Enter the queue count"
            type="number"
            value={people}
          />
        </label>

        <button
          className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-body text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving update..." : "Push Queue Update"}
        </button>
      </form>
    </div>
  );
}

export default UpdateQueueForm;
