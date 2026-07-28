# Run your first container

`docker run` creates and starts a new container from an image. Common flags:

- `-d` — run in the background (detached)
- `--name` — give the container a friendly name instead of a random one

## Task

Start an `nginx:alpine` container in detached mode, named `web`:

```bash
docker run -d --name web nginx:alpine
```

Confirm it's running with `docker ps` — you should see `web` with status `Up`.
