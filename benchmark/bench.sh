#WEBUI=http://[2a01:e35:8ae7:a760:76e5:43ff:fe3a:ead9]:32768
WEBUI=http://[2001:660:7301:51:20d:b9ff:fe42:4d08]:32772
HASH="QmUKsWHoKvn3r2waFv6fMMjEJBnk8f8KWz9BEmkSHxfbp3"
function run() {
    number=$1
    shift
    for n in $(seq $number); do
      $@
    done
}

echo "==== GET /"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/"
echo "==== GET /nanoProvider.php"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/nanoPhotosProvider.php?albumID=0&_=1481673983982"
echo "==== GET /photos/hash"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/photos/hash/$HASH"
echo "==== GET /thumbs/hash"
run 3 curl -w "@curl-format2.txt" -o /dev/null -s "$WEBUI/thumbs/hash/$HASH"

