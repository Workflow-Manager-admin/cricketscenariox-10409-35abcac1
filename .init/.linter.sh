#!/bin/bash
cd /home/kavia/workspace/code-generation/cricketscenariox-10409-35abcac1/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

