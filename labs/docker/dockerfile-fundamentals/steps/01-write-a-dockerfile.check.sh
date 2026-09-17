#!/bin/sh
grep -q '^FROM nginx:alpine' ~/app/Dockerfile 2>/dev/null &&
grep -q 'COPY index.html' ~/app/Dockerfile 2>/dev/null &&
grep -q 'Hello from SkillSim' ~/app/index.html 2>/dev/null
