#! /usr/bin/env bash

touch .env

script=$1
shift
if [[ -z $script ]]; then echo "No script specified"; exit 1; fi
if [[ $script != *.js ]]; then script="$script.js"; fi
node --env-file=.env $script $@
