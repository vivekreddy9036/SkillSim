#!/bin/sh
! docker ps -a --format '{{.Names}}' | grep -q '^writer$' &&
docker exec reader cat /data/note.txt 2>/dev/null | grep -q 'persisted-data'
