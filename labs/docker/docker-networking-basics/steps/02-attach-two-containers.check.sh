#!/bin/sh
docker inspect svc-a --format '{{json .NetworkSettings.Networks}}' 2>/dev/null | grep -q skillsim-net &&
docker inspect svc-b --format '{{json .NetworkSettings.Networks}}' 2>/dev/null | grep -q skillsim-net
