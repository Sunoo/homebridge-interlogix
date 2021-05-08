# homebridge-aqicn

[![npm](https://img.shields.io/npm/v/homebridge-aqicn) ![npm](https://img.shields.io/npm/dt/homebridge-aqicn)](https://www.npmjs.com/package/homebridge-aqicn) [![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

[aqicn](http://aqicn.org) plugin for [Homebridge](https://github.com/nfarina/homebridge)

## Installation

1. Install Homebridge using the [official instructions](https://github.com/homebridge/homebridge/wiki).
2. Install this plugin using: `sudo npm install -g homebridge-interlogix`.
3. Add the homebridge user to the plugdev group so it can access the radio: `sudo usermod -a -G plugdev homebridge`
4. Update your configuration file. See sample config.json snippet below.

### Configuration

Configuration sample:

```json
"platforms": [
    {
        "platform": "interlogix"
    }
]
```
