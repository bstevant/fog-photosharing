FROM byrnedo/alpine-curl

WORKDIR /
RUN apk update && apk add --no-cache bash bind-tools imagemagick

COPY curl-format.txt ./

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["/bin/sh", "-c", "while true; sleep 20; done"]