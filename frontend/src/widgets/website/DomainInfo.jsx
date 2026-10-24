import WidgetFrame from '../WidgetFrame';

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : null;
}

function Row({ label, children }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-brown-400">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-brown-800">{children}</dd>
    </div>
  );
}

export default function DomainInfo({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => {
        const expiringSoon = d.daysUntilExpiry !== null && d.daysUntilExpiry < 30;
        return (
          <div className="flex h-full flex-col gap-2 overflow-hidden">
            <p className="truncate font-display text-base font-semibold text-brown-800">{d.domain}</p>
            <dl className="space-y-1 text-xs">
              {d.registeredAt && (
                <Row label="Registered">
                  {formatDate(d.registeredAt)}
                  {d.ageYears !== null && (
                    <span className="text-brown-400"> · {d.ageYears} yr</span>
                  )}
                </Row>
              )}
              {d.expiresAt && (
                <Row label="Expires">
                  <span className={expiringSoon ? 'font-medium text-terracotta' : undefined}>
                    {formatDate(d.expiresAt)}
                  </span>
                  <span className="text-brown-400"> · in {d.daysUntilExpiry} days</span>
                </Row>
              )}
              {d.registrar && <Row label="Registrar">{d.registrar}</Row>}
              {d.nameservers.length > 0 && (
                <Row label="DNS">{d.nameservers.slice(0, 2).join(', ')}</Row>
              )}
              {d.updatedAt && <Row label="Updated">{formatDate(d.updatedAt)}</Row>}
            </dl>
          </div>
        );
      }}
    </WidgetFrame>
  );
}
