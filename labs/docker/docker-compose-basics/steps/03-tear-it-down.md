# Tear the stack down

`docker compose down` stops and removes every container the project started —
one command instead of stopping and removing each service by hand.

## Task

```bash
docker compose -p skillsim -f ~/app/docker-compose.yml down
```

Confirm with `docker ps -a` — `skillsim-web-1` should be gone.
