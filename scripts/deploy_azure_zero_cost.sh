#!/usr/bin/env bash
set -e

echo "=== 1. Checking Azure CLI Authentication & Student Subscription ==="
az account show --output table

RG_NAME="rg-exportpilot-bd-2026"
LOCATION="eastasia"
RAND_SUFFIX=$(openssl rand -hex 3 2>/dev/null || echo "app")
APP_NAME="exportpilot-bd-${RAND_SUFFIX}"

echo "=== 2. Creating Resource Group $RG_NAME in $LOCATION ==="
az group create --name "$RG_NAME" --location "$LOCATION" --output none

echo "=== 3. Deploying Unified Container to Azure Container Apps (Scale-to-Zero) ==="
az extension add --name containerapp --upgrade -y
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

az containerapp up \
  --name "$APP_NAME" \
  --resource-group "$RG_NAME" \
  --location "$LOCATION" \
  --source . \
  --ingress external \
  --target-port 8000

echo "=== Setting Scale-to-Zero Guardrail (Min-replicas 0) ==="
az containerapp update \
  --name "$APP_NAME" \
  --resource-group "$RG_NAME" \
  --min-replicas 0 \
  --max-replicas 2 \
  --cpu 0.5 \
  --memory 1.0Gi

FQDN=$(az containerapp show --name "$APP_NAME" --resource-group "$RG_NAME" --query properties.configuration.ingress.fqdn -o tsv)
echo "=== 4. Verifying All 13 Mandatory Congress Routes on https://$FQDN ==="
for r in '' '/login' '/register' '/app' '/demo-user' '/demo-admin' '/admin' '/data' '/security' '/architecture' '/presentation' '/pitchdeck' '/audit' '/api/v1/health'; do
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' "https://$FQDN$r")
  echo "Route $r -> HTTP $STATUS"
done

echo "SUCCESS! Live Production URL: https://$FQDN"
