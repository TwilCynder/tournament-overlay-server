#! /usr/bin/env bash
script=$1
shift
if [[ $script != *.js ]]; then script="$script.js"; fi
node --env-file=.env $script $@
