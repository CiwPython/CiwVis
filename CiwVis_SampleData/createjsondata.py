"""
Usage: createjsondata.py <dir_name> <numtrials> <maxtime>

Arguments
    dir_name    : Name of the directory from which to read in data files
    numtrials   : The number of trials run
Options
    -h          : displays this help file
"""
import docopt
import json
import pickle
from numpy import mean as npmean
import itertools


# Functions for use later on

def mean(lst):
    if len(lst) == 0:
        return 0
    return npmean(lst)

def load_obj(name):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

def data_by_week(recs, maxtime):
    weeks = [7.0*i for i in range(int(maxtime/7.0)+1)]
    dbw = []
    for w in weeks:
        dbw.append([r for r in recs if w < r.arrival_date < w+7.0])
    return dbw

def powerset(iterable):
    s = list(iterable)
    return itertools.chain.from_iterable(itertools.combinations(s, r) for r in range(len(s)+1))

def mean_wait_per_week(week, filter_node, filter_class):
    return mean([r.waiting_time for r in week if r.node in filter_node if r.customer_class in filter_class])

def keyise_combs(filter_node, filter_class, all_nodes, all_classes):
    N = ['1' if nd in filter_node else '0' for nd in all_nodes]
    C = ['1' if cls in filter_class else '0' for cls in all_classes]
    comb = N + C
    return 'Value' + ''.join(comb)

def create_tsobj(i, allfilters_N, all_nodes, allfilters_C, all_classes, weeks, dbw, trial):
    A = {'Week': weeks[i], 'Trial': trial}
    for n in allfilters_N:
        for c in allfilters_C:
            A[keyise_combs(n, c, all_nodes, all_classes)] = mean_wait_per_week(dbw[i], n, c)
    return A

def queue_length_over_time(trials, node):
    newdata = []
    for t in range(len(trials)):
        data_raw = trials[str(t)]
        data = [[r.arrival_date, r.queue_size_at_arrival] for r in data_raw if r.node == node] + [[r.exit_date, r.queue_size_at_departure, t] for r in data_raw if r.node == node]
        data.sort(key=lambda x: x[0])
        newdata.append(data)
    return newdata


def create_pdf(data, node):
    maxstate = max([r[1] for trial in data for r in trial])
    pdftrials = {i:[0 for _ in range(numtrials)] for i in range(maxstate+1)}
    pdfall = {i:0 for i in range(maxstate+1)}
    for t in range(numtrials):
        s = 0
        pdftrials[s][t] += (data[t][0][0])/maxtime
        pdfall[s] += (data[t][0][0])/(maxtime*numtrials)
        for d in range(len(data[t])-1):
            s = data[t][d][1]
            pdftrials[s][t] += (data[t][d+1][0] - data[t][d][0])/maxtime
            pdfall[s] += (data[t][d+1][0] - data[t][d][0])/(maxtime*numtrials)
        pdftrials[s][t] += (maxtime - data[t][-1][0])/maxtime
        pdfall[s] += (maxtime - data[t][-1][0])/(maxtime*numtrials)
    newdata = []
    for i in range(maxstate+1):
        newdata.append({'Trial':'Mean', 'State':i, 'Probability':pdfall[i], 'Node':node})
        for t in range(numtrials):
            newdata.append({'Trial':t, 'State':i, 'Probability':pdftrials[i][t], 'Node':node})
    return newdata

def area(l, h, x1, x2, y1, y2):
    if l < x1 and x1 < h and h <= x2:
        return (h-x1)*y1
    elif l < x1 and h > x2:
        return (x2-x1)*y1
    elif x1 <= l and l < x2 and x1 < h and h <= x2:
        return (h-l)*y1
    elif x1 <= l and l <= x2 and h > x2:
        return (x2-l)*y1
    return 0.0




# Import stuff
arguments = docopt.docopt(__doc__)
dirname = arguments['<dir_name>']
numtrials = int(arguments['<numtrials>'])
maxtime = float(arguments['<maxtime>'])
params = load_obj(dirname + '/params')
trials = {}
for i in range(numtrials):
    trials[str(i)] = load_obj(dirname + '/data_' + str(i))



# # Create waiting data
waitingdata = []
for i in range(numtrials):
    for r in trials[str(i)]:
        d = {'Waiting_time': r.waiting_time,
             'Arrival_date': r.arrival_date,
             'Node': r.node,
             'Customer_class': r.customer_class,
             'Trial': i}
        waitingdata.append(d)

with open(dirname + '/waitingdata.json', 'w') as outfile:
    json.dump(waitingdata, outfile)




# # Create time series data
weeks = [7.0*i for i in range(int(maxtime/7.0)+1)]
all_nodes = set(range(1, params['Number_of_nodes'] + 1))
all_classes = set(range(params['Number_of_classes']))
allfilters_N = (n for n in powerset(all_nodes) if len(n) > 0)
allfilters_C = (c for c in powerset(all_classes) if len(c) > 0)
time_series_data = []
for t in range(numtrials):
    dbw = data_by_week(trials[str(t)], maxtime)
    time_series_data.extend([create_tsobj(i, allfilters_N, all_nodes, allfilters_C, all_classes, weeks, dbw, t) for i in range(len(weeks))])


with open(dirname + '/time_series_data.json', 'w') as outfile:
    json.dump(time_series_data, outfile)




# # Create queue length data
queue_length_data = []
pdf_data = []
for node in all_nodes:
    queue_length_data.append(queue_length_over_time(trials, node))


weeks_extend = weeks + [maxtime]

ses = []
for node in all_nodes:
    for trial in range(numtrials):
        A = [(0.0, 0)] + queue_length_data[node-1][trial]
        for w in range(len(weeks_extend)-1):
            s = 0
            for i in range(len(A)-1):
                s += area(weeks_extend[w], weeks_extend[w+1], A[i][0], A[i+1][0], A[i][1], A[i+1][1])
            ses.append({'Node':node, 'Trial':trial, 'Week':weeks_extend[w], 'Length':s/(weeks_extend[w+1]-weeks_extend[w])})


with open(dirname + '/time_series_data_ql.json', 'w') as outfile:
    json.dump(ses, outfile)

for node in all_nodes:
    pdf_data.extend(create_pdf(queue_length_data[node-1], node))

with open(dirname + '/pdf.json', 'w') as outfile:
    json.dump(pdf_data, outfile)





# Create metadata
metadata = {'Number_of_nodes': params['Number_of_nodes'],
            'Number_of_classes': params['Number_of_classes'],
            'Number_of_trials': numtrials,
            'Weeks': weeks}

with open(dirname + '/metadata.json', 'w') as outfile:
    json.dump(metadata, outfile)
