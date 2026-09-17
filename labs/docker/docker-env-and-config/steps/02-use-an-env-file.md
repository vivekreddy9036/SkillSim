# Use an env file

Passing many `-e` flags gets unwieldy fast. `--env-file` loads a whole file of
`KEY=value` pairs at once — and, unlike a Dockerfile `ENV` instruction, the
values never become part of the image itself, so they don't show up for
anyone who only has the image (e.g. via `docker history`).

## Task

```bash
cat <<'EOF' > ~/app.env
APP_MODE=production
EOF
docker run -d --name envfiledemo --env-file ~/app.env alpine sleep 3600
```
