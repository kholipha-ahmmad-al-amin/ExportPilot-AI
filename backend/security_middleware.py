"""Streaming-safe request guards for browser sessions and response hygiene."""

import uuid
from urllib.parse import urlsplit

from starlette.datastructures import Headers, MutableHeaders
from starlette.responses import JSONResponse


class BrowserSecurityMiddleware:
    def __init__(self, app, trusted_origins: list[str]):
        self.app = app
        self.trusted_origins = {origin.rstrip("/") for origin in trusted_origins if origin != "*"}

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = Headers(scope=scope)
        path = scope.get("path", "")
        request_id = str(uuid.uuid4())

        async def secure_send(message):
            if message["type"] == "http.response.start":
                outgoing = MutableHeaders(scope=message)
                outgoing["X-Request-ID"] = request_id
                outgoing["X-Content-Type-Options"] = "nosniff"
                outgoing["Referrer-Policy"] = "strict-origin-when-cross-origin"
                if path.startswith("/api/"):
                    outgoing["Cache-Control"] = "no-store"
            await send(message)

        unsafe = scope.get("method") not in {"GET", "HEAD", "OPTIONS"}
        # Bearer-only clients do not rely on ambient browser credentials.
        bearer_only = headers.get("authorization", "").lower().startswith("bearer ") and not headers.get("cookie")
        if path.startswith("/api/") and unsafe and not bearer_only:
            origin = headers.get("origin")
            fetch_site = headers.get("sec-fetch-site", "")
            allowed = origin in self.trusted_origins if origin else fetch_site != "cross-site"
            if origin and not allowed:
                parsed = urlsplit(origin)
                host = headers.get("host", "")
                # Same host over HTTPS, or the exact development HTTP origin.
                allowed = bool(
                    parsed.netloc == host
                    and not parsed.username and not parsed.password
                    and parsed.path in {"", "/"} and not parsed.query and not parsed.fragment
                    and (parsed.scheme == "https" or (parsed.scheme == scope.get("scheme") == "http" and parsed.hostname in {"localhost", "127.0.0.1", "testserver"}))
                )
            if not allowed:
                response = JSONResponse(
                    status_code=403, media_type="application/problem+json",
                    content={"type": "about:blank", "title": "Forbidden", "status": 403,
                             "detail": "This browser request is not from a trusted site.", "instance": path},
                )
                await response(scope, receive, secure_send)
                return
        await self.app(scope, receive, secure_send)
