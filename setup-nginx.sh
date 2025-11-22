#!/bin/bash

# Nginx Setup Script for Fantasy Sports App

set -e

echo "======================================"
echo "Nginx Configuration Setup"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Prompt for domain
read -p "Enter your domain name (e.g., fantasy.example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "Domain name is required!"
    exit 1
fi

echo ""
echo "Setting up Nginx for domain: $DOMAIN"
echo ""

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt update
    apt install -y nginx
fi

# Create Nginx configuration
CONFIG_FILE="/etc/nginx/sites-available/fantasy-app"

cat > $CONFIG_FILE <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Increase timeout for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Increase max upload size
    client_max_body_size 10M;
}
EOF

echo "✓ Nginx configuration created"

# Enable site
ln -sf $CONFIG_FILE /etc/nginx/sites-enabled/fantasy-app

# Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo "✓ Removed default site"
fi

# Test configuration
echo ""
echo "Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo ""
echo "Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

echo ""
echo "======================================"
echo "✓ Nginx setup complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Make sure your domain DNS points to this server's IP"
echo "2. Set up SSL with: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "Your app should be accessible at: http://$DOMAIN"
echo ""
