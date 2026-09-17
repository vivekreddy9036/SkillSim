#!/bin/sh
docker ps --filter "name=^skillsim-web-1$" --filter "status=running" --format '{{.Names}}' | grep -q '^skillsim-web-1$'
