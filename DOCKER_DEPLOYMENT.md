# Docker Deployment Guide

## Building and Publishing Docker Images

### Automated GitHub Actions
The project includes a GitHub Actions workflow that automatically builds and publishes Docker images to GitHub Container Registry (GHCR) when you push to `main` or `dev` branches or create tags.

**Setup:**
1. Push your code to GitHub
2. GitHub Actions will automatically build and publish the image to `ghcr.io/joaoariedi/money-balancer`

**Available tags:**
- `latest` - Latest from main branch
- `main` - Latest from main branch  
- `dev` - Latest from dev branch
- `v1.2.0` - Version tags (when you create git tags)

### Manual Build (Optional)
```bash
# Build locally
docker build -t money-balancer .

# Tag for GHCR
docker tag money-balancer ghcr.io/joaoariedi/money-balancer:latest

# Login and push
echo $GITHUB_TOKEN | docker login ghcr.io -u joaoariedi --password-stdin
docker push ghcr.io/joaoariedi/money-balancer:latest
```

## Portainer Deployment

### Using Docker Compose in Portainer

1. **Access your Portainer instance**
2. **Go to Stacks → Add Stack**
3. **Name your stack** (e.g., "money-balancer")
4. **Paste this docker-compose content:**

```yaml
services:
  money-balancer:
    image: ghcr.io/joaoariedi/money-balancer:latest
    container_name: money-balancer
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - money-balancer-data:/data
    environment:
      - ROCKET_ADDRESS=0.0.0.0
      - ROCKET_PORT=8000
      # Add any other environment variables needed
    networks:
      - money-balancer-network

networks:
  money-balancer-network:
    driver: bridge

volumes:
  money-balancer-data:
    driver: local
```

5. **Deploy the stack**

### Using Container Creation in Portainer

1. **Go to Containers → Add Container**
2. **Configure:**
   - **Name:** money-balancer
   - **Image:** `ghcr.io/joaoariedi/money-balancer:latest`
   - **Port mapping:** Host `8000` → Container `8000`
   - **Volumes:** Create volume mount `/data` to persist data
   - **Restart policy:** Unless stopped
   - **Environment variables:**
     - `ROCKET_ADDRESS=0.0.0.0`
     - `ROCKET_PORT=8000`

## Access and Configuration

- **Application URL:** `http://YOUR_SERVER:8000`
- **Data persistence:** SQLite database stored in `/data` volume
- **Configuration:** Environment variables in docker-compose or container settings

## Image Variants

- **Production:** `ghcr.io/joaoariedi/money-balancer:latest`
- **Development:** `ghcr.io/joaoariedi/money-balancer:dev`
- **Specific version:** `ghcr.io/joaoariedi/money-balancer:v1.2.0`

## Updating

### Via Portainer:
1. Go to your stack/container
2. Click "Update" 
3. Select "Re-pull image and redeploy"

### Via CLI:
```bash
docker pull ghcr.io/joaoariedi/money-balancer:latest
docker-compose up -d
```

## Troubleshooting

- **Check logs:** In Portainer, go to container → Logs
- **Data persistence:** Ensure `/data` volume is properly mounted
- **Port conflicts:** Make sure port 8000 is available on host
- **Image access:** Verify the GitHub Container Registry image is public or you have access