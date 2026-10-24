-- The Pinterest service was replaced by Discord: drop what depended on it, since those widgets
-- and stored tokens can no longer be served or refreshed.
DELETE FROM "WidgetInstance" WHERE "serviceName" = 'pinterest';
DELETE FROM "ServiceSubscription" WHERE "serviceName" = 'pinterest';
