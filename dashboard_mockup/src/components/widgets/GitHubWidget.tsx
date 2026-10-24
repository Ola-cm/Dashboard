interface Props {
  config: Record<string, string | number>;
}

const HEATMAP_DATA = Array.from({ length: 7 * 15 }, (_, i) => {
  const seed = (i * 137 + 31) % 100;
  if (seed > 80) return 4;
  if (seed > 60) return 3;
  if (seed > 40) return 2;
  if (seed > 25) return 1;
  return 0;
});

const COMMITS = [
  { repo: "camilledurand/portfolio", message: "feat: dark mode toggle", time: "il y a 2h", sha: "3a4f9c" },
  { repo: "camilledurand/api-kit", message: "fix: rate limiter bug", time: "il y a 5h", sha: "8d2e1a" },
  { repo: "camilledurand/dotfiles", message: "chore: update zshrc aliases", time: "Hier", sha: "1b7f3c" },
];

const HEAT_COLORS = ["rgba(107,68,35,0.06)", "rgba(107,68,35,0.2)", "rgba(107,68,35,0.4)", "rgba(107,68,35,0.65)", "#6B4423"];

export default function GitHubWidget({ config }: Props) {
  const username = String(config.username || "user");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full" style={{ background: "#3B2A1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#F5EFE6", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>
            {username.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{username}</div>
          <div className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>347 contributions cette année</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-4 overflow-x-auto">
        <div style={{ display: "grid", gridTemplateRows: "repeat(7, 10px)", gridAutoFlow: "column", gap: 2, width: "fit-content" }}>
          {HEATMAP_DATA.map((level, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: HEAT_COLORS[level],
                border: "1px solid rgba(107,68,35,0.08)",
              }}
              title={`${level} contributions`}
            />
          ))}
        </div>
      </div>

      {/* Recent commits */}
      <div className="space-y-2">
        {COMMITS.map(commit => (
          <div key={commit.sha} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: "rgba(107,68,35,0.05)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="4" stroke="#8B5A2B" strokeWidth="1.5"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#8B5A2B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{commit.message}</div>
              <div className="text-xs truncate" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{commit.repo} · {commit.time}</div>
            </div>
            <code className="text-xs shrink-0" style={{ color: "#C49060", fontFamily: "monospace" }}>{commit.sha}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
