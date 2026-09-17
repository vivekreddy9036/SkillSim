# Pull a specific tagged image

`docker pull` fetches an image from a registry without running it. Always
prefer a specific tag over `latest` — `latest` is just a mutable label, not a
guarantee of what you'll get.

## Task

Pull a pinned version of Alpine:

```bash
docker pull alpine:3.20
```
