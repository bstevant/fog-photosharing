FROM node

WORKDIR /webui

COPY package.json package.json
RUN npm install

COPY webui.js ./
COPY views ./views/
COPY files ./files/


EXPOSE 3080

ENTRYPOINT ["node", "webui.js"]