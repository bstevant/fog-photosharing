#!/bin/sh

PHOTO1='{"hash":"aaa","url":"test.jpg","type":"image/jpg"}'
PHOTO2='{"hash":"bbb","url":"another.png","type":"image/png"}'
DESC1='{"description":"hello"}'

#curl http://localhost:5000/photos
#curl -H "Content-Type: application/json" -X POST -d $PHOTO1 http://localhost:5000/photos
#curl http://localhost:5000/photos
#curl -H "Content-Type: application/json" -X POST -d $PHOTO2 http://localhost:5000/photos
curl http://localhost:5000/photos
curl http://localhost:5000/photos/aaa
curl http://localhost:5000/photos/bbb
curl -H "Content-Type: application/json" -X PUT -d $DESC1 http://localhost:5000/photos/bbb
curl http://localhost:5000/photos/bbb

