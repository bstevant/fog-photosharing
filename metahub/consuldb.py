###########################
# Emulate a (small) DB API over Consul KV store

import consul

class ConsulDB():
    
    def __init__(self, service, host='localhost', port='8500', separator="/"):
        self.consul = consul.Consul(host, port).kv
        self.service = service
        self.sep = separator
    
    def get(self, table, key, obj):
        if isinstance(obj, dict): 
            for k in obj.keys():
                thekey = self.sep.join((self.service, table, k, key))
                _, v = self.consul.get(thekey, separator=self.sep, recurse=False)
                if v != None and v['Value'] != None:
                    obj[k] = str(v['Value'], 'utf-8')
            return obj
        elif isinstance(obj, string):
                thekey = self.sep.join((self.service, table, obj, key))
                _, v = self.consul.get(thekey, separator=self.sep, recurse=False)
                if v != None:
                    return { obj: str(v['Value'], 'utf-8') }
        else :
            return None
    
    def getall(self, table, key):
        a = []
        thekey = self.sep.join((self.service, table, key))
        print('CDB: GETALL ' + thekey)
        _, v = self.consul.get(thekey, separator=self.sep, recurse=True)
        if v != None:
            for i in v:
                thatkey = i['Key']
                k = thatkey.split(self.sep)[-1]
                if k not in a:
                    a.append(k)
        print('CDB: Returned ' + str(len(a)) + " elements")
        return a

    def put(self, table, key, dictobj):
        if isinstance(dictobj, dict): 
            for k in dictobj.keys():
                thekey = self.sep.join((self.service, table, k, key))
                print('CDB: PUT ' + thekey + " value: " + str(dictobj[k]))
                self.consul.put(thekey, str(dictobj[k]).encode('utf-8'))
            return dictobj
        else:
            return None
    
    def search(self, table, k, value):
        a = []
        thekey = self.sep.join((self.service, table, k))
        print('CDB: SEARCH ' + thekey + " for value: " + value)
        _, v = self.consul.get(thekey, separator=self.sep, recurse=True)
        if v != None:
            for i in v:
                if str(i['Value'], 'utf-8') == value:
                    thatkey = i['Key']
                    akey = thatkey.split(self.sep)
                    key = akey[-1]
                    a.append(key)
            print('CDB: Returned ' + str(len(a)) + ' elements')
            return a
        else:
            print('CDB: Returned 0 elements')
            return None
            
