#WEBUI=http://[2a01:e35:8ae7:a760:76e5:43ff:fe3a:ead9]:32768
WEBUI=http://[2001:660:7301:51:20d:b9ff:fe42:4d08]:32783
HASH="QmUKsWHoKvn3r2waFv6fMMjEJBnk8f8KWz9BEmkSHxfbp3"
function run() {
    number=$1
    shift
    for n in $(seq $number); do
      $@
	  sleep 5
    done
}

function upload_delete_img() {
	convert -size 1280x720  plasma:fractal  test_img.png 2>/dev/null
	echo "==== POST test_img.png\c"
	curl -w "@curl-format2.txt" -o result.json -s \
		 -F "file=@test_img.png" "$WEBUI/photos/"
	GENHASH=`python read_hash.py`
	echo -n "==== GET /thumbs/hash"
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/photos/hash/$GENHASH"
	echo -n "==== GET /photos/hash"
	curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/thumbs/hash/$GENHASH"
	echo -n "==== DELETE /photos/hash"
	curl -w "@curl-format2.txt" -X DELETE -s "$WEBUI/photos/$GENHASH"
	rm -f test_img.png result.json
}

run 3 upload_delete_img
exit 0 

echo "==== GET /"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/"
echo "==== GET /nanoProvider.php"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/nanoPhotosProvider.php?albumID=0&_=1481673983982"
echo "==== GET /photos/hash"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/photos/hash/$HASH"
echo "==== GET /thumbs/hash"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/thumbs/hash/$HASH"

