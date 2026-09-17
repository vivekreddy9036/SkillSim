#!/bin/sh
docker exec envfiledemo printenv APP_MODE 2>/dev/null | grep -q '^production$' &&
docker exec envfiledemo printenv EXTRA 2>/dev/null | grep -q '^ok$'
