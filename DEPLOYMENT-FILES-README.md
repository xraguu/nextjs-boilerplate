# Deployment Files Overview

This document explains all the deployment-related files in this project and how to use them.

## File Structure

```
.
├── Dockerfile                          # Multi-stage Docker build configuration
├── docker-compose.yml                  # Development Docker Compose
├── docker-compose.production.yml       # Production Docker Compose (enhanced)
├── .dockerignore                       # Files to exclude from Docker build
├── nginx.conf                          # Nginx reverse proxy configuration
├── deploy-cloud.sh                     # Automated deployment script
├── fantasy-app.service                 # Systemd service file (optional)
├── .env.example                        # Environment variables template
├── DEPLOYMENT.md                       # Detailed deployment guide
├── CLOUD-DEPLOY-QUICK-START.md        # Quick start guide
└── DEPLOYMENT-FILES-README.md         # This file
```

## Core Files

### 1. `Dockerfile`
**Purpose**: Defines how to build your application into a Docker container.

**Features**:
- Multi-stage build (deps → builder → runner)
- Optimized for production
- Node.js 20 Alpine base
- Non-root user for security
- Prisma client generation
- Next.js standalone output

**When to modify**:
- Changing Node.js version
- Adding system dependencies
- Modifying build steps

### 2. `docker-compose.yml`
**Purpose**: Basic Docker Compose for development/testing.

**Features**:
- Simple configuration
- Environment variable injection
- Port mapping (3000:3000)
- Auto-restart
- Health checks

**Usage**:
```bash
docker-compose up -d
docker-compose down
```

### 3. `docker-compose.production.yml`
**Purpose**: Enhanced Docker Compose for production deployment.

**Features**:
- Resource limits (CPU/Memory)
- Advanced logging configuration
- Network isolation
- Health checks with longer startup time
- Proper container naming
- Log rotation

**Usage**:
```bash
docker-compose -f docker-compose.production.yml up -d --build
docker-compose -f docker-compose.production.yml down
```

**Differences from basic docker-compose.yml**:
| Feature | docker-compose.yml | docker-compose.production.yml |
|---------|-------------------|------------------------------|
| Resource limits | ❌ | ✅ 2 CPU, 2GB RAM |
| Log rotation | ❌ | ✅ 10MB max, 5 files |
| Network | default | custom bridge |
| Restart policy | unless-stopped | always |
| Container name | auto | fantasy-sports-app |

### 4. `.dockerignore`
**Purpose**: Exclude unnecessary files from Docker build context.

**Why it matters**:
- Faster builds (smaller context)
- Smaller image size
- Security (no .env files copied)

**Excluded**:
- node_modules (reinstalled in container)
- .next (rebuilt in container)
- .env files (provided at runtime)
- .git, .vscode, etc.

### 5. `nginx.conf`
**Purpose**: Nginx reverse proxy configuration for production.

**Features**:
- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers (HSTS, CSP, etc.)
- Static file caching
- WebSocket support
- Gzip compression ready
- Request timeouts
- Access/error logging

**Deployment location**: `/etc/nginx/sites-available/fantasy-app`

**Key sections**:
- **Port 80**: HTTP server (redirects to HTTPS)
- **Port 443**: HTTPS server (main application)
- **Proxy settings**: Forwards to localhost:3000
- **Cache rules**: Optimizes static asset delivery
- **Security headers**: Protects against common attacks

### 6. `deploy-cloud.sh`
**Purpose**: Interactive deployment automation script.

**Features**:
- Environment validation
- Multiple deployment modes
- Error handling
- Colored output
- Health checks
- Git integration

**Options**:
1. **Fresh deployment**: First-time setup (build & start)
2. **Update deployment**: Pull changes & rebuild
3. **Stop application**: Graceful shutdown
4. **View logs**: Real-time log streaming
5. **Check status**: Container health & resources

**Usage**:
```bash
chmod +x deploy-cloud.sh
./deploy-cloud.sh
```

**Requirements**:
- .env file must exist
- Docker installed
- Docker Compose installed

### 7. `fantasy-app.service`
**Purpose**: Systemd service file for automatic startup.

**Benefits**:
- Auto-start on server boot
- Auto-restart on failure
- Managed by systemd
- System-level integration

**Installation**:
```bash
sudo cp fantasy-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable fantasy-app
sudo systemctl start fantasy-app
```

**Commands**:
```bash
sudo systemctl status fantasy-app    # Check status
sudo systemctl restart fantasy-app   # Restart
sudo systemctl stop fantasy-app      # Stop
sudo systemctl disable fantasy-app   # Disable auto-start
```

### 8. `.env.example`
**Purpose**: Template for environment variables.

**Required variables**:
- `AUTH_SECRET`: NextAuth.js secret key
- `AUTH_URL`: Your production URL
- `AUTH_DISCORD_ID`: Discord OAuth client ID
- `AUTH_DISCORD_SECRET`: Discord OAuth secret
- `ADMIN_DISCORD_IDS`: Comma-separated admin Discord IDs
- `DATABASE_URL`: PostgreSQL connection string

**Setup**:
```bash
cp .env.example .env
nano .env  # Fill in your values
```

## Documentation Files

### 9. `DEPLOYMENT.md`
**Purpose**: Comprehensive deployment guide.

**Content**:
- Step-by-step instructions
- Prerequisites checklist
- Discord OAuth setup
- Server configuration
- Nginx setup
- SSL certificate installation
- Firewall configuration
- Troubleshooting
- Maintenance commands
- Backup strategies
- Security best practices

**Audience**: DevOps, system administrators, technical users

### 10. `CLOUD-DEPLOY-QUICK-START.md`
**Purpose**: Fast deployment guide for experienced users.

**Content**:
- Quick setup commands
- One-liner installations
- Essential commands only
- Command reference
- Troubleshooting shortcuts
- Performance tips

**Audience**: Experienced developers who want to deploy quickly

## Deployment Workflows

### Fresh Cloud Deployment

```bash
# 1. Server setup (one-time)
curl -fsSL https://get.docker.com | sh
apt install docker-compose nginx certbot python3-certbot-nginx git -y

# 2. Clone repository
cd /var/www
git clone YOUR_REPO_URL fantasy-app
cd fantasy-app

# 3. Configure environment
cp .env.example .env
nano .env  # Add your values

# 4. Deploy application
chmod +x deploy-cloud.sh
./deploy-cloud.sh  # Select option 1

# 5. Configure Nginx
cp nginx.conf /etc/nginx/sites-available/fantasy-app
nano /etc/nginx/sites-available/fantasy-app  # Update domain
ln -s /etc/nginx/sites-available/fantasy-app /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 6. Get SSL certificate
certbot --nginx -d yourdomain.com

# 7. Configure firewall
ufw allow 22 && ufw allow 80 && ufw allow 443
ufw enable
```

### Update Existing Deployment

```bash
cd /var/www/fantasy-app
./deploy-cloud.sh  # Select option 2
```

or manually:

```bash
git pull
docker-compose -f docker-compose.production.yml up -d --build
```

### Development Testing

```bash
# Local testing
docker-compose up -d
docker-compose logs -f
```

## Environment Variables

### Production Requirements

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | ✅ Yes | Must be random 32+ characters |
| `AUTH_URL` | ✅ Yes | Must match your domain (https) |
| `AUTH_DISCORD_ID` | ✅ Yes | From Discord Developer Portal |
| `AUTH_DISCORD_SECRET` | ✅ Yes | From Discord Developer Portal |
| `ADMIN_DISCORD_IDS` | ✅ Yes | At least one admin user |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection (SSL mode required) |
| `NODE_ENV` | Auto | Set to 'production' by Docker |
| `PORT` | Auto | Set to 3000 by Docker |
| `HOSTNAME` | Auto | Set to 0.0.0.0 by Docker |

### Generating AUTH_SECRET

```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Security Considerations

### Docker Security
- ✅ Non-root user in container
- ✅ Resource limits configured
- ✅ No secrets in Dockerfile
- ✅ Minimal base image (Alpine)
- ✅ Multi-stage build (smaller attack surface)

### Nginx Security
- ✅ Security headers configured
- ✅ SSL/TLS with strong ciphers
- ✅ HSTS enabled
- ✅ Hidden file protection
- ✅ Request size limits

### Application Security
- ✅ Environment variables for secrets
- ✅ Database SSL mode required
- ✅ Discord OAuth authentication
- ✅ Admin role protection

## Monitoring & Maintenance

### Health Checks

**Container health**:
```bash
docker ps  # Check if container is running
docker inspect fantasy-sports-app | grep Health -A 10
```

**Application health**:
```bash
curl http://localhost:3000
# Should return 200 OK
```

**Nginx health**:
```bash
systemctl status nginx
nginx -t
```

### Logs

**Application logs**:
```bash
docker logs fantasy-sports-app -f
docker logs --tail 100 fantasy-sports-app
```

**Nginx logs**:
```bash
tail -f /var/log/nginx/fantasy-app-access.log
tail -f /var/log/nginx/fantasy-app-error.log
```

**System logs**:
```bash
journalctl -u fantasy-app -f  # If using systemd service
```

### Resource Monitoring

```bash
# Container resources
docker stats fantasy-sports-app

# System resources
htop
free -h
df -h
```

## Backup Strategy

### Application Code
```bash
# Backup is handled by Git
git push origin main
```

### Database
```bash
# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump $DATABASE_URL > /var/backups/fantasy-$(date +\%Y\%m\%d).sql
```

### Environment Configuration
```bash
# Backup .env (encrypted)
tar czf env-backup.tar.gz .env
gpg -c env-backup.tar.gz
rm env-backup.tar.gz
```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker logs fantasy-sports-app`
2. Verify .env file exists and is complete
3. Check port 3000 availability: `netstat -tulpn | grep 3000`
4. Verify database connectivity
5. Check Docker daemon: `systemctl status docker`

### Nginx Issues

1. Test config: `nginx -t`
2. Check logs: `tail -f /var/log/nginx/error.log`
3. Verify proxy settings
4. Check SSL certificates: `certbot certificates`

### Database Connection

1. Test from container: `docker exec fantasy-sports-app node -e "console.log('test')"`
2. Verify DATABASE_URL format
3. Check database server status
4. Verify SSL mode and credentials

### Performance Issues

1. Check container resources: `docker stats fantasy-sports-app`
2. Review logs for errors
3. Monitor database queries (slow query log)
4. Check Nginx access logs for traffic patterns
5. Consider scaling resources

## Scaling Options

### Vertical Scaling
Increase container resources in `docker-compose.production.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
```

### Horizontal Scaling
1. Add load balancer (Nginx, HAProxy)
2. Run multiple containers
3. Use Docker Swarm or Kubernetes
4. Implement session storage (Redis)

### Database Scaling
1. Connection pooling (PgBouncer)
2. Read replicas
3. Query optimization
4. Caching layer (Redis)

## Getting Help

**Check these first**:
1. Application logs
2. Nginx error logs
3. Environment variables
4. Discord OAuth configuration
5. Database connection string
6. Firewall rules

**Common issues documented in**:
- `DEPLOYMENT.md` - Troubleshooting section
- `CLOUD-DEPLOY-QUICK-START.md` - Quick fixes

## Best Practices

1. **Always backup before updates**
2. **Test in staging environment first**
3. **Monitor logs after deployment**
4. **Keep system packages updated**
5. **Use strong secrets**
6. **Enable automatic SSL renewal**
7. **Set up monitoring alerts**
8. **Document custom changes**
9. **Regular security audits**
10. **Have rollback plan ready**

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Discord Developer Portal](https://discord.com/developers/docs)

---

**Questions or issues?** Check the troubleshooting sections in the deployment guides or review the application logs.
