FROM node:slim

WORKDIR /thumbhub

COPY package.json package.json
RUN npm install

RUN mkdir -p resources/thumbs
COPY app.js common.js thumbhub.js test_img.png ./


EXPOSE 3050

ENTRYPOINT ["node", "app.js"]