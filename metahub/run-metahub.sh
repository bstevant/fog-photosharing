#!/bin/sh
echo "fdd7:d924:3d5f:d0c4::1 docker-host" >> /etc/hosts
python /metahub/metahub.py docker-host 8500