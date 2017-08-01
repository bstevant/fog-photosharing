import os
import numpy as np


usecases = [
#    "uc0",
#    "uc1",
#    "uc2",
#    "uc3",
#    "uc4",
#    "uc5",
#    "uc7",
#    "uc8",
#    "uc9",
#    "uc0a",
#    "uc0b",
#    "uc0c",
#    "uc0d"
]

for i in range(0,20):
    usecase.append("uc1-"+str(i))

nodes = [
    "fog8",
    "fog9a",
    "fog10",
    "fog11",
    "g6fog",
#    "fog12"
]

def output_by_node(mynode = ""):
    results = {}
    for node in nodes:
        results[node] = {}
        for uc in usecases:
            text_file = open("logs/current/" + uc + "-" + node, "r")
            lines = text_file.readlines()
            l = lines[0]
            resarray = eval(l)
            for res in resarray:
                r = res.split(":")
                test = r[0]
                value = float(r[1])
                if test not in results[node].keys():
                    results[node][test] = {}
                if uc not in results[node][test].keys():
                    results[node][test][uc] = []
                results[node][test][uc].append(value)
            text_file.close()
    if mynode == "":
        return results
    elif mynode in results.keys():
        return { mynode: results[mytest] }

def output_by_test(mytest = ""):
    results = {}
    for node in nodes:
        for uc in usecases:
            for dirname in os.listdir('logs'):
                try:
                    text_file = open("logs/" + dirname + "/" + uc + "-" + node, "r")
                    lines = text_file.readlines()
                    l = lines[0]
                    resarray = eval(l)
                    for res in resarray:
                        r = res.split(":")
                        test = r[0]
                        try:
                            value = float(r[1])
                        except:
                            value = 0
                        if test not in results.keys():
                            results[test] = {}
                        if node not in results[test].keys():
                            results[test][node] = {}
                        if uc not in results[test][node].keys():
                            results[test][node][uc] = []
                        if value != 0:
                            results[test][node][uc].append(value)
                    text_file.close()
                except:
                    continue
    if mytest == "":
        return results
    elif mytest in results.keys():
        return { mytest: results[mytest] }

def print_results(results, output="plain"):
    if output == "csv":
        print "node "+ " ".join(usecases)
    for k1 in results.keys():
        for k2 in results[k1].keys():
            s = ""
            for uc in usecases:
                avg = np.average(results[k1][k2][uc])
                s += str(avg) + " "
            if output == "plain":
                print k1 + " " + k2 + " " + s
            if output == "csv":
                print k2 + " " + s

#print_results(output_by_test())
#print_results(output_by_test("GET / "), "csv")
#print_results(output_by_test("GET /nanoProvider.php "), "csv")
#print_results(output_by_test("GET /photos/hash "), "csv")
#print_results(output_by_test("POST test_img.png "), "csv")
print_results(output_by_test("GET /thumbs/hash "), "csv")
