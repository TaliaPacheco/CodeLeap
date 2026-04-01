#!/bin/sh
set -e

python manage.py migrate --noinput

# Set up cron job for story cleanup (every hour)
echo "0 * * * * cd /app && python manage.py cleanup_expired_stories >> /var/log/cron.log 2>&1" | crontab -
cron

exec daphne -b 0.0.0.0 -p 8000 codeleap.asgi:application
