export default function JEBBadge({ score = 87, size = "md" }: { score?: number; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { outer: "w-16 h-16", inner: "w-10 h-10", score: "text-lg", label: "text-[8px]", ring: 3 },
    md: { outer: "w-24 h-24", inner: "w-16 h-16", score: "text-2xl", label: "text-[9px]", ring: 4 },
    lg: { outer: "w-32 h-32", inner: "w-20 h-20", score: "text-3xl", label: "text-[10px]", ring: 5 },
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * 36;
  const dash = (score / 100) * circumference;

  return (
    <div className={`relative ${s.outer} flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#E4EBF5" strokeWidth={s.ring} />
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke="#C75B00" strokeWidth={s.ring}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className={`${s.inner} rounded-full bg-[#1B3A6B] flex flex-col items-center justify-center z-10`}>
        <span className={`${s.score} font-bold text-white leading-none`} style={{ fontFamily: "var(--font-heading)" }}>{score}</span>
        <span className={`${s.label} text-[#FFC299] font-semibold tracking-widest uppercase`} style={{ fontFamily: "var(--font-heading)" }}>PA</span>
      </div>
    </div>
  );
}
