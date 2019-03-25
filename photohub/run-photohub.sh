#!/bin/sh

if [ ! -d /root/.ipfs ]
then
	./ipfs init
fi

./ipfs daemon --offline &
sleep 10
node app.js
