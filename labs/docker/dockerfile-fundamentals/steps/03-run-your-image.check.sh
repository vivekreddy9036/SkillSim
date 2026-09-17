#!/bin/sh
docker ps --filter "name=^myapp-web$" --filter "status=running" --format '{{.Names}}' | grep -q '^myapp-web$' &&
docker exec myapp-web cat /usr/share/nginx/html/index.html 2>/dev/null | grep -q 'Hello from SkillSim'
