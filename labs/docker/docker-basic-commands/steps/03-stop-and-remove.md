# Stop and remove a container

Containers should be cleaned up once you're done with them: `docker stop`
sends a graceful shutdown signal, `docker rm` deletes the stopped container.

## Task

Stop and remove the `web` container:

```bash
docker stop web
docker rm web
```

Confirm it's gone with `docker ps -a`.
