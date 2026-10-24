import WidgetFrame from '../WidgetFrame';

const SEVERITY_COLOR = {
  critical: 'text-red-600',
  high: 'text-terracotta',
  medium: 'text-amber-600',
  low: 'text-brown-500',
};

export default function SecurityAlerts({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(alerts) =>
        alerts.length === 0 ? (
          <p className="text-sm text-olive">No open alerts.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {alerts.map((alert) => (
              <li key={alert.number} className="border-b border-card-2 pb-1 last:border-0">
                <p className="truncate text-brown-800">{alert.summary}</p>
                <p
                  className={`text-xs font-medium ${SEVERITY_COLOR[alert.severity] || 'text-brown-500'}`}
                >
                  {alert.severity}
                </p>
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
