#!/usr/bin/env python3
import traceback
import json
import os
import struct
import sys


def getMessage():
    rawLength = sys.stdin.buffer.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength).decode('utf-8')
    return json.loads(message)


def encodeMessage(messageContent):
    encodedContent = json.dumps(messageContent).encode('utf-8')
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}


def sendMessage(messageContent):
    encodedMessage = encodeMessage(messageContent)
    sys.stdout.buffer.write(encodedMessage['length'])
    sys.stdout.buffer.write(encodedMessage['content'])
    sys.stdout.buffer.flush()


def getOtpCode(key):
    result = run('ykman oath accounts code "{}"'.format(key))
    return result.strip().split(" ")[-1]

def listOtpAccounts():
    result = run('ykman oath accounts list')
    return result.strip().split("\n")

def handleGenerateOtpMessage(receivedMessage):

    responseMessage = {
        "type": "otpResponse",
        "target": receivedMessage["target"],
        "otp": getOtpCode(receivedMessage["keyName"]),
    }
    sendMessage(responseMessage)

def handleListOtpMessage():
    sendMessage({
        "type": "accountList",
        "accounts": listOtpAccounts()
    })

def run(command: str) -> str:
    """Runs a shell command and returns its output."""
    return os.popen(command).read()


if __name__ == "__main__":
    try:
        # Read message from standard input
        receivedMessage = getMessage()
        messageType = receivedMessage.get("type")

        if messageType == "generateOtp":
            handleGenerateOtpMessage(receivedMessage)
        elif messageType == "listAccounts":
            handleListOtpMessage()
        else:
            sendMessage({
                "type": "error",
                "error": "unknown message {}"
            }.format(messageType))
    except Exception as e:
        exc_info = sys.exc_info()
        sendMessage({
            "type": "exception",
            "exception": traceback.format_exception(*exc_info)
        })
