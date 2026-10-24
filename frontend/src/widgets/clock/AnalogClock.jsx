import WidgetFrame from '../WidgetFrame';

function handPoint(angleDeg, length) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + length * Math.cos(rad), y: 50 + length * Math.sin(rad) };
}

export default function AnalogClock({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => {
        // Each hand factors in the finer units below it (seconds into the minute hand, minutes
        // into the hour hand) so the hands sit where a real clock's would at that instant.
        const secondAngle = d.seconds * 6;
        const minuteAngle = (d.minutes + d.seconds / 60) * 6;
        const hourAngle = ((d.hours % 12) + d.minutes / 60 + d.seconds / 3600) * 30;
        const hourHand = handPoint(hourAngle, 24);
        const minuteHand = handPoint(minuteAngle, 34);
        const secondHand = handPoint(secondAngle, 38);

        return (
          <div className="flex h-full flex-col items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-brown-200"
              />
              {Array.from({ length: 12 }).map((_, i) => {
                const { x, y } = handPoint(i * 30, 40);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="currentColor"
                    className="text-brown-300"
                  />
                );
              })}
              <line
                x1="50"
                y1="50"
                x2={hourHand.x}
                y2={hourHand.y}
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-brown-800"
              />
              <line
                x1="50"
                y1="50"
                x2={minuteHand.x}
                y2={minuteHand.y}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-brown-600"
              />
              <line
                x1="50"
                y1="50"
                x2={secondHand.x}
                y2={secondHand.y}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-terracotta"
              />
              <circle cx="50" cy="50" r="2.5" fill="currentColor" className="text-brown-800" />
            </svg>
            <p className="mt-1 text-[11px] text-brown-400">{d.timezone}</p>
          </div>
        );
      }}
    </WidgetFrame>
  );
}
