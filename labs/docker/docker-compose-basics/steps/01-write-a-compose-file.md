# Write a docker-compose.yml

Compose lets you describe one or more services declaratively instead of
typing long `docker run` commands by hand.

## Task

```bash
mkdir -p ~/app
cat <<'EOF' > ~/app/docker-compose.yml
services:
  web:
    image: nginx:alpine
EOF
```
