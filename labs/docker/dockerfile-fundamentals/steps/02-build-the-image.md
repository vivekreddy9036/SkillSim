# Build the image

`docker build` reads a Dockerfile and produces a tagged, runnable image.

## Task

Build your Dockerfile from step 1 and tag it `myapp:1.0`:

```bash
docker build -t myapp:1.0 ~/app
```

Confirm it exists with `docker images myapp`.
