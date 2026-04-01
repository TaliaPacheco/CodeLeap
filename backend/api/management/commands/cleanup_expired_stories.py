from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import Story


class Command(BaseCommand):
    help = 'Delete stories older than 24 hours'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=24)
        result = Story.objects.filter(created_at__lt=cutoff).delete()
        count = result[0]
        self.stdout.write(f'Deleted {count} expired stories')
