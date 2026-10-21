# =========================================================================
# ExportPilot AI (গ্লোবাল-ব্যাপারী) - Autonomous Zero-Cost Azure Deployment
# Preserves $100 Microsoft Azure for Students credit with Scale-to-Zero policy
# =========================================================================

$ErrorActionPreference = "Stop"

Write-Host "=== 1. Checking Azure Authentication & Subscription ===" -ForegroundColor Cyan
az account show --output table

$RG_NAME = "rg-exportpilot-bd-2026"
$LOCATION = "eastasia"
$RAND = [System.IO.Path]::GetRandomFileName().Substring(0, 5).ToLower()
$APP_NAME = "exportpilot-bd-$RAND"

Write-Host "=== 2. Creating Resource Group: $RG_NAME ($LOCATION) ===" -ForegroundColor Cyan
az group create --name $RG_NAME --location $LOCATION --output none

Write-Host "=== 3. Registering Resource Providers ===" -ForegroundColor Cyan
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights

Write-Host "=== 4. Adding/Upgrading Azure Container Apps Extension ===" -ForegroundColor Cyan
az extension add --name containerapp --upgrade -y

Write-Host "=== 5. Deploying Container to Azure Container Apps (Source: .) ===" -ForegroundColor Cyan
az containerapp up `
  --name $APP_NAME `
  --resource-group $RG_NAME `
  --location $LOCATION `
  --source . `
  --ingress external `
  --target-port 8000

Write-Host "=== 6. Applying Scale-to-Zero Cost Guardrail (min-replicas 0) ===" -ForegroundColor Cyan
az containerapp update `
  --name $APP_NAME `
  --resource-group $RG_NAME `
  --min-replicas 0 `
  --max-replicas 2 `
  --cpu 0.5 `
  --memory 1.0Gi

$FQDN = az containerapp show --name $APP_NAME --resource-group $RG_NAME --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "=== 7. Deployed Successfully! Live URL: https://$FQDN ===" -ForegroundColor Green

Write-Host "=== 8. Verifying Mandatory Congress Routes ===" -ForegroundColor Cyan
$routes = @("", "/login", "/register", "/app", "/demo-user", "/demo-admin", "/admin", "/data", "/security", "/architecture", "/presentation", "/pitchdeck", "/audit", "/api/v1/health")
foreach ($r in $routes) {
    try {
        $res = Invoke-WebRequest -Uri "https://$FQDN$r" -UseBasicParsing -TimeoutSec 15
        Write-Host "Route $r -> HTTP $($res.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "Route $r -> Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "SUCCESS! Live Production URL: https://$FQDN" -ForegroundColor Green
