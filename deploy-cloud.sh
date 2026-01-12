#!/bin/bash

# Fantasy Sports App - Cloud Deployment Script
# This script automates the deployment process on a cloud server

set -e  # Exit on any error

echo "=========================================="
echo "Fantasy Sports App - Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with your configuration."
    echo "You can copy .env.example and fill in your values:"
    echo "  cp .env.example .env"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose first"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Compose is installed"

# Check required environment variables
echo ""
echo "Checking environment variables..."
required_vars=("AUTH_SECRET" "AUTH_URL" "AUTH_DISCORD_ID" "AUTH_DISCORD_SECRET" "DATABASE_URL")

source .env

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗${NC} Missing required variable: $var"
        exit 1
    else
        echo -e "${GREEN}✓${NC} $var is set"
    fi
done

# Deployment options
echo ""
echo "=========================================="
echo "Deployment Options:"
echo "1. Fresh deployment (build & start)"
echo "2. Update deployment (rebuild & restart)"
echo "3. Stop application"
echo "4. View logs"
echo "5. Check status"
echo "=========================================="
read -p "Select option (1-5): " option

case $option in
    1)
        echo ""
        echo -e "${YELLOW}Starting fresh deployment...${NC}"
        echo ""

        # Stop any existing containers
        echo "Stopping existing containers..."
        docker-compose -f docker-compose.production.yml down 2>/dev/null || true

        # Build the image
        echo "Building Docker image..."
        docker-compose -f docker-compose.production.yml build --no-cache

        # Start the container
        echo "Starting container..."
        docker-compose -f docker-compose.production.yml up -d

        # Wait for healthcheck
        echo "Waiting for application to be healthy..."
        sleep 10

        # Check if container is running
        if docker ps | grep -q fantasy-sports-app; then
            echo ""
            echo -e "${GREEN}=========================================="
            echo "✓ Deployment successful!"
            echo "==========================================${NC}"
            echo ""
            echo "Application is running on port 3000"
            echo "View logs: docker logs fantasy-sports-app -f"
            echo "Check status: docker ps"
            echo ""
        else
            echo ""
            echo -e "${RED}✗ Deployment failed!${NC}"
            echo "Check logs: docker logs fantasy-sports-app"
            exit 1
        fi
        ;;

    2)
        echo ""
        echo -e "${YELLOW}Updating deployment...${NC}"
        echo ""

        # Pull latest changes if in git repo
        if [ -d .git ]; then
            echo "Pulling latest changes..."
            git pull || echo "Warning: Could not pull latest changes"
        fi

        # Rebuild and restart
        echo "Rebuilding and restarting..."
        docker-compose -f docker-compose.production.yml up -d --build

        echo ""
        echo -e "${GREEN}✓ Update complete!${NC}"
        echo "View logs: docker logs fantasy-sports-app -f"
        ;;

    3)
        echo ""
        echo -e "${YELLOW}Stopping application...${NC}"
        docker-compose -f docker-compose.production.yml down
        echo -e "${GREEN}✓ Application stopped${NC}"
        ;;

    4)
        echo ""
        echo "Showing logs (Ctrl+C to exit)..."
        docker logs fantasy-sports-app -f
        ;;

    5)
        echo ""
        echo "Application Status:"
        echo "==================="
        docker ps -a | grep fantasy-sports-app || echo "Container not found"
        echo ""
        echo "Container Stats:"
        docker stats fantasy-sports-app --no-stream || echo "Container not running"
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
