#!/bin/sh
docker exec svc-a ping -c 2 -W 2 svc-b >/dev/null 2>&1
