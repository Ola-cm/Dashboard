interface Props {
  config: Record<string, string | number>;
}

export default function MapWidget({ config }: Props) {
  const from = String(config.from || "Paris 11e");
  const to = String(config.to || "La Défense");

  return (
    <div>
      {/* Fake map visual */}
      <div
        className="rounded-xl mb-3 relative overflow-hidden"
        style={{ height: 100, background: "linear-gradient(145deg, #E8DCC8 0%, #D8C3A5 100%)" }}
      >
        {/* Grid lines simulating map */}
        <svg width="100%" height="100%" viewBox="0 0 260 100" className="absolute inset-0 opacity-30">
          {[0,20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#8B5A2B" strokeWidth="0.5"/>)}
          {[0,30,60,90,120,150,180,210,240].map(x => <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#8B5A2B" strokeWidth="0.5"/>)}
        </svg>
        {/* Route line */}
        <svg width="100%" height="100%" viewBox="0 0 260 100" className="absolute inset-0">
          <path d="M30,70 C60,70 80,40 110,35 C140,30 160,45 190,35 C210,28 225,30 240,25" fill="none" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6,3"/>
          <circle cx="30" cy="70" r="5" fill="#6B4423" stroke="white" strokeWidth="1.5"/>
          <circle cx="240" cy="25" r="5" fill="#C4622D" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>

      <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: "rgba(107,68,35,0.05)" }}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6B4423" }} />
          <div className="w-0.5 h-5" style={{ background: "#D8C3A5" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#C4622D" }} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{from}</div>
          <div className="h-3" />
          <div className="text-xs font-medium" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{to}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "🚇", label: "Métro", value: "28 min", active: true },
          { icon: "🚲", label: "Vélo", value: "42 min", active: false },
          { icon: "🚗", label: "Voiture", value: "35 min", active: false },
        ].map(mode => (
          <div
            key={mode.label}
            className="rounded-xl p-2 text-center"
            style={{
              background: mode.active ? "rgba(107,68,35,0.12)" : "rgba(107,68,35,0.04)",
              border: mode.active ? "1.5px solid rgba(107,68,35,0.25)" : "1.5px solid transparent",
            }}
          >
            <div style={{ fontSize: 16 }}>{mode.icon}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{mode.value}</div>
            <div className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{mode.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
