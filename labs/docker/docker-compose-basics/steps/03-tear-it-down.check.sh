#!/bin/sh
! docker ps -a --format '{{.Names}}' | grep -q '^skillsim-web-1$'
