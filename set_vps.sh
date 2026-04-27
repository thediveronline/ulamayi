#!/bin/bash
# Script pour configurer le backend Node.js d'Ulamayi avec systemd + Nginx
# Pre-requis : code deja present dans /opt/ulamayi/backend, .env deja cree.
# La base PostgreSQL peut etre locale ou externe (ex: Neon.tech via DATABASE_URL).
set -e

APP_DIR="/opt/ulamayi/backend"
APP_PORT="3000"
DOMAIN="api.ulamayi.shop"   # remplace par ton domaine

# 0. Installer les dependances systeme
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx

# Node.js 20 si absent
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 1. Installer les dependances Node + lancer la migration
#    (si la base est externe comme Neon.tech, DATABASE_URL est dans le .env)
cd "$APP_DIR"
npm install --omit=dev
npm run migrate

# 2. Creer le service systemd
SERVICE_FILE="/etc/systemd/system/ulamayi.service"
cat <<EOL > $SERVICE_FILE
[Unit]
Description=Backend Ulamayi (Node.js)
After=network.target

[Service]
User=root
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
ExecStart=/usr/bin/node $APP_DIR/serveur.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

echo "Service systemd cree : $SERVICE_FILE"

# 3. Activer et demarrer le service
systemctl daemon-reload
systemctl enable ulamayi
systemctl restart ulamayi
systemctl status ulamayi --no-pager

# 4. Configurer Nginx
NGINX_FILE="/etc/nginx/sites-available/ulamayi"
cat <<EOL > $NGINX_FILE
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

ln -sf /etc/nginx/sites-available/ulamayi /etc/nginx/sites-enabled/ulamayi
nginx -t
systemctl restart nginx

echo "Nginx configure pour proxy vers Node sur le port $APP_PORT"

# 5. Commandes utiles
echo ""
echo "Commandes pour gerer le service :"
echo "  systemctl restart ulamayi"
echo "  systemctl status ulamayi"
echo "  journalctl -u ulamayi -f"
echo ""
echo "Pour activer HTTPS avec Certbot, lance :"
echo "  certbot --nginx -d $DOMAIN"
