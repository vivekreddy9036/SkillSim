FROM docker:24-dind

# docker:24-dind doesn't reliably ship the `docker compose` CLI plugin on every
# tag — install it explicitly from Alpine's own repo so this lab's steps never
# depend on an implementation detail of the base image.
RUN apk add --no-cache docker-cli-compose

COPY steps/ /skillsim/steps/
RUN chmod +x /skillsim/steps/*.check.sh

# Deliberately no custom ENTRYPOINT/CMD override: the base image's own
# dockerd-entrypoint.sh must stay PID 1 for its DinD setup to work correctly.
# terminal-server opens the user's interactive shell as a separate `exec`,
# not an attach to this process — see terminal-server/src/docker.ts.
