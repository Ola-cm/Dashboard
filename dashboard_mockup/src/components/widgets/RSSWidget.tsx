interface Props {
  config: Record<string, string | number>;
}

const ARTICLES = [
  { title: "L'IA générative transforme les pratiques des développeurs", source: "Le Monde Tech", time: "il y a 1h", tag: "IA" },
  { title: "Rust dépasse Python dans les préférences des ingénieurs séniors", source: "Le Monde Tech", time: "il y a 3h", tag: "Dev" },
  { title: "WebAssembly 2.0 : ce que ça change pour le web", source: "Le Monde Tech", time: "Hier", tag: "Web" },
  { title: "Apple Silicon M4 : les benchmarks complets", source: "Le Monde Tech", time: "Hier", tag: "Hardware" },
  { title: "Open source : GitHub atteint 200 millions de repositories", source: "Le Monde Tech", time: "2j", tag: "Open Source" },
];

const TAG_COLORS: Record<string, string> = {
  IA: "#C4622D",
  Dev: "#7A8C5C",
  Web: "#8B5A2B",
  Hardware: "#A97040",
  "Open Source": "#6B4423",
};

export default function RSSWidget({ config }: Props) {
  const count = Number(config.count || 5);
  const articles = ARTICLES.slice(0, count);

  return (
    <div className="space-y-2">
      {articles.map((a, i) => (
        <div key={i} className="flex items-start gap-2.5 py-2 border-b last:border-0" style={{ borderColor: "rgba(107,68,35,0.1)" }}>
          <div className="flex-1 min-w-0">
            <button className="text-sm font-medium text-left leading-snug hover:underline" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>
              {a.title}
            </button>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: `${TAG_COLORS[a.tag] || "#8B5A2B"}18`, color: TAG_COLORS[a.tag] || "#8B5A2B", fontFamily: "var(--font-ui)" }}
              >
                {a.tag}
              </span>
              <span className="text-xs" style={{ color: "#C49060", fontFamily: "var(--font-ui)" }}>{a.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
