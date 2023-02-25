#!/usr/bin/env bash
echo "$1 $2"
side=$1;
pristine="";
if [ $1 == "clean" ];
then
pristine="--pristine"
side=$2
fi
echo "Side is $side"
if [[ $side == "left" || $side == "right" ]];
then
west build -s "/workspaces/zmk/app/" $pristine -b corneish_zen_v2_$side -d build/$side -- -DZMK_CONFIG="/workspaces/zmk/cornish-zen-config/config/"
else
echo "Side should be left or right"
fi