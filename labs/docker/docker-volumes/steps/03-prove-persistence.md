# Prove the data outlives the container

Remove the container that wrote the data, then mount the same volume into a
brand-new container and read it back — the volume, not the container, is what
holds the data.

## Task

```bash
docker rm -f writer
docker run -d --name reader -v skillsim-data:/data alpine sleep 3600
docker exec reader cat /data/note.txt
```

You should still see `persisted-data`, even though `writer` no longer exists.
