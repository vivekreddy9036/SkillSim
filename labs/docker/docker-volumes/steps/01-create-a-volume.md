# Create a named volume

A container's own filesystem disappears with the container. A named volume is
storage Docker manages independently of any single container's lifetime.

## Task

Create a volume named `skillsim-data`:

```bash
docker volume create skillsim-data
```
