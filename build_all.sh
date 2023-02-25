#!/usr/bin/env bash
cd /workspaces/zmk
./cornish-zen-config/buildpi.sh $1 "left" &
./cornish-zen-config/buildpi.sh $1 "right" &
echo "Triggered the build"
jobs
wait