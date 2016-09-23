FROM node:slim

WORKDIR /photohub

COPY package.json package.json
RUN npm install

COPY resources resources/
COPY app.js common.js photohub.js ./


EXPOSE 3000

CMD node app.js