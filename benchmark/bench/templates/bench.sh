#!/bin/bash

WEBUI=http://{{ webui_server }}:8080

function run() {
    number=$1
    shift
    for n in $(seq $number); do
      $@
	  sleep 5
    done
}

function get_frontpage() {
	echo -n "GET / "
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/"
	echo -n "GET /nanoProvider.php "
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/nanoPhotosProvider.php?albumID=0&_=1481673983982"
}

function upload_delete_img() {
	convert -size 1280x720  plasma:fractal  test_img.png 2>/dev/null
	echo -n "POST test_img.png "
	curl -w "@curl-format2.txt" -o result.json -s \
		 -F "file=@test_img.png" "$WEBUI/photos/"
	GENHASH=`python read_hash.py`
	echo -n "GET /thumbs/hash "
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/photos/hash/$GENHASH"
	echo -n "GET /photos/hash "
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/thumbs/hash/$GENHASH"
	echo -n "DELETE /photos/hash "
	curl -w "@curl-format2.txt" -X DELETE -s "$WEBUI/photos/$GENHASH"
	rm -f test_img.png result.json
}

run 3 get_frontpage
run 3 upload_delete_img


