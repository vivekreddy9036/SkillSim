#!/bin/sh
test -s /tmp/history.txt && [ "$(wc -l < /tmp/history.txt)" -ge 2 ]
