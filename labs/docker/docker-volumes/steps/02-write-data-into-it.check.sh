#!/bin/sh
docker exec writer cat /data/note.txt 2>/dev/null | grep -q 'persisted-data'
