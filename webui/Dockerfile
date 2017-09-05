FROM node:slim

WORKDIR /webui

COPY package.json package.json
RUN npm install

COPY webui.js ./
COPY views ./views/
COPY files ./files/


EXPOSE 8080

ENTRYPOINT ["node", "webui.js"]