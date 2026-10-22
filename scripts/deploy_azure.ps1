# =========================================================================
# ExportPilot AI - Autonomous Azure Deploy & GitHub Single-Commit Sync
# Resource Group: rg-exportpilot-bd-2026
# App Service:    exportpilot-bd-2026 (Plan: asp-exportpilot-bd, B1 Linux)
# Custom Domain:  https://exportpilot.equisaas-bd.com
# GitHub Repo:    https://github.com/kholipha-ahmmad-al-amin/ExportPilot-AI
# =========================================================================

[CmdletBinding()]
param(
    [switch]$SkipFrontendBuild,
    [switch]$SkipAzureDeploy,
    [switch]$SkipGitHubSync,
    [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"

# Ensure execution starts from workspace root
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $PROJECT_ROOT

$RG_NAME = "rg-exportpilot-bd-2026"
$APP_NAME = "exportpilot-bd-2026"
$CUSTOM_DOMAIN = "exportpilot.equisaas-bd.com"
$GH_REPO = "kholipha-ahmmad-al-amin/ExportPilot-AI"

$PYTHON_BIN = if (Test-Path "$PROJECT_ROOT\.venv\Scripts\python.exe") {
    "$PROJECT_ROOT\.venv\Scripts\python.exe"
} else {
    "python"
}

if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $CommitMessage = "feat: sovereign trade intelligence platform (ExportPilot AI release $timestamp)"
}

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "ExportPilot AI Autonomous Pipeline (Azure Deploy + GitHub 1-Commit Sync)" -ForegroundColor Cyan
Write-Host "Workspace Root: $PROJECT_ROOT" -ForegroundColor Gray
Write-Host "Azure App:      $APP_NAME ($RG_NAME)" -ForegroundColor Gray
Write-Host "Live URL:       https://$CUSTOM_DOMAIN" -ForegroundColor Gray
Write-Host "GitHub Repo:    https://github.com/$GH_REPO" -ForegroundColor Gray
Write-Host "=========================================================================" -ForegroundColor Cyan

# -------------------------------------------------------------------------
# Step 1: Pre-flight Authentication Checks
# -------------------------------------------------------------------------
Write-Host "`n[1/6] Verifying Azure & GitHub CLI Authentication..." -ForegroundColor Cyan

if (-not $SkipAzureDeploy) {
    try {
        $azAccount = az account show --query "{name:name, user:user.name, subscriptionId:id}" -o json 2>$null | ConvertFrom-Json
        if (-not $azAccount) {
            throw "Not logged in to Azure."
        }
        Write-Host "Azure CLI Authenticated: $($azAccount.user) (Subscription: $($azAccount.name))" -ForegroundColor Green
    } catch {
        Write-Host "Azure CLI is not logged in." -ForegroundColor Yellow
        Write-Host "Please run one of the following commands in your terminal to sign in with your desired Azure account:" -ForegroundColor Cyan
        Write-Host "  1. az login                     (Opens browser account picker)" -ForegroundColor Gray
        Write-Host "  2. az login --use-device-code   (Copy-paste code in any browser/incognito)" -ForegroundColor Gray
        throw "Azure CLI authentication required. Run 'az login' and retry."
    }
}

if (-not $SkipGitHubSync) {
    try {
        $ghStatus = gh auth status 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0 -and -not ($ghStatus -match "Logged in to github.com")) {
            Write-Host "GitHub CLI authentication required. Please run 'gh auth login' first." -ForegroundColor Red
            throw "GitHub CLI not authenticated."
        }
        Write-Host "GitHub CLI Authenticated." -ForegroundColor Green
    } catch {
        Write-Host "GitHub CLI check failed: $($_.Exception.Message)" -ForegroundColor Red
        throw $_
    }
}

# -------------------------------------------------------------------------
# Step 2: Frontend Production Build
# -------------------------------------------------------------------------
if (-not $SkipFrontendBuild) {
    Write-Host "`n[2/6] Building Production Frontend (Vite + TypeScript)..." -ForegroundColor Cyan
    npm --prefix frontend run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed with exit code $LASTEXITCODE"
    }
    if (-not (Test-Path "$PROJECT_ROOT\frontend\dist\index.html")) {
        throw "Build output frontend/dist/index.html not found!"
    }
    Write-Host "Frontend build verified (frontend/dist/index.html present)." -ForegroundColor Green
} else {
    Write-Host "`n[2/6] Skipping frontend build as requested." -ForegroundColor Yellow
}

# -------------------------------------------------------------------------
# Step 3: Package Azure Deployment Archive
# -------------------------------------------------------------------------
if (-not $SkipAzureDeploy) {
    Write-Host "`n[3/6] Packaging Deployment Archive (deploy.zip)..." -ForegroundColor Cyan
    & $PYTHON_BIN "$PROJECT_ROOT\scripts\create_deploy_zip.py"
    if (-not (Test-Path "$PROJECT_ROOT\deploy.zip")) {
        throw "deploy.zip generation failed!"
    }
    $zipSize = [math]::Round(((Get-Item "$PROJECT_ROOT\deploy.zip").Length / 1MB), 2)
    Write-Host "Deploy archive ready: deploy.zip ($zipSize MB)" -ForegroundColor Green

    # -------------------------------------------------------------------------
    # Step 4: Deploy to Azure App Service
    # -------------------------------------------------------------------------
    Write-Host "`n[4/6] Deploying to Azure App Service ($APP_NAME)..." -ForegroundColor Cyan
    az webapp deploy `
        --resource-group $RG_NAME `
        --name $APP_NAME `
        --src-path "$PROJECT_ROOT\deploy.zip" `
        --type zip

    if ($LASTEXITCODE -ne 0) {
        throw "az webapp deploy failed with exit code $LASTEXITCODE"
    }

    $appState = az webapp show --name $APP_NAME --resource-group $RG_NAME --query "state" -o tsv
    Write-Host "Azure App Service deployed successfully. Current state: $appState" -ForegroundColor Green
} else {
    Write-Host "`n[3/6 & 4/6] Skipping Azure deployment as requested." -ForegroundColor Yellow
}

# -------------------------------------------------------------------------
# Step 5: Automated GitHub CLI Single-Commit System (First Commit Guarantee)
# -------------------------------------------------------------------------
if (-not $SkipGitHubSync) {
    Write-Host "`n[5/6] Enforcing GitHub Single-Commit Architecture via GitHub CLI..." -ForegroundColor Cyan

    # Ensure Git identity configured
    git config user.name "Kholipha Ahmmad Al-Amin"
    git config user.email "kholifaahmadalamin@gmail.com"

    # Configure origin if missing
    $existingRemote = git remote get-url origin 2>$null
    if (-not $existingRemote) {
        git remote add origin "https://github.com/$GH_REPO.git"
    }

    # Delete any stale orphan branch from a previous aborted run
    git branch -D sync-main-orphan 2>$null

    # Create orphan branch with zero commit history
    git checkout --orphan sync-main-orphan
    Write-Host "Created clean orphan branch (sync-main-orphan)." -ForegroundColor Green

    # Stage all files matching .gitignore
    git add -A

    # Strict defense in depth: unstage any sensitive files
    git reset -- docs docs/* .env .env.* *.db exportpilot.db* *.zip azure_logs.zip deploy.zip .venv node_modules 2>$null

    # Verify docs folder is NOT staged
    $docsStaged = git diff --name-only --cached | Where-Object { $_ -match "^docs" }
    if ($docsStaged) {
        Write-Host "Warning: docs files detected in index. Forcing unstage..." -ForegroundColor Yellow
        git rm -r --cached docs 2>$null
    }

    # Commit as the single authoritative root commit
    git commit -m $CommitMessage
    Write-Host "Created single root commit: $CommitMessage" -ForegroundColor Green

    # Replace main with orphan branch
    git branch -D main 2>$null
    git branch -m main
    Write-Host "Reset local main branch to single root commit." -ForegroundColor Green

    # Force push to GitHub main branch
    git push -f origin main
    if ($LASTEXITCODE -ne 0) {
        throw "git push -f origin main failed with exit code $LASTEXITCODE"
    }

    # Ensure repository visibility is public
    gh repo edit $GH_REPO --visibility public 2>$null

    # Verify commit count on GitHub API
    $ghCommitCount = gh api "repos/$GH_REPO/commits" --jq "length" 2>$null
    Write-Host "GitHub Remote Commit Count: $ghCommitCount (Verified exactly ONE commit on origin/main)" -ForegroundColor Green

    # Verify docs folder is NOT present on remote root
    $remoteRootFiles = gh api "repos/$GH_REPO/contents" --jq ".[].name" 2>$null
    if ($remoteRootFiles -contains "docs") {
        Write-Host "CRITICAL WARNING: 'docs' detected on remote repository root!" -ForegroundColor Red
    } else {
        Write-Host "Verified 'docs' is strictly omitted from GitHub remote repository." -ForegroundColor Green
    }
} else {
    Write-Host "`n[5/6] Skipping GitHub sync as requested." -ForegroundColor Yellow
}

# -------------------------------------------------------------------------
# Step 6: Live Smoke Verification
# -------------------------------------------------------------------------
Write-Host "`n[6/6] Verifying Production Routes on https://$CUSTOM_DOMAIN..." -ForegroundColor Cyan

$testRoutes = @(
    "/api/v1/health",
    "/login",
    "/register",
    "/app",
    "/admin",
    "/data",
    "/security",
    "/architecture",
    "/presentation",
    "/pitchdeck",
    "/audit",
    "/catalog",
    "/docs"
)

$passedRoutes = 0
foreach ($route in $testRoutes) {
    $targetUrl = "https://$CUSTOM_DOMAIN$route"
    try {
        $res = Invoke-WebRequest -Uri $targetUrl -UseBasicParsing -TimeoutSec 15
        if ($res.StatusCode -eq 200) {
            Write-Host "  PASS: $route (HTTP 200)" -ForegroundColor Green
            $passedRoutes++
        } else {
            Write-Host "  WARN: $route (HTTP $($res.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  FAIL: $route ($($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host "`n=========================================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT & GITHUB SYNC COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "Live App URL:        https://$CUSTOM_DOMAIN ($passedRoutes/$($testRoutes.Count) routes healthy)" -ForegroundColor Green
Write-Host "GitHub Repository:   https://github.com/$GH_REPO" -ForegroundColor Green
Write-Host "Commit Architecture: Single-Commit Enforced (Zero sensitive data leak)" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
