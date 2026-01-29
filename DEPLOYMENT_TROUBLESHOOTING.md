# AgroRent - EC2 Deployment Troubleshooting Guide

A complete record of all issues faced during deployment and their solutions.

---

## 🐳 Docker Build Errors

### Error 1: `openjdk:17-jdk-slim: not found`
**Cause:** The official `openjdk` Docker images have been deprecated and removed from Docker Hub.

**Solution:** Use Eclipse Temurin (the new standard Java image):
```dockerfile
# Before (broken)
FROM openjdk:17-jdk-slim

# After (fixed)
FROM eclipse-temurin:17-jdk-focal
```

---

### Error 2: `FromAsCasing: 'as' and 'FROM' keywords' casing do not match`
**Cause:** Docker warning about inconsistent casing in Dockerfile.

**Solution:** Use uppercase `AS` to match `FROM`:
```dockerfile
# Before
FROM node:18-alpine as build

# After
FROM node:18-alpine AS build
```

---

## 🌐 Network & Port Errors

### Error 3: `network agrorent-network was found but has incorrect label`
**Cause:** Network was created manually before docker-compose tried to create it.

**Solution:** Mark network as external in `docker-compose.yml`:
```yaml
networks:
  agrorent-network:
    external: true
```

---

### Error 4: `failed to bind host port for 0.0.0.0:80 - address already in use`
**Cause:** Nginx (host) and Docker container both trying to use port 80.

**Solution:** Use different port for Docker frontend (5173) and let Nginx proxy:
```yaml
frontend:
  ports:
    - "5173:80"  # Container port 80 mapped to host 5173
```

---

## 🔐 SSL/HTTPS Errors

### Error 5: `no valid A records found for knoxcloud.tech`
**Cause:** Domain DNS not pointing to EC2 IP address.

**Solution:**
1. Go to domain registrar
2. Add A Record: `@` → `YOUR_EC2_PUBLIC_IP`
3. Wait 5-15 minutes for propagation
4. Verify: `nslookup yourdomain.com`

---

### Error 6: `nslookup - Can't find domain: No answer`
**Cause:** DNS A record not configured.

**Solution:** Same as Error 5 - add A record at your domain registrar.

---

## 🖥️ Nginx Errors

### Error 7: `nginx.service is not active, cannot reload`
**Cause:** Nginx service was stopped.

**Solution:**
```bash
sudo systemctl start nginx
```

---

### Error 8: Nginx fails to start (old processes blocking)
**Cause:** Orphan nginx processes holding ports.

**Solution:**
```bash
sudo pkill nginx
sudo systemctl start nginx
```

---

### Error 9: Website shows default Nginx page instead of app
**Cause:** Nginx config has `try_files` instead of `proxy_pass`.

**Solution:** Update `/etc/nginx/sites-available/default`:
```nginx
location / {
    proxy_pass http://localhost:5173;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 📡 API & Registration Errors

### Error 10: Registration failed (no backend logs)
**Cause:** Frontend built with `VITE_BACKEND_URL=http://localhost:8080` - calls go to user's machine, not server.

**Solution:** Rebuild frontend with correct URL:
```bash
# On local machine
docker build -t vishwajit29/agrorent:frontend \
  --build-arg VITE_BACKEND_URL=https://www.knoxcloud.tech .
docker push vishwajit29/agrorent:frontend

# On EC2
docker pull vishwajit29/agrorent:frontend
docker stop agrorent-frontend && docker rm agrorent-frontend
docker run -d --name agrorent-frontend --network agrorent-network \
  -p 5173:80 --restart always vishwajit29/agrorent:frontend
```

---

### Error 11: Backend port not exposed (`8080/tcp` without host binding)
**Cause:** Missing `ports` section in docker-compose for backend.

**Solution:**
```yaml
backend:
  ports:
    - "8080:8080"
```

---

## 🔧 Docker-Compose Errors

### Error 12: `yaml.parser.ParserError - expected block end`
**Cause:** YAML indentation/formatting error.

**Solution:** Delete and recreate file with proper formatting:
```bash
rm docker-compose.yml
cat > docker-compose.yml << 'EOF'
# ... properly formatted YAML ...
EOF
```

---

### Error 13: `KeyError: 'ContainerConfig'`
**Cause:** Old docker-compose version (1.29.2) incompatible with newer images.

**Solution:** Use plain docker commands instead:
```bash
docker stop agrorent-frontend
docker rm agrorent-frontend
docker pull vishwajit29/agrorent:frontend
docker run -d --name agrorent-frontend --network agrorent-network \
  -p 5173:80 --restart always vishwajit29/agrorent:frontend
```

---

## 📍 Geolocation Error

### Error 14: "Could not detect location" on EC2
**Cause:** Browsers block GPS Geolocation API on non-HTTPS (insecure) connections.

**Solution:** Enable HTTPS using Let's Encrypt SSL certificate (see SSL setup in deployment guide).

---

## ✅ Final Working Architecture

```
User Browser
    ↓ HTTPS (443)
[Nginx - SSL Termination]
    ↓ proxy_pass
    ├── / → http://localhost:5173 (Frontend Container)
    └── /api → http://localhost:8080 (Backend Container)
                    ↓
              [MongoDB Container]
```

---

## 🚀 Quick Reference Commands

```bash
# View logs
docker logs agrorent-backend --tail 50
docker logs agrorent-frontend --tail 50

# Restart containers
docker restart agrorent-frontend agrorent-backend

# Check what's using a port
sudo lsof -i :80

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check container status
docker ps -a
```

---

*Document created: January 30, 2026*
*Deployment URL: https://www.knoxcloud.tech*
