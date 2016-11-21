FROM python:onbuild

WORKDIR /metahub

COPY metahub.py ./
COPY consuldb.py ./
COPY run-metahub.sh ./

EXPOSE 5000

CMD ["/bin/sh", "/metahub/run-metahub.sh"]