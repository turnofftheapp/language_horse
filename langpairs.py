#resources
#https://wiki.python.org/moin/UsingPickle
#https://thispointer.com/python-read-csv-into-a-list-of-lists-or-tuples-or-dictionaries-import-csv-to-list/

from csv import reader
import pickle
# read csv file as a list of lists
with open('langpairs.csv', 'r') as read_obj:
    # pass the file object to reader() to get the reader object
    csv_reader = reader(read_obj)
    # Get all rows of csv from csv_reader object as list of tuples
    list_of_tuples = list(map(tuple, csv_reader))
    print(list_of_tuples)

# Save list_of_rows into a pickle file.
pickle.dump(list_of_tuples, open("save.p","wb"))