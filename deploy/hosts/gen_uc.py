import random

nb_instances = 3
nb_uc = 2

nodes = {
    "fog8",
    "fog9a",
    "fog11",
#    "fog12",
    "g6fog"
}

bench_nodes = {
    "fog8",
    "fog9a",
    "fog10",
    "fog11",
#    "fog12",
    "g6fog"
}


preference_table = {
"fog8"	: [ "fog8"	, "fog11"	, "g6fog"	, "fog12"	, "fog9a"	,"fog10"],
"fog9a"	: [ "fog9a"	, "fog11"	, "fog12"	, "fog8"	, "g6fog"	,"fog10"],
"fog10"	: [ "fog10"	, "fog11"	, "fog12"	, "g6fog"	, "fog8"	,"fog9a" ],
"fog11"	: [ "fog11"	, "fog12"	, "fog8"	, "g6fog"	, "fog9a"	,"fog10"],
"fog12"	: [ "fog12"	, "fog11"	, "g6fog"	, "fog8"	, "fog9a"	,"fog10"],
"g6fog"	: [ "g6fog"	, "fog8"	, "fog12"	, "fog11"	, "fog9a"	,"fog10"],
};


def gen_hosts(srv,enabled, enastring):
    hstring = "[" + srv + "]\n"
    for n in nodes:
        hstring += n + ".ipv6.enstb.fr"
        if n in enabled:
            hstring += enastring
        hstring += "\n"
    hstring += "\n"
    return hstring

def find_best(n,nodes):
    preferred = preference_table[n]
    best = 100
    for i in nodes:
        try:
            j = preferred.index(i)
            best = min(best,j)
        except:
            continue
    if best < 100:
        return preferred[best]
    else:
        return "ERROR"
    
def gen_bench(uinodes,log):
    hstring = "[bench]\n"
    for n in bench_nodes:
        hstring += n + ".ipv6.enstb.fr"
        ui = find_best(n,uinodes)
        hstring += " webui_server=" + ui + ".ipv6.enstb.fr logs="+log+"\n"
    hstring += "\n"
    return hstring


def gen_hosts_content(log):
    ui_nodes = random.sample(nodes, nb_instances)
    mh_nodes = random.sample(nodes, nb_instances)
    ph_nodes = random.sample(nodes, nb_instances)
    th_nodes = random.sample(nodes, nb_instances)
    hosts_content = ""
    hosts_content += gen_hosts("webui", ui_nodes, " ui_present=true")
    hosts_content += gen_hosts("metahub", mh_nodes, " mh_present=true")
    hosts_content += gen_hosts("photohub", ph_nodes, " ph_present=true")
    hosts_content += gen_hosts("thumbhub", th_nodes, " th_present=true")
    hosts_content += gen_bench(ui_nodes, log)
    return hosts_content
    

for uc in range(0, nb_uc):
    hosts_file = "uc"+str(nb_instances)+"-"+str(uc)
    content = gen_hosts_content(hosts_file)
    with open(hosts_file, "w") as text_file:
        text_file.write(content)
