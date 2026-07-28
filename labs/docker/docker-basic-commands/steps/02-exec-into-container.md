# Exec into a running container

`docker exec` runs a command inside an already-running container — useful for
inspecting state or debugging without stopping it.

## Task

Run a command inside `web` that writes a file to `/tmp/proof.txt`:

```bash
docker exec web sh -c "echo hello-skillsim > /tmp/proof.txt"
```
