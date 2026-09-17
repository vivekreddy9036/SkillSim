#!/bin/sh
[ "$(docker image inspect -f '{{.Id}}' alpine:3.20 2>/dev/null)" = \
  "$(docker image inspect -f '{{.Id}}' skillsim/alpine-demo:1.0 2>/dev/null)" ]
