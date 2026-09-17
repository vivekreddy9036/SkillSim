# Create a user-defined network

The default `bridge` network doesn't do DNS resolution by container name. A
user-defined bridge network does — it's the standard way to let containers
find each other by name.

## Task

Create a network named `skillsim-net`:

```bash
docker network create skillsim-net
```
