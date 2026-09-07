#! /usr/bin/env bash
script=$1
shift
node --env-file=.env $script.js $@