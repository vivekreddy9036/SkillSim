# Run a container from your image

Any image you build behaves exactly like an official one — it's just another
image to `docker run`.

## Task

Start a container from `myapp:1.0`, named `myapp-web`:

```bash
docker run -d --name myapp-web myapp:1.0
```

Confirm the page you wrote in step 1 actually made it into the image:

```bash
docker exec myapp-web cat /usr/share/nginx/html/index.html
```
