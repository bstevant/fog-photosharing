FROM node:slim

WORKDIR /bench_bokeh

COPY package.json package.json
RUN npm install

COPY bench_bokeh.js ./
COPY test_img.png ./

CMD node bench_bokeh.js