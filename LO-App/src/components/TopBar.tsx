type TopBarProps = {
  onOpenHelp: () => void;
  onOpenResources: () => void;
};

export default function TopBar({ onOpenHelp, onOpenResources }: TopBarProps) {
  return (
    <div className="shrink-0 bg-[#1e2d40] text-white flex items-center justify-between px-5 py-3 z-10 shadow-md">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold tracking-tight">Learning Outcomes Browser</h1>
        <span className="text-gray-500 select-none">|</span>
        <span className="text-sm text-gray-400">Irish HE Corpus · 233,005 LOs · 16 institutions</span>
      </div>

      <nav className="flex items-center gap-2">
        <a
          href={`${import.meta.env.BASE_URL}paper.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="text-base leading-none">📄</span>
          Paper
          <span className="text-xs text-gray-500 ml-0.5">Draft · 20 April 2026</span>
        </a>
        <button
          onClick={onOpenResources}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="text-base leading-none">📚</span>
          References
        </button>
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-xs leading-none">?</span>
          Help
        </button>
      </nav>
    </div>
  );
}
