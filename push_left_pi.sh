sudo mount /dev/$1 /media/usb
sudo cp ~/code/zmk/build/left/zephyr/zmk.uf2 /media/usb
sudo umount /dev/$1