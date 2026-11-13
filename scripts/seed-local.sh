#!/usr/bin/env bash
# Seed a local SnapShare API. The Laravel repo is separate and is not modified upstream.
# Usage: SNAPSHARE_SERVER=/path/to/snapshare-server bash scripts/seed-local.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="${SNAPSHARE_SERVER:-$HOME/snapshare-server}"
PHOTOS="$ROOT/apps/web/public/assets/marketing/album-02.jpg,$ROOT/apps/web/public/assets/marketing/album-03.jpg,$ROOT/apps/web/public/assets/marketing/album-13.jpg,$ROOT/apps/web/public/assets/marketing/photo-hat.jpg"

if [[ ! -f "$SERVER/artisan" ]]; then
  echo "Clone https://github.com/albalakg/snapshare-server into $SERVER first." >&2
  exit 1
fi

cd "$SERVER"
cp "$ROOT/scripts/LocalHostSeeder.php" "$SERVER/database/seeders/LocalHostSeeder.php"
export SNAPSHARE_PHOTOS="$PHOTOS"
php artisan db:seed --class=LocalHostSeeder --force
echo "Host: host@snapshare.test / Test1234!"
echo "Empty account: empty@snapshare.test / Test1234!"
echo "Guest album path: amit-gal"
