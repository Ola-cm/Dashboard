interface Props {
  config: Record<string, string | number>;
}

const WEATHER_DATA: Record<string, { temp: number; desc: string; icon: string; feels: number; humidity: number; forecast: { day: string; icon: string; high: number; low: number }[] }> = {
  Paris: {
    temp: 18, desc: "Partiellement nuageux", icon: "🌤", feels: 16, humidity: 72,
    forecast: [
      { day: "Ven", icon: "🌧", high: 16, low: 11 },
      { day: "Sam", icon: "☀️", high: 22, low: 14 },
      { day: "Dim", icon: "🌤", high: 20, low: 13 },
    ],
  },
  Tokyo: {
    temp: 27, desc: "Ensoleillé", icon: "☀️", feels: 29, humidity: 58,
    forecast: [
      { day: "Ven", icon: "⛅", high: 25, low: 19 },
      { day: "Sam", icon: "🌧", high: 23, low: 18 },
      { day: "Dim", icon: "☀️", high: 28, low: 21 },
    ],
  },
};

export default function WeatherWidget({ config }: Props) {
  const city = String(config.city || "Paris");
  const data = WEATHER_DATA[city] || WEATHER_DATA.Paris;

  return (
    <div>
      <div className="flex items-end gap-3 mb-3">
        <span style={{ fontSize: 48, lineHeight: 1 }}>{data.icon}</span>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 600, color: "#3B2A1E", lineHeight: 1 }}>
            {data.temp}°C
          </div>
          <div style={{ color: "#8B6A4A", fontSize: 12, fontFamily: "var(--font-ui)", marginTop: 2 }}>{data.desc}</div>
        </div>
      </div>
      <div className="flex gap-3 mb-3">
        <span className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>Ressenti {data.feels}°C</span>
        <span className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>Humidité {data.humidity}%</span>
      </div>
      <div className="flex gap-2">
        {data.forecast.map(f => (
          <div
            key={f.day}
            className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2"
            style={{ background: "rgba(107,68,35,0.06)" }}
          >
            <span className="text-xs font-medium" style={{ color: "#8B6A4A", fontFamily: "var(--font-ui)" }}>{f.day}</span>
            <span style={{ fontSize: 16 }}>{f.icon}</span>
            <span className="text-xs font-semibold" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{f.high}°</span>
            <span className="text-xs" style={{ color: "#C49060", fontFamily: "var(--font-ui)" }}>{f.low}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
