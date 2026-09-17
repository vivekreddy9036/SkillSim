# Combine an env file with one-off overrides

`--env-file` and `-e` compose: load the bulk config from a file, then layer
individual overrides on top for this specific run.

## Task

Recreate `envfiledemo` with both the env file and an extra one-off variable:

```bash
docker rm -f envfiledemo
docker run -d --name envfiledemo --env-file ~/app.env -e EXTRA=ok alpine sleep 3600
```
