# =========================================================================
# ExportPilot AI - Master Autonomous Deploy & Sync Pipeline
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
$PROJECT_ROOT = $PSScriptRoot
Set-Location $PROJECT_ROOT

# Forward to core deployment engine in scripts/deploy_azure.ps1
$scriptPath = Join-Path $PROJECT_ROOT "scripts\deploy_azure.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "Deployment engine not found at $scriptPath"
}

& $scriptPath @PSBoundParameters
