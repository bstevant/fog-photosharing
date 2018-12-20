FROM byrnedo/alpine-curl

WORKDIR /
RUN apk update && apk add --no-cache bash bind-tools imagemagick

COPY curl-format.txt ./

ENTRYPOINT ["/bin/sh"]
