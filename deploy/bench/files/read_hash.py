import json
with open('result.json') as data_file:
    data = json.loads(data_file.read())
    print data["photos"][0]["hash"]