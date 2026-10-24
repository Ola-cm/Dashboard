-- The Spotify service was removed: drop what depended on it, since those widgets and stored
-- tokens can no longer be served or refreshed.
DELETE FROM "WidgetInstance" WHERE "serviceName" = 'spotify';
DELETE FROM "ServiceSubscription" WHERE "serviceName" = 'spotify';
