import { useEffect, useState } from "react";

function LastUpdatedBadge({ lastUpdated }) {
  const [label, setLabel] = useState("Waiting for updates");

  useEffect(() => {
    function updateLabel() {
      if (!lastUpdated) {
        setLabel("Waiting for updates");
        return;
      }

      const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000)
      );

      setLabel(`Last updated ${seconds} seconds ago`);
    }

    updateLabel();
    const timer = window.setInterval(updateLabel, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [lastUpdated]);

  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-body text-sm text-slate-300">
      {label}
    </div>
  );
}

export default LastUpdatedBadge;
