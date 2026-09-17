# Pass an environment variable at runtime

`-e KEY=value` sets an environment variable inside the container. This lets
one image behave differently per environment (dev/staging/prod) without ever
being rebuilt.

## Task

```bash
docker run -d --name envdemo -e GREETING=hello-skillsim alpine sleep 3600
```

Confirm it landed inside the container:

```bash
docker exec envdemo printenv GREETING
```
