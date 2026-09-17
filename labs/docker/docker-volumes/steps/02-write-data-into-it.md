# Mount the volume and write to it

`-v <volume>:<path>` mounts a named volume into a container at a path of your
choosing. Anything written there lives in the volume, not the container.

## Task

Start a container with the volume mounted at `/data`, then write to it:

```bash
docker run -d --name writer -v skillsim-data:/data alpine sleep 3600
docker exec writer sh -c "echo persisted-data > /data/note.txt"
```
