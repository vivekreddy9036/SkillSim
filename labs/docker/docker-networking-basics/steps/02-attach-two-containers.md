# Attach two containers to it

## Task

Start two containers on `skillsim-net`:

```bash
docker run -d --name svc-a --network skillsim-net alpine sleep 3600
docker run -d --name svc-b --network skillsim-net alpine sleep 3600
```
