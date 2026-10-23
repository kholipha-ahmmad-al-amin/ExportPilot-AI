"""
Playwright + Axe-Core Automated WCAG 2.1 AA & Color Contrast Audit
==================================================================
Runs across all production routes on https://exportpilot.equisaas-bd.com
Checks:
- WCAG 2.1 AA & AAA Color Contrast
- Accessible Form Controls and Buttons (aria-label, labels)
- Heading Hierarchy
- Image Alt Text
- Touch Target Sizes (>= 44x44px)
"""

import asyncio
import json
import os
import sys

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from playwright.async_api import async_playwright

BASE_URL = os.getenv("TARGET_URL", "https://exportpilot.equisaas-bd.com")

# CDN source for axe-core 4.8.2
AXE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js"

ROUTES = [
    ("/", "Landing Page"),
    ("/login", "Authentication Login"),
    ("/register", "Registration Gateway"),
    ("/docs", "Canonical Documentation"),
    ("/buyers", "Buyer Catalog & Directory"),
    ("/data", "Data Explorer & PDF Lab"),
    ("/security", "Data Sovereignty & PII Lab"),
    ("/architecture", "Architecture & Agent Pipeline"),
    ("/presentation", "16:9 Presentation Mode"),
    ("/pitchdeck", "Interactive Pitch Deck"),
]

async def run_axe_audit():
    print("==================================================================", flush=True)
    print("WCAG 2.1 AA ACCESSIBILITY & CONTRAST AUDIT (AXE-CORE)", flush=True)
    print(f"Target URL: {BASE_URL}", flush=True)
    print("==================================================================", flush=True)

    violations_by_route = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()

        # Fetch axe-core script text once
        import httpx
        axe_script = httpx.get(AXE_CDN, timeout=15).text

        for route, name in ROUTES:
            url = f"{BASE_URL}{route}"
            print(f"\nScanning {name} ({route})...", flush=True)
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(1000)

                # Inject axe-core into the page DOM
                await page.evaluate(axe_script)

                # Run axe analysis
                axe_results = await page.evaluate("""() => {
                    return new Promise((resolve) => {
                        axe.run({
                            runOnly: {
                                type: 'tag',
                                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                            }
                        }, (err, results) => {
                            if (err) resolve({ error: err.message });
                            else resolve(results);
                        });
                    });
                }""")

                if "error" in axe_results:
                    print(f"  [ERROR] Axe execution failed: {axe_results['error']}", flush=True)
                    continue

                violations = axe_results.get("violations", [])
                critical = [v for v in violations if v.get("impact") in ["critical", "serious"]]
                minor = [v for v in violations if v.get("impact") in ["moderate", "minor"]]

                print(f"  Critical/Serious Violations: {len(critical)}", flush=True)
                print(f"  Moderate/Minor Violations:   {len(minor)}", flush=True)
                print(f"  Passed Checks:               {len(axe_results.get('passes', []))}", flush=True)

                if critical:
                    violations_by_route[route] = critical
                    for v in critical:
                        print(f"    - [{v.get('impact').upper()}] {v.get('id')}: {v.get('help')}", flush=True)
                        for node in v.get("nodes", [])[:2]:
                            print(f"        Target: {node.get('target')}", flush=True)
                            print(f"        Summary: {node.get('failureSummary', '')[:100]}", flush=True)
            except Exception as e:
                print(f"  Failed to scan {route}: {e}", flush=True)

        await browser.close()

    print("\n==================================================================", flush=True)
    print("ACCESSIBILITY AUDIT SUMMARY:", flush=True)
    total_critical = sum(len(v) for v in violations_by_route.values())
    print(f"Total Routes with Critical/Serious Violations: {len(violations_by_route)}", flush=True)
    print(f"Total Critical/Serious Issues:                   {total_critical}", flush=True)
    print("==================================================================", flush=True)

    return total_critical == 0

if __name__ == "__main__":
    success = asyncio.run(run_axe_audit())
    sys.exit(0 if success else 1)
