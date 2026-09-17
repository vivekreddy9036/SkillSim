#!/bin/sh
grep -q 'APP_MODE=production' ~/app.env 2>/dev/null &&
docker exec envfiledemo printenv APP_MODE 2>/dev/null | grep -q '^production$'
