FROM node:slim

WORKDIR /thumbhub

COPY package.json package.json
RUN npm install

COPY resources resources/
COPY app.js common.js thumbhub.js ./


EXPOSE 3050

CMD node app.js