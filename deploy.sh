#!/bin/bash

# Fantasy Sports App - Deployment Script
# This script helps deploy the application to a Digital Ocean droplet

set -e  # Exit on error

echo "======================================"
echo "Fantasy Sports App - Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with your environment variables."
    echo "See .env.example for reference."
    exit 1
fi

echo -e "${BLUE}Step 1: Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker is already installed${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Building Docker image...${NC}"
docker build -t fantasy-sports-app .
echo -e "${GREEN}✓ Docker image built successfully${NC}"

echo ""
echo -e "${BLUE}Step 3: Stopping existing container (if any)...${NC}"
if docker ps -a | grep -q fantasy-app; then
    docker stop fantasy-app || true
    docker rm fantasy-app || true
    echo -e "${GREEN}✓ Existing container stopped${NC}"
else
    echo "No existing container found"
fi

echo ""
echo -e "${BLUE}Step 4: Starting new container...${NC}"
docker run -d \
  --name fantasy-app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  fantasy-sports-app

echo -e "${GREEN}✓ Container started successfully${NC}"

echo ""
echo -e "${BLUE}Step 5: Waiting for application to start...${NC}"
sleep 5

echo ""
echo -e "${BLUE}Step 6: Checking container status...${NC}"
if docker ps | grep -q fantasy-app; then
    echo -e "${GREEN}✓ Container is running${NC}"

    echo ""
    echo "======================================"
    echo -e "${GREEN}Deployment successful!${NC}"
    echo "======================================"
    echo ""
    echo "Application is running at:"
    echo "  - http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker logs fantasy-app -f"
    echo "  Restart:      docker restart fantasy-app"
    echo "  Stop:         docker stop fantasy-app"
    echo "  Shell access: docker exec -it fantasy-app sh"
    echo ""
else
    echo -e "${RED}✗ Container failed to start${NC}"
    echo "View logs with: docker logs fantasy-app"
    exit 1
fi
