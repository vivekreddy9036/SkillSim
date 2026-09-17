# Write a Dockerfile

A `Dockerfile` is a recipe for building an image: every instruction adds one
layer on top of a base image.

## Task

Create the app directory and a Dockerfile that serves a custom page with nginx:

```bash
mkdir -p ~/app
cat <<'EOF' > ~/app/index.html
Hello from SkillSim
EOF
cat <<'EOF' > ~/app/Dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EOF
```

`FROM` sets the base image; `COPY` adds your file as a new layer on top of it.
