#!/usr/bin/env python3

import urllib.parse
import requests
import requests_cache
import xml.etree.ElementTree as elementtree
import logging
import sys
import pprint

import flask

import os
import json

class TTCNextBus(object):
    def __init__(self, a="ttc"):
        self.base_url = "http://webservices.nextbus.com/service/publicXMLFeed?%s"
        self.a = a


    def command(self, **kwargs):
        '''Execute API call with paramateres. Raise an exception if it fails'''
        parameters = { 'a': self.a }
        parameters.update(kwargs)
        url =  self.base_url % urllib.parse.urlencode(parameters)
        logging.debug("request Url: %s", url)
        
        xml = requests.get(url).text
        root =  elementtree.fromstring(xml)

        xml_error = root.find("./Error")
        if xml_error != None:
            raise Exception("API error", xml_error.text, xml_error.attrib)

        return root

    def get_bus_list(self, stopId):
        ''' return list of {branch, vehicle, seconds, minutes, color, oppositeColor} for each scheduled arrival
            sorted by seconds field'''
        busses = []
        root = self.command(command="predictions", stopId=stopId)

        for predictions in root.findall("predictions"):
            route_tag = predictions.attrib['routeTag']
            stop_title = predictions.attrib['stopTitle']
            route = self.command(command="routeConfig", r=route_tag).find("route")
            for direction in predictions.findall("direction"):
                for prediction in direction.findall("prediction"):
                    bus = {k:v for k,v in prediction.attrib.items() if k in ['seconds', 'minutes', 'branch', 'vehicle']}
                    bus.update({k:v for k,v in route.attrib.items() if k in ['color', 'oppositeColor']})
                    bus.update({'stop_titles':v.split(" towards ") for k,v in direction.attrib.items() if k in ['title']})
                    bus.update({'route_tag': route_tag})
                    busses.append(bus)

        return sorted(busses, key=lambda d: int(d['seconds']))

    def get_stop(self, stopId):
        root = self.command(command="predictions", stopId=stopId)
        return root.find("predictions").attrib



app = flask.Flask(__name__)

@app.route('/')
def index():
    return flask.render_template('index.html', version=__version__)

@app.route('/schedule/<stopId>')
def schedule(stopId):
    foo = TTCNextBus()
    return json.dumps(foo.get_bus_list(stopId))

@app.route('/stops/<stopId>')
def get_stop_title(stopId):
    return json.dumps(TTCNextBus().get_stop(stopId))

@app.route('/weather/<coordinates>')
def get_weather(coordinates):
    api_key = os.environ['DARKSKY_API_KEY']
    url = "https://api.darksky.net/forecast/{}/{}?units=ca".format(api_key, coordinates)
    return  session.get(url).text

@app.route('/config/')
def get_config():
    with open('config.json') as f:
        return f.read()

@app.route('/version/')
def get_version():
    return _VERSION_JSON

if __name__ == '__main__':
    with open('version.json') as f:
        _VERSION_JSON = f.read()
        __version__ = json.loads(_VERSION_JSON)['semver']
    logging.basicConfig(level=logging.DEBUG)
    logging.info("Version: %s", __version__)
    logging.debug("version.json:\n%s", _VERSION_JSON)
    # Cache session used to economize the 1000 API free hits per month for darksky 
    session = requests_cache.CachedSession(backend='memory', expire_after=3600) 
    app.run(host='0.0.0.0')
