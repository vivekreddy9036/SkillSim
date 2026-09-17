# Inspect layer history

`docker history` shows every layer that makes up an image, in build order —
useful for spotting bloated or unexpected layers.

## Task

Write the full layer history for `alpine:3.20` to a file:

```bash
docker history --no-trunc alpine:3.20 > /tmp/history.txt
```

Open the file and read it — each line is one instruction from the image's
Dockerfile.
