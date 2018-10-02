FROM byrnedo/alpine-curl

WORKDIR /
RUN apk update && apk add --no-cache bash

COPY curl-format.txt ./

ENTRYPOINT ["/bin/sh","-c"]
