import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
from backend.main import app

async def test():
    print("Test started...", flush=True)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("Sending health check...", flush=True)
        res = await client.get("/api/v1/health")
        print("Health status:", res.status_code, res.json(), flush=True)

if __name__ == "__main__":
    asyncio.run(test())
