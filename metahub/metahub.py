from flask import Flask, jsonify, abort, request, make_response, url_for
from tinydb import TinyDB, where, Query

photo1 = {
    "uuid": "0be9c1e3-ae5e-4abc-aa08-d64ad01abe37",
    "filename": "03082005.jpg"
    "date": "1123583543"
}

db = TinyDB('/metahub/db.json')
photos = db.table("photos")
galleries = db.table("galleries")

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)
    
    
@app.route('/')
def index():
    return "This is Metahub service"

@app.route('/photos/')
def list_photos():
    return jsonify({"Photos": photos.all()})

@app.route('/photos/<string:uid>')
def get_photos(uid):
    q = Query()
    p = photos.search(q.uuid == uid)
    print(str(p))
    if len(p) <= 1:
        return jsonify({"Photos": p})
    if len(p) == 0:
        return not_found("404")

if __name__ == '__main__':
    photos.insert(photo1)    
    #app.run(host="0.0.0.0", port=5000, debug=True)
    app.run(host="::", port=5000)



