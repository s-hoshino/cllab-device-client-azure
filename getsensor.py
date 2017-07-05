# -*- coding: utf-8 -*-

# standard
import time
import json

# pip
import click

# local
from sensor import Sensor

@click.command()
@click.option('--demo', '-d', is_flag=True, help='Demo mode. (Send dummy data)')
@click.option('--pin', '-p', type=int, default=14, help='Pin number. (DHT11)')
def main(demo=False, pin=14):
    sensor = Sensor(pin_dht11=int(pin), demo=demo)
    sensor.update_sensordata()

    payload = {
        'temperature': None,
        'humidity': None,
        'lux': None,
    }

    payload['temperature'] = sensor.get_temperature()
    payload['humidity'] = sensor.get_humidity()
    payload['lux'] = sensor.get_lux()

    print(json.dumps(payload, indent=4))

if __name__ == '__main__':
    main()