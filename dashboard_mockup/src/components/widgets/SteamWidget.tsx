interface Props {
  config: Record<string, string | number>;
}

export default function SteamWidget({ config }: Props) {
  const game = String(config.game || "Hollow Knight");

  return (
    <div>
      <div
        className="rounded-xl overflow-hidden mb-3 relative"
        style={{ height: 90, background: "linear-gradient(135deg, #2A1D14 0%, #3B2A1E 100%)" }}
      >
        <div className="absolute inset-0 flex items-center px-4 gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.1)", fontSize: 28 }}
          >
            🎮
          </div>
          <div>
            <div className="font-semibold text-sm mb-1" style={{ color: "#F5EFE6", fontFamily: "var(--font-ui)" }}>{game}</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#7A8C5C" }} />
              <span className="text-xs" style={{ color: "#A0B580", fontFamily: "var(--font-ui)" }}>En cours de jeu</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Temps total", value: "47h 23min" },
          { label: "2 semaines", value: "8h 12min" },
          { label: "Succès", value: "23 / 63" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(107,68,35,0.06)" }}>
            <div className="text-sm font-semibold" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{stat.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(107,68,35,0.1)" }}>
          <div className="h-full rounded-full" style={{ background: "#8B5A2B", width: "37%" }} />
        </div>
        <span className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>37% succès</span>
      </div>
    </div>
  );
}
