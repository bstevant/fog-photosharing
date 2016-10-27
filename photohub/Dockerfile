FROM node:slim

WORKDIR /photohub

COPY package.json package.json
RUN npm install
RUN wget https://dist.ipfs.io/go-ipfs/v0.4.4/go-ipfs_v0.4.4_linux-386.tar.gz && \
	tar -xzvf go-ipfs_v0.4.4_linux-386.tar.gz && \
	mv go-ipfs/ipfs . && \
	rm -rf go-ipfs* 

COPY resources resources/
COPY app.js common.js photohub.js run-photohub.sh ./


EXPOSE 3000
EXPOSE 4001

CMD run-photohub.sh