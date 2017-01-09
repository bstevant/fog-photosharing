#WEBUI=http://[2a01:e35:8ae7:a760:76e5:43ff:fe3a:ead9]:32768
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
	echo "GET / \c"
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/"
	echo "GET /nanoProvider.php \c"
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/nanoPhotosProvider.php?albumID=0&_=1481673983982"
}

function upload_delete_img() {
	convert -size 1280x720  plasma:fractal  test_img.png 2>/dev/null
	echo "POST test_img.png \c"
	curl -w "@curl-format2.txt" -o result.json -s \
		 -F "file=@test_img.png" "$WEBUI/photos/"
	GENHASH=`python read_hash.py`
	echo "GET /thumbs/hash \c"
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/photos/hash/$GENHASH"
	echo "GET /photos/hash \c"
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/thumbs/hash/$GENHASH"
	echo "DELETE /photos/hash \c"
	curl -w "@curl-format2.txt" -X DELETE -s "$WEBUI/photos/$GENHASH"
	rm -f test_img.png result.json
}

run 3 get_frontpage
run 3 upload_delete_img


