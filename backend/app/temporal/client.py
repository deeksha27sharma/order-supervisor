from temporalio.client import Client

from app.config import settings

_client: Client | None = None


async def get_temporal_client() -> Client:
    """Returns a shared Temporal client, creating it on first call."""
    global _client
    if _client is None:
        _client = await Client.connect(settings.temporal_address)
    return _client