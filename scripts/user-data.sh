#!/bin/bash
# Script user-data per le istanze lanciate dall'ASG.
# L'AMI contiene già il repo clonato e il file .env configurato.
# Questo script aggiorna il codice e riavvia i container ad ogni nuovo avvio.

set -e
exec > /var/log/user-data.log 2>&1

echo "=== Avvio istanza CloudProject ==="

cd /app

git pull

docker compose -f docker-compose.prod.yml up -d --build

echo "=== App avviata ==="
