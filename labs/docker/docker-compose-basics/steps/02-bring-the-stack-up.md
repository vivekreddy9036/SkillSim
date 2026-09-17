# Bring the stack up

`docker compose up -d` reads the file and starts every service it describes.
`-p` names the project explicitly, so container names are predictable.

## Task

```bash
docker compose -p skillsim -f ~/app/docker-compose.yml up -d
```

Confirm with `docker ps` — you should see a container named `skillsim-web-1`.
