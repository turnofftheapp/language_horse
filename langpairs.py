#resources
#https://wiki.python.org/moin/UsingPickle
#https://thispointer.com/python-read-csv-into-a-list-of-lists-or-tuples-or-dictionaries-import-csv-to-list/

from csv import reader
import pickle
# read csv file as a list of lists
with open('langpairs.csv', 'r') as read_obj:
    # pass the file object to reader() to get the reader object
    csv_reader = reader(read_obj)
    # Pass reader object to list() to get a list of lists
    list_of_rows = list(csv_reader)
    print(list_of_rows)

# Save list_of_rows into a pickle file.
pickle.dump(list_of_rows, open("save.p","wb"))