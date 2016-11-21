FROM python:onbuild

WORKDIR /metahub

COPY metahub.py ./

EXPOSE 5000

CMD ["python", "/metahub/metahub.py", "fdd7:d924:3d5f:d0c4::1", "8500"]