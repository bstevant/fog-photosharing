import os
import numpy as np


uc = "uc0"
usecases = [
    "uc0",
    "uc1",
    "uc2"
]

nodes = [
    "fog8",
    "fog9",
    "fog10",
    "fog11"
]

#for dirname in os.listdir('logs'):
for node in nodes:
    results = {}
    for uc in usecases:
        server = ""
        if uc == "uc0":
            server = "g6fog"
        elif uc == "uc1":
            server = "fog11"
        elif uc == "uc2":
            server = node
        text_file = open("logs/current/" + uc + "-" + node + "-" + server + ".ipv6.enstb.fr", "r")
        lines = text_file.readlines()
        l = lines[0]
        resarray = eval(l)
        for res in resarray:
            r = res.split(":")
            test = r[0]
            value = float(r[1])
            if test not in results.keys():
                results[test] = {}
            if uc not in results[test].keys():
                results[test][uc] = []
            results[test][uc].append(value)
        text_file.close()
    for test in results.keys():
        s = ""
        for uc in usecases:
            avg = np.average(results[test][uc])
            s += uc + ": " + str(avg) + " "
        print node + " " + test + " " + s
            
#for k in pairs:
#    avg = np.average(results[pair])
#    std = int(np.std(results[pair]) * 100 / avg)
#    print pair + ": " + str(avg) + " dev: " + str(std) + "% (" + str(len(results[pair])) + " results)"