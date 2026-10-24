interface Props {
  config: Record<string, string | number>;
}

const STOCKS = [
  { ticker: "AAPL", name: "Apple", price: 187.42, change: +1.23, pct: +0.66, color: "#7A8C5C" },
  { ticker: "BTC", name: "Bitcoin", price: 67840, change: -820, pct: -1.19, color: "#C4622D" },
  { ticker: "NVDA", name: "Nvidia", price: 875.3, change: +12.5, pct: +1.45, color: "#7A8C5C" },
];

const MINI_CHART_PATHS: Record<string, { d: string; up: boolean }> = {
  AAPL: { d: "M0,30 L8,25 L16,28 L24,20 L32,22 L40,15 L48,18 L56,10 L64,14 L72,8", up: true },
  BTC: { d: "M0,10 L8,12 L16,8 L24,15 L32,18 L40,22 L48,20 L56,25 L64,28 L72,30", up: false },
  NVDA: { d: "M0,28 L8,24 L16,20 L24,22 L32,16 L40,12 L48,14 L56,8 L64,10 L72,6", up: true },
};

export default function StockWidget({ config }: Props) {
  const tickers = [String(config.ticker || "AAPL"), String(config.ticker2 || "BTC")];
  const stocks = STOCKS.filter(s => tickers.includes(s.ticker));

  return (
    <div className="space-y-3">
      {stocks.map(stock => {
        const chart = MINI_CHART_PATHS[stock.ticker];
        return (
          <div key={stock.ticker} className="p-3 rounded-xl" style={{ background: "rgba(107,68,35,0.05)" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{stock.ticker}</div>
                <div className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>
                  {stock.price.toLocaleString("fr-FR")} $
                </div>
                <div className="text-xs font-medium" style={{ color: stock.color, fontFamily: "var(--font-ui)" }}>
                  {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.pct > 0 ? "+" : ""}{stock.pct.toFixed(2)}%)
                </div>
              </div>
            </div>
            {chart && (
              <svg width="100%" height="32" viewBox="0 0 72 36" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stock.color} stopOpacity="0.2"/>
                    <stop offset="100%" stopColor={stock.color} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d={`${chart.d} L72,36 L0,36 Z`}
                  fill={`url(#grad-${stock.ticker})`}
                />
                <path
                  d={chart.d}
                  fill="none"
                  stroke={stock.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
