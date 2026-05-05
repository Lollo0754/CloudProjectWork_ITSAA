#!/bin/bash
# Script user-data per EC2 / ASG — eu-west-1
# Viene eseguito automaticamente al primo avvio dell'istanza.
# L'istanza deve avere un IAM Role con:
#   - secretsmanager:GetSecretValue  (su cloudproject/prod)
#   - s3:GetObject                   (sul bucket cloudproject-timeline)

set -e
exec > /var/log/user-data.log 2>&1

echo "=== Avvio setup CloudProject ==="

# --- Sistema ---
apt-get update -y
apt-get install -y git curl

# --- Docker ---
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# --- Docker Compose v2 ---
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# --- Clona il repository ---
# SOSTITUISCI con il tuo username GitHub
GITHUB_USER="Lollo0754"
REPO="CloudProjectWork_ITSAA"

git clone "https://github.com/${GITHUB_USER}/${REPO}.git" /app
cd /app

# --- Avvia l'applicazione ---
docker compose -f docker-compose.prod.yml up -d --build

echo "=== Setup completato ==="
