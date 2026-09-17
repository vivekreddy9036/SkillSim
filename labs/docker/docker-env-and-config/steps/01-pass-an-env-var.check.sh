#!/bin/sh
docker exec envdemo printenv GREETING 2>/dev/null | grep -q '^hello-skillsim$'
