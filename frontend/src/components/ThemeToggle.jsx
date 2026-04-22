import { Moon, Sun } from "lucide-react";

function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 font-body text-sm text-white transition hover:bg-white/20"
      onClick={onToggle}
      type="button"
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      {isDarkMode ? "Light mode" : "Dark mode"}
    </button>
  );
}

export default ThemeToggle;
