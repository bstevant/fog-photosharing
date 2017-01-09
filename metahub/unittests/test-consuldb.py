from consuldb import ConsulDB

consulhost = "localhost"
consulport = "8500"

cdb = ConsulDB('metahub-test', consulhost, consulport)

hash1 = "QmUKsWHoKvn3r2waFv6fMMjEJBnk8f8KWz9BEmkSHxfbp3"
hash2 = "QmRDZsZDveutPK4N5ecm678T6AR1NApKh8qtShM98LhTdz"

cdb.put('photos' , hash1, { 'hash': hash1, 'url': 'DSC_009.jpg', 'type': 'image/jpg'})
cdb.put('photos' , hash2, { 'hash': hash2, 'url': '20060831.png', 'type': 'image/png'})

photos = cdb.getall('photos', 'hash')
print(str(photos))
photo1 = cdb.get('photos', hash1, {'hash': '', 'url': '', 'type': ''})
print(str(photo1))
photos_png = cdb.search('photos', 'type', 'image/png')
print(str(photos_png))
cdb.delete('photos', hash1)
photos = cdb.getall('photos', 'hash')
print(str(photos))
cdb.delete('photos', hash2)
photos = cdb.getall('photos', 'hash')
print(str(photos))
