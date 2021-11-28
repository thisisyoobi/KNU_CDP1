#!/usr/bin/python3

import os
import sys
import getopt

options, ars = getopt.getopt(sys.argv[1:], 'hRt:p:i:')
target = ""
port = ""
inputFile = ""
helpOption = 0
restart = 0

def copyFile(inputFile):
    lastLine = ""
    with open("nohup.out","r") as f:
        lastLine = f.readlines()[-1]
    password = lastLine.split()[8].strip("\"")
    
    index = -1
    with open(inputFile, "r", encoding = 'cp949') as f:
        line = None
        while line != ' ':
            line=f.readline()
            index += 1
            if line.find(password):
                break

    copiedFilePath = os.path.dirname(inputFile) + "copied_file"
    with open(inputFile, "r", encoding = 'cp949') as f:
        with open(copiedFilePath,"w") as fc:
            copyIndex = -1
            line = None
            while line != ' ':
                line = f.readline()
                copyIndex += 1
                if copyIndex > index:
                    fc.write(line)

    return copiedFilePath 

    

for op ,p in options:
    if op == '-h':
        print("Options \n\n -t : target \n -p : port number \n -i : input file location \n -R : restart program \n log file name : nohup.out")
        helpOption += 1
    elif op == '-t':
        target = p
    elif op == '-p':
        port = p
    elif op == '-i':
        inputFile = p
    elif op == '-R':
        restart+=1        


if helpOption == 0 and restart == 0:
    os.system('nohup hydra -l root -P '+ inputFile + ' -f '+ target + " ssh -V -I -s " + port +" &")
elif helpOption == 0 and restart == 1:
    filePath = copyFile(inputFile) 
    os.system('nohup hydra -l root -P '+ filePath +  ' -f '+ target + " ssh -V -I -s " + port +" &")
