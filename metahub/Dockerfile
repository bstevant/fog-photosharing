FROM python:onbuild

WORKDIR /metahub

COPY metahub.py ./
COPY consuldb.py ./
COPY run-metahub.sh ./

EXPOSE 5000

ENTRYPOINT ["/bin/sh", "/metahub/run-metahub.sh"]