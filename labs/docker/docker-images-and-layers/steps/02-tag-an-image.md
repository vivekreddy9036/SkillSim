# Tag an image

`docker tag` doesn't copy any data — it just adds another name pointing at the
same image ID, the same way a symlink points at a file.

## Task

Give `alpine:3.20` a second name:

```bash
docker tag alpine:3.20 skillsim/alpine-demo:1.0
```

Run `docker images` and notice both tags share the same `IMAGE ID`.
