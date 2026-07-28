#!/bin/sh
docker ps --filter "name=^web$" --filter "status=running" --format '{{.Names}}' | grep -q '^web$'
