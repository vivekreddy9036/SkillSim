# Resolve a container by name

On a user-defined network, Docker's embedded DNS resolves other containers by
their `--name`, automatically — no manual IP wrangling, no `/etc/hosts` edits.

## Task

From inside `svc-a`, ping `svc-b` by name:

```bash
docker exec svc-a ping -c 2 svc-b
```
