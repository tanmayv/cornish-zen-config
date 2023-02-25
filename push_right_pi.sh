#!/usr/bin/env bash
sudo mount /dev/$1 /media/usb
sudo cp ~/code/zmk/build/right/zephyr/zmk.uf2 /media/usb
sudo unmount /dev/$1