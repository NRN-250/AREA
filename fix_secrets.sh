#!/bin/sh
FILE="API/area/src/main/resources/application.properties"
if [ -f "$FILE" ]; then
  sed -i \
    -e 's/524004758108-2ja53b1r9d7gff502f6vag98ag43vfpu\.apps\.googleusercontent\.com/${GOOGLE_CLIENT_ID}/g' \
    -e 's/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/${GOOGLE_CLIENT_SECRET}/g' \
    -e 's/Ov23liUp1tnGuvLCRw4L/${GITHUB_CLIENT_ID}/g' \
    -e 's/d9174d83e93aa094b33125f44dcfcc0cf560c6d6/${GITHUB_CLIENT_SECRET}/g' \
    -e 's/noahnganji40@gmail\.com/${MAIL_USERNAME}/g' \
    -e 's/gvnf uayp nstu czvd/${MAIL_PASSWORD}/g' \
    "$FILE"
fi
