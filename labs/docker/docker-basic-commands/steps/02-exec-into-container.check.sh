#!/bin/sh
docker exec web cat /tmp/proof.txt 2>/dev/null | grep -q 'hello-skillsim'
