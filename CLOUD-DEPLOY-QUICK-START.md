# Cloud Deployment Quick Start Guide

This guide will help you quickly deploy your Fantasy Sports application to a cloud server droplet.

## Prerequisites

- Cloud server (DigitalOcean, AWS EC2, Linode, etc.) running Ubuntu 22.04+
- Domain name (optional but recommended)
- SSH access to your server
- Git repository with your code

## Quick Deployment Steps

### 1. Initial Server Setup (One-time)

SSH into your server and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Clone and Configure

```bash
# Clone your repository
cd /var/www
sudo git clone YOUR_REPO_URL fantasy-app
cd fantasy-app

# Create .env file
sudo nano .env
```

Add your environment variables:
```env
AUTH_SECRET=your-secret-here
AUTH_URL=https://yourdomain.com
AUTH_DISCORD_ID=your-discord-id
AUTH_DISCORD_SECRET=your-discord-secret
ADMIN_DISCORD_IDS=your-admin-ids
DATABASE_URL=your-database-url
```

Save with `Ctrl+X`, `Y`, `Enter`.

### 3. Deploy with Docker

```bash
# Make deploy script executable
sudo chmod +x deploy-cloud.sh

# Run deployment
sudo ./deploy-cloud.sh
```

Select option `1` for fresh deployment.

### 4. Configure Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/fantasy-app

# Edit the config and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/fantasy-app

# Enable the site
sudo ln -s /etc/nginx/sites-available/fantasy-app /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 5. Set Up SSL (HTTPS)

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts - select option 2 to redirect HTTP to HTTPS
```

### 6. Configure Firewall

```bash
# Allow SSH (IMPORTANT!)
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 7. Verify Deployment

Visit your domain: `https://yourdomain.com`

## Quick Commands

### View Application Logs
```bash
sudo docker logs fantasy-sports-app -f
```

### Restart Application
```bash
cd /var/www/fantasy-app
sudo ./deploy-cloud.sh
# Select option 2
```

### Update Application (Pull Latest Changes)
```bash
cd /var/www/fantasy-app
sudo git pull
sudo ./deploy-cloud.sh
# Select option 2
```

### Stop Application
```bash
cd /var/www/fantasy-app
sudo ./deploy-cloud.sh
# Select option 3
```

### Check Application Status
```bash
sudo docker ps | grep fantasy
sudo docker stats fantasy-sports-app --no-stream
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/fantasy-app-access.log
sudo tail -f /var/log/nginx/fantasy-app-error.log
```

## Troubleshooting

### Application Won't Start
```bash
# Check container logs
sudo docker logs fantasy-sports-app

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart container
sudo docker restart fantasy-sports-app
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
# Test database connection from container
sudo docker exec fantasy-sports-app node -e "console.log('Testing DB...')"

# Check environment variables
sudo docker exec fantasy-sports-app env | grep DATABASE_URL
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_SECRET` | NextAuth secret key | `openssl rand -base64 32` |
| `AUTH_URL` | Your production URL | `https://yourdomain.com` |
| `AUTH_DISCORD_ID` | Discord OAuth Client ID | From Discord Developer Portal |
| `AUTH_DISCORD_SECRET` | Discord OAuth Secret | From Discord Developer Portal |
| `ADMIN_DISCORD_IDS` | Comma-separated admin IDs | `123456789,987654321` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |

## Discord OAuth Configuration

1. Go to https://discord.com/developers/applications
2. Select your application
3. Navigate to OAuth2 → Redirects
4. Add: `https://yourdomain.com/api/auth/callback/discord`
5. Save changes

## Security Best Practices

1. **Use strong passwords** for all services
2. **Enable SSH key authentication** and disable password login
3. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
4. **Monitor logs regularly**: `sudo docker logs fantasy-sports-app`
5. **Set up automated backups** for your database
6. **Use environment variables** for sensitive data (never commit to git)
7. **Enable fail2ban**: `sudo apt install fail2ban -y`

## Monitoring

### Set Up Automatic SSL Renewal
Certbot automatically sets up a cron job. Verify:
```bash
sudo systemctl status certbot.timer
```

### Monitor Container Resources
```bash
sudo docker stats fantasy-sports-app
```

### Set Up Log Rotation
Docker automatically rotates logs (configured in docker-compose.production.yml).

## Backup Strategy

### Manual Database Backup
```bash
# Export schema and data
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Automatic Backups (Cron Job)
```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /var/www/fantasy-app && pg_dump $DATABASE_URL > /var/backups/fantasy-$(date +\%Y\%m\%d).sql
```

## Performance Optimization

### Enable Nginx Gzip Compression
Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### Monitor Application Performance
```bash
# Check response times
curl -w "@-" -o /dev/null -s https://yourdomain.com <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

## Need Help?

- Check application logs: `sudo docker logs fantasy-sports-app -f`
- Check nginx logs: `sudo tail -f /var/log/nginx/fantasy-app-error.log`
- Verify environment variables are set correctly
- Ensure Discord OAuth URLs match your domain
- Check firewall rules: `sudo ufw status`

## Useful Docker Commands

```bash
# List all containers
sudo docker ps -a

# Remove stopped containers
sudo docker container prune

# Remove unused images
sudo docker image prune -a

# View container details
sudo docker inspect fantasy-sports-app

# Execute command in container
sudo docker exec -it fantasy-sports-app sh

# Copy files from/to container
sudo docker cp fantasy-sports-app:/app/file.txt ./
sudo docker cp ./file.txt fantasy-sports-app:/app/
```

## Scaling Considerations

For high traffic, consider:
1. **Load balancer** (Nginx, HAProxy)
2. **Multiple app instances** behind load balancer
3. **Database connection pooling** (PgBouncer)
4. **CDN** for static assets (CloudFlare, AWS CloudFront)
5. **Caching layer** (Redis, Memcached)
6. **Horizontal scaling** with container orchestration (Docker Swarm, Kubernetes)

---

**That's it! Your application should now be live at https://yourdomain.com** 🎉
