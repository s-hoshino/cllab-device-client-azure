# -*- coding: utf-8 -*-

# standard
import pytz
import json
import time
from datetime import datetime

# pip
from tsl2561 import TSL2561
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

try:
    import RPi.GPIO as GPIO
except RuntimeError:
    pass

# local
from lib.dht11 import dht11

class Sensor:
    """ 各種センサデータを包括的に扱うためのクラス """

    def __init__(self, pin_dht11=4, demo=False):
        self.demo = demo
        if self.demo:
            return
        
        try:
            GPIO.setwarnings(False)
            GPIO.setmode(GPIO.BCM)
            GPIO.cleanup()
        except NameError:
            raise Exception('Please add option "--demo".')

        self.tsl2561 = TSL2561(debug=True)
        self.dht11 = dht11.DHT11(pin=pin_dht11)

    def is_demo(self):
        return self.demo

    def update_sensordata(self):
        """ 各種センサの値を取得し、インスタンスがもつセンサデータを更新する """

        if self.is_demo():
            self.lux = 123.45
            self.temperature = 12.34
            self.humidity = 45.67
            return

        self.lux = self.tsl2561.lux()

        result = self.dht11.read()
        while not result.is_valid():
            result = self.dht11.read()
            time.sleep(0.1)

        self.temperature = result.temperature
        self.humidity = result.humidity

    def get_lux(self):
        return self.lux

    def get_temperature(self):
        return self.temperature

    def get_humidity(self):
        return self.humidity