#!/bin/sh
grep -q 'image: nginx:alpine' ~/app/docker-compose.yml 2>/dev/null
