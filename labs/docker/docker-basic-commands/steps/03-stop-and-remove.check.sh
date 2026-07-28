#!/bin/sh
! docker ps -a --filter "name=^web$" --format '{{.Names}}' | grep -q '^web$'
