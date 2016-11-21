from flask import Flask, jsonify, abort, request, make_response, url_for
from tinydb import TinyDB, where, Query
import uuid, time
import consul
from docopt import docopt
from consuldb import ConsulDB

db = TinyDB('./db.json')
photos = db.table('photos')
albums = db.table('albums')

consulhost = "localhost"
consulport = "8500"

# Create unique UID in table
def create_uniq_uid(table):
    uid = str(uuid.uuid4())
    q = Query()
    p = table.search(q.uuid == uid)
    if len(p) >= 1:
        return create_uniq_uid(table)
    else:
        return uid

app = Flask(__name__)

@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify( { 'error': 'Bad Request' } ), 400)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)
    

@app.route('/')
def index():
    return 'This is Metahub service'

####################################################################
# Route GET /albums/
# Returns list of albums
@app.route('/albums', methods=['GET'])
def list_albums():
    return jsonify({'albums': albums.all()})

####################################################################
# Route POST /albums/
# Returns created album
@app.route('/albums', methods=['POST'])
def create_album():
    if not request.json or not 'name' in request.json:
        abort(400)
    album = {
        'uuid': create_uniq_uid(albums),
        'name': request.json['name'],
        'photos': []
    }
    albums.insert(album)
    return jsonify({'albums': album})

####################################################################
# Route GET /albums/<uuid>
# Returns content of album
@app.route('/albums/<string:uid>', methods=['GET'])
def get_albums(uid):
    q = Query()
    a = albums.search(q.uuid == uid)
    if len(a) >= 1:
        return jsonify({'albums': a})
    if len(a) == 0:
        abort(404)

####################################################################
# Route PUT /albums/<uuid>
# Returns updated album
@app.route('/albums/<string:uid>', methods=['PUT'])
def update_album(uid):
    if not request.json \
       or not 'name' in request.json \
       or not 'photos' in request.json:
        abort(400)
    q = Query()
    a = albums.search(q.uuid == uid)
    if len(a) == 0:
        abort(404)
    album = {
        'uuid': uid,
        'name': request.json['name'],
        'photos': request.json['photos']
    }
    albums.update(album, q.uuid == uid)
    return jsonify({'albums': album})


####################################################################
# Route GET /photos/
# Returns list of photos
@app.route('/photos', methods=['GET'])
def list_photos():
    results = cdb.getall('photos','hash') 
    if len(results) >= 1:
        res = []
        for h in results:
            photo = cdb.get('photos', h, {'hash': '', 'url': '', 'type': '', 'timestamp': '', 'description': ''})
            if photo['hash'] != '':
                res.append(photo)
        return jsonify({'photos': res})
    else:
        return jsonify({'photos': []})

####################################################################
# Route POST /photos/
# Returns created photo
@app.route('/photos', methods=['POST'])
def create_photo():
    if not request.json \
    or not 'hash' in request.json \
    or not 'url' in request.json \
    or not 'type' in request.json:    
        abort(400)
    if not 'timestamp' in request.json:
        request.json['timestamp'] = str(int(time.time())) 
    if not 'description' in request.json:
        request.json['description'] = ''
    photo = {
        'url': request.json['url'],
        'hash': request.json['hash'],
        'type': request.json['type'],
        'timestamp': request.json['timestamp'],
        'description': request.json['description']
    }
    print("Created new photo entry hash: " + photo['hash'] + "url: " + photo['url'])
    cdb.put('photos', request.json['hash'], photo)
    return jsonify({'photos': [photo]})

####################################################################
# Route GET /photos/<hash>
# Returns metadata for photo
@app.route('/photos/<string:hash>', methods=['GET'])
def get_photos(hash):
    photo = cdb.get('photos', hash, {'hash': '', 'url': '', 'type': '', 'timestamp': '', 'description': ''})
    if photo['hash'] == '':
        abort(404)
    else:
        return jsonify({'photos': [photo]})

####################################################################
# Route PUT /photos/<hash>
# Returns updated photo
@app.route('/photos/<string:hash>', methods=['PUT'])
def update_photo(hash):
    if not request.json:
        abort(400)
    photo1 = cdb.get('photos', hash, {'hash': '', 'url': '', 'type': '', 'timestamp': '', 'description': ''})
    if photo1['hash'] == '':
        abort(404)
    photo2 = {
        'url': photo1['url'],
        'hash': hash,
        'type': photo1['type'],
        'timestamp': photo1['timestamp'],
        'description': request.json['description']
    }
    cdb.put('photos', hash, photo2)
    return jsonify({'photos': [photo2]})


####################################################################
####################################################################

myhelp="""Metahub (consul based)

Usage:
    metahub.py <ip_of_consul_agent> <port_of_consul_agent>

Options:
    -h --help
"""


if __name__ == '__main__':
    #photos.insert(photo1)    
    #albums.insert(album1)    
    #app.run(host='0.0.0.0', port=5000, debug=True)
    arguments = docopt(myhelp)
    print(arguments)
    if isinstance(arguments, dict):
        consulhost = arguments["<ip_of_consul_agent>"]
        consulport = arguments["<port_of_consul_agent>"]
    cdb = ConsulDB('metahub', consulhost, consulport)
    app.run(host='::', port=5000)
    


