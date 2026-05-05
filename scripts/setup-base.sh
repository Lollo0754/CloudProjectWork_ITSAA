#!/bin/bash
# Esegui questo script manualmente sull'istanza EC2 base via SSH.
# Dopo averlo eseguito e creato il .env, crea la AMI da questa istanza.

set -e

echo "=== Installazione Docker ==="
apt-get update -y
apt-get install -y git curl

curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "=== Clone repository ==="
git clone https://github.com/Lollo0754/CloudProjectWork_ITSAA.git /app

echo ""
echo "=== FATTO ==="
echo "Ora crea il file /app/.env con i tuoi dati:"
echo ""
echo "  DATABASE_URL=postgresql://utente:password@endpoint-rds:5432/nome_db"
echo "  SECRET_KEY=stringa-segreta-lunga"
echo ""
echo "Poi avvia l'app con:"
echo "  cd /app && docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "Quando funziona, crea la AMI da questa istanza."
