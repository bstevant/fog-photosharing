#!/bin/sh
IP=`cat /etc/resolv.conf | grep nameserver | cut -d ' ' -f2`
echo $IP "consul-host" >> /etc/hosts
python /metahub/metahub.py consul-host 8500