FROM node:slim

WORKDIR /webui

COPY package.json package.json
RUN npm install

COPY webui.js ./
COPY views ./views/


EXPOSE 8080

CMD node webui.js