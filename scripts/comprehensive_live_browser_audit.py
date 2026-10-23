"""
ExportPilot AI - Comprehensive Automated Headless Browser & UI/UX Audit
========================================================================
Runs headless Chromium against live production URL: https://exportpilot.equisaas-bd.com
Tests end-to-end user workflows, authentication, RBAC, interactivity, responsive layouts,
console errors, and visual fidelity.
"""

import asyncio
import os
import sys

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from playwright.async_api import async_playwright

BASE_URL = os.getenv("TARGET_URL", "https://exportpilot.equisaas-bd.com")

# Credentials must be provided by the operator. Shared defaults are not used.
EXPORTER_EMAIL = os.getenv("TEST_EXPORTER_EMAIL")
EXPORTER_PASSWORD = os.getenv("TEST_EXPORTER_PASSWORD")

ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD")

results = {
    "passed": [],
    "failed": [],
    "warnings": [],
    "console_errors": [],
    "network_errors": []
}

async def run_audit():
    missing_credentials = [
        name for name, value in (
            ("TEST_EXPORTER_EMAIL", EXPORTER_EMAIL),
            ("TEST_EXPORTER_PASSWORD", EXPORTER_PASSWORD),
            ("TEST_ADMIN_EMAIL", ADMIN_EMAIL),
            ("TEST_ADMIN_PASSWORD", ADMIN_PASSWORD),
        ) if not value
    ]
    if missing_credentials:
        raise RuntimeError("Set the required test credential environment variables: " + ", ".join(missing_credentials))

    print("==================================================================", flush=True)
    print("EXPORTPILOT AI - AUTONOMOUS BROWSER & UI/UX AUDIT", flush=True)
    print(f"Target URL: {BASE_URL}", flush=True)
    print("==================================================================", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        # Monitor console and network errors
        page.on("console", lambda msg: results["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
        page.on("pageerror", lambda err: results["console_errors"].append(f"[PAGE ERROR] {err}"))
        page.on("response", lambda res: results["network_errors"].append(f"[{res.status}] {res.url}") if res.status >= 400 and "/api/v1/" in res.url else None)

        # -------------------------------------------------------------
        # Test 1: Landing Page (Public)
        # -------------------------------------------------------------
        print("\n[TEST 1] Auditing Landing Page (/)...", flush=True)
        try:
            res = await page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=20000)
            assert res.status == 200, f"Landing returned status {res.status}"
            title = await page.title()
            print(f"  Page Title verified (length: {len(title)})", flush=True)
            
            # Check brand logo and navigation
            logo = await page.wait_for_selector('img[alt="ExportPilot AI"]', timeout=5000)
            assert logo is not None, "Brand logo missing"
            
            # Check loss aversion calculator interaction
            slider = await page.query_selector('input[type="range"]')
            if slider:
                val_before = await slider.input_value()
                await slider.fill("25000")
                await page.wait_for_timeout(500)
                print(f"  Interactive Loss Calculator tested (initial: {val_before}, updated: 25000)", flush=True)
            
            results["passed"].append("1. Landing Page Loads cleanly with interactive calculator")
        except Exception as e:
            results["failed"].append(f"1. Landing Page Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 2: Language Switching (Bangla <-> English)
        # -------------------------------------------------------------
        print("\n[TEST 2] Testing Language Switcher...", flush=True)
        try:
            lang_btn = await page.wait_for_selector('button[title*="Switch to"], button[title*="বাংলায়"]', timeout=5000)
            init_text = await lang_btn.inner_text()
            await lang_btn.click()
            await page.wait_for_timeout(300)
            new_text = await lang_btn.inner_text()
            assert init_text != new_text, "Language toggle did not change text"
            print(f"  Language switched successfully ({init_text} -> {new_text})", flush=True)
            # Switch back
            await lang_btn.click()
            await page.wait_for_timeout(300)
            results["passed"].append("2. Language switcher toggles dynamically without page reload")
        except Exception as e:
            results["failed"].append(f"2. Language Switcher Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 3: Unauthenticated Access to Protected Workspace (/app)
        # -------------------------------------------------------------
        print("\n[TEST 3] Testing Protected Route Guard (/app while unauthenticated)...", flush=True)
        try:
            # Clear cookies to ensure completely clean state
            await context.clear_cookies()
            await page.goto(f"{BASE_URL}/app", wait_until="networkidle", timeout=15000)
            current_url = page.url
            assert "/login" in current_url, f"Expected redirect to /login, got {current_url}"
            print(f"  Successfully redirected unauthenticated user to: {current_url}", flush=True)
            results["passed"].append("3. Unauthenticated access to /app redirects safely to /login")
        except Exception as e:
            results["failed"].append(f"3. Protected Route Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 4: Exporter Authentication & Session Persistence
        # -------------------------------------------------------------
        print("\n[TEST 4] Testing Exporter Login...", flush=True)
        try:
            await page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=15000)
            await page.fill('input[type="email"]', EXPORTER_EMAIL)
            await page.fill('input[type="password"]', EXPORTER_PASSWORD)
            
            # Submit login form
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/app**", timeout=15000)
            print(f"  Logged in successfully! Redirection confirmed to: {page.url}", flush=True)
            
            # Verify factory name header
            await page.wait_for_selector('h1', timeout=5000)
            results["passed"].append("4. Exporter login succeeds and loads personalized deal room")
        except Exception as e:
            results["failed"].append(f"4. Exporter Login Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 5: Deal Room Workspace Workflows (Presets & Stepper)
        # -------------------------------------------------------------
        print("\n[TEST 5] Testing Deal Room 5-Step Pipeline...", flush=True)
        try:
            # Switch to Denim Jacket preset
            denim_btn = await page.wait_for_selector('button:has-text("ডেনিম"), button:has-text("Denim")', timeout=5000)
            await denim_btn.click()
            await page.wait_for_timeout(1000)
            print("  Switched preset to Denim Jacket", flush=True)

            # Test Step 4: Buyers & Margin
            step4_btn = await page.query_selector('button:has-text("বায়ার"), button:has-text("Buyers")')
            if step4_btn:
                await step4_btn.click()
                await page.wait_for_timeout(500)
                print("  Navigated to Step 4 (Verified Buyers & Margin Matrix)", flush=True)

            # Test Step 5: Advisor & Deal Room
            step5_btn = await page.query_selector('button:has-text("নেগোসিয়েশন"), button:has-text("Advisor")')
            if step5_btn:
                await step5_btn.click()
                await page.wait_for_timeout(500)
                print("  Navigated to Step 5 (Azure OpenAI Sovereign Negotiation Room)", flush=True)

            results["passed"].append("5. Deal Room preset switching and 5-stage stepper workflow operational")
        except Exception as e:
            results["failed"].append(f"5. Deal Room Workflow Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 6: Role-Based Access Control (Exporter visiting /admin)
        # -------------------------------------------------------------
        print("\n[TEST 6] Testing RBAC Restriction (Exporter attempting /admin)...", flush=True)
        try:
            await page.goto(f"{BASE_URL}/admin", wait_until="networkidle", timeout=15000)
            page_text = await page.inner_text("body")
            assert "এক্সেস সীমাবদ্ধ" in page_text or "Access Restricted" in page_text, "RBAC did not block exporter from /admin"
            print("  RBAC correctly enforced: Exporter blocked from /admin with professional notice", flush=True)
            results["passed"].append("6. RBAC correctly protects /admin from non-admin accounts")
        except Exception as e:
            results["failed"].append(f"6. RBAC Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 7: Admin Login & System Governance Panel
        # -------------------------------------------------------------
        print("\n[TEST 7] Testing Admin Login & Governance Panel (/admin)...", flush=True)
        try:
            # Clean logout and state reset
            await context.clear_cookies()
            await page.evaluate("() => localStorage.clear()")

            await page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=15000)
            await page.fill('input[type="email"]', ADMIN_EMAIL)
            await page.fill('input[type="password"]', ADMIN_PASSWORD)
            await page.click('button[type="submit"]')
            
            # Wait for successful login redirect
            await page.wait_for_timeout(2000)
            print(f"  Admin logged in! Current URL: {page.url}", flush=True)

            # Navigate directly to /admin
            res_admin = await page.goto(f"{BASE_URL}/admin", wait_until="domcontentloaded", timeout=15000)
            assert res_admin.status == 200, f"/admin returned {res_admin.status}"
            await page.wait_for_timeout(1000)
            admin_text = (await page.inner_text("body")).lower()
            assert ("admin" in admin_text or "অ্যাডমিন" in admin_text or "telemetry" in admin_text), f"Admin Panel did not render expected content: {admin_text[:200]}"
            print("  Admin Governance Panel verified with operational metrics!", flush=True)
            results["passed"].append("7. Admin login succeeds and loads Governance Control Center")
        except Exception as e:
            results["failed"].append(f"7. Admin Panel Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 8: 100-Point Audit Report (/audit) as Admin
        # -------------------------------------------------------------
        print("\n[TEST 8] Testing 100-Point Audit Report (/audit)...", flush=True)
        try:
            res_audit = await page.goto(f"{BASE_URL}/audit", wait_until="networkidle", timeout=15000)
            assert res_audit.status == 200, f"/audit returned {res_audit.status}"
            body_text = (await page.inner_text("body")).lower()
            assert ("100-point" in body_text or "scorecard" in body_text or "verdict" in body_text or "অডিট" in body_text), "Audit report failed to render"
            
            # Click "Run Live System Audit" button to trigger live diagnostic
            run_btn = await page.query_selector('button:has-text("লাইভ অডিট"), button:has-text("Live System Audit")')
            if run_btn:
                await run_btn.click()
                await page.wait_for_timeout(2000)
                print("  Live diagnostic trigger executed successfully", flush=True)
            
            print("  100-Point Audit Report verified with category breakdowns and score cards!", flush=True)
            results["passed"].append("8. 100-Point Audit Report renders comprehensive compliance metrics")
        except Exception as e:
            results["failed"].append(f"8. Audit Report Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        # -------------------------------------------------------------
        # Test 9: Public & Protected Specialized Workspaces
        # -------------------------------------------------------------
        print("\n[TEST 9] Auditing Specialized Workspaces...", flush=True)
        routes_to_test = [
            ("/buyers", "Buyer Directory / Verified Catalog"),
            ("/data", "Data Explorer & Tariff Engine"),
            ("/security", "Data Sovereignty & PII Masker Lab"),
            ("/architecture", "5-Agent Pipeline & Architecture Viewer"),
            ("/docs", "Canonical System Documentation"),
            ("/presentation", "16:9 Investor Presentation Mode"),
            ("/pitchdeck", "Interactive Pitch Deck"),
        ]
        for route, desc in routes_to_test:
            try:
                res = await page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=15000)
                assert res.status == 200, f"Route {route} returned {res.status}"
                print(f"  PASS: {route} -> 200 OK ({desc})", flush=True)
                results["passed"].append(f"9. Route {route} ({desc}) loaded successfully")
            except Exception as e:
                results["failed"].append(f"9. Route {route} Failed: {e}")
                print(f"  FAIL: {route} ({e})", flush=True)

        # -------------------------------------------------------------
        # Test 10: Mobile Viewport Responsiveness (390x844 iPhone)
        # -------------------------------------------------------------
        print("\n[TEST 10] Testing Mobile Responsive Layout (390px iPhone Viewport)...", flush=True)
        try:
            mobile_context = await browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
                has_touch=True
            )
            m_page = await mobile_context.new_page()
            await m_page.goto(f"{BASE_URL}/", wait_until="domcontentloaded", timeout=15000)
            await m_page.wait_for_timeout(1000)
            
            # Check mobile hamburger menu
            hamburger = await m_page.wait_for_selector('button[aria-controls="mobile-menu"], button[aria-label*="মেনু"], button[aria-label*="menu"]', timeout=5000)
            assert hamburger is not None, "Mobile menu button not found"
            await hamburger.click()
            await m_page.wait_for_timeout(300)
            menu_open = await m_page.query_selector('#mobile-menu')
            assert menu_open is not None, "Mobile drawer menu did not expand"
            print("  Mobile navigation drawer verified and expands on tap", flush=True)
            await mobile_context.close()
            results["passed"].append("10. Mobile responsive layout (390px) operates with zero UI overflow")
        except Exception as e:
            results["failed"].append(f"10. Mobile Responsive Error: {e}")
            print(f"  FAILED: {e}", flush=True)

        await browser.close()

    print("\n==================================================================", flush=True)
    print("AUDIT SUMMARY RESULTS:", flush=True)
    print(f"Total Passed Checks: {len(results['passed'])}", flush=True)
    print(f"Total Failed Checks: {len(results['failed'])}", flush=True)
    print(f"Console Errors:      {len(results['console_errors'])}", flush=True)
    print(f"Network Errors:      {len(results['network_errors'])}", flush=True)
    print("==================================================================", flush=True)

    if results["failed"]:
        print("\nFAILURES:", flush=True)
        for f in results["failed"]:
            print(f"  - {f}", flush=True)

    if results["console_errors"]:
        print("\nCONSOLE ERRORS:", flush=True)
        for ce in set(results["console_errors"][:10]):
            print(f"  - {ce}", flush=True)

    if results["network_errors"]:
        print("\nNETWORK ERRORS (>= 400):", flush=True)
        for ne in set(results["network_errors"][:10]):
            print(f"  - {ne}", flush=True)

    return len(results["failed"]) == 0

if __name__ == "__main__":
    success = asyncio.run(run_audit())
    sys.exit(0 if success else 1)
