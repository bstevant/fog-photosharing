FROM node:slim

WORKDIR /photohub
RUN apt-get update && apt-get install -y git imagemagick

COPY resources resources/
COPY package.json package.json
COPY app.js common.js photohub.js ./

RUN npm install

EXPOSE 3000

CMD node app.js