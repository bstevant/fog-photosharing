from flask import Flask, jsonify, abort, request, make_response, url_for
from tinydb import TinyDB, where, Query
import uuid, time

photo1 = {
    'uuid': '0be9c1e3-ae5e-4abc-aa08-d64ad01abe37',
    'url': '03082005.jpg',
    'timestamp': '1123583543',
    'description': 'Cheese guitar !'
}

album1 = {
    'uuid': '4a4aff69-ff29-4c7e-8c71-ba05c847686a',
    'name': 'Test Album',
    'photos': [ 
        { 'uuid': '0be9c1e3-ae5e-4abc-aa08-d64ad01abe37' }
    ]
}

db = TinyDB('/metahub/db.json')
photos = db.table('photos')
albums = db.table('albums')

# Create unique UID in table
def create_uniq_uid(table):
    uid = str(uuid.uuid4())
    q = Query()
    p = table.search(q.uuid == uid)
    print(p)
    if len(p) >= 1:
        return create_uniq_uid(table)
    else:
        return uid

app = Flask(__name__)

@app.errorhandler(400)
def not_found(error):
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
    return jsonify({'photos': photos.all()})

####################################################################
# Route POST /photos/
# Returns created photo
@app.route('/photos', methods=['POST'])
def create_photo():
    if not request.json or not 'url' in request.json:
        abort(400)
    if not 'timestamp' in request.json:
        request.json['timestamp'] = str(int(time.time())) 
    if not 'description' in request.json:
        request.json['description'] = ''
    photo = {
        'uuid': create_uniq_uid(photos),
        'url': request.json['url'],
        'timestamp': request.json['timestamp'],
        'description': request.json['description']
    }
    photos.insert(photo)
    return jsonify({'photos': photo})

####################################################################
# Route GET /photos/<uuid>
# Returns metadata for photo
@app.route('/photos/<string:uid>', methods=['GET'])
def get_photos(uid):
    q = Query()
    p = photos.search(q.uuid == uid)
    if len(p) >= 1:
        return jsonify({'photos': p})
    if len(p) == 0:
        abort(404)

####################################################################
# Route PUT /photos/<uuid>
# Returns updated photo
@app.route('/photos/<string:uid>', methods=['PUT'])
def update_photo(uid):
    if not request.json \
       or not 'description' in request.json :
        abort(400)
    q = Query()
    p = photos.search(q.uuid == uid)
    if len(p) == 0:
        abort(404)
    p1 = p[0]
    photo = {
        'uuid': uid,
        'url': p1['url'],
        'timestamp': p1['timestamp'],
        'description': request.json['description']
    }
    photos.update(photo, q.uuid == uid)
    return jsonify({'photos': photo})


####################################################################
####################################################################
if __name__ == '__main__':
    #photos.insert(photo1)    
    #albums.insert(album1)    
    app.run(host='0.0.0.0', port=5000, debug=True)
    #app.run(host='::', port=5000)


