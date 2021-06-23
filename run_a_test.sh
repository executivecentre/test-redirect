#!/usr/bin/bash
_term() { 
  echo "Caught SIGTERM signal!" 
  kill -TERM "$child" 2>/dev/null
}

trap _term SIGTERM

node ./index.js "$@" &

child=$!
wait "$child"