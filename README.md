# homebridge-interlogix

[![npm](https://img.shields.io/npm/v/homebridge-interlogix) ![npm](https://img.shields.io/npm/dt/homebridge-interlogix)](https://www.npmjs.com/package/homebridge-interlogix)

[Homebridge](https://github.com/homebridge/homebridge) Support for [Interlogix](https://www.interlogix.com) Wireless Contact and Motion Sensors using [rtl_433](https://github.com/merbanan/rtl_433)

## Installation

1. Install Homebridge using the [official instructions](https://github.com/homebridge/homebridge/wiki).
2. Install this plugin using: `sudo npm install -g homebridge-interlogix`.
3. Install rtl_433 ([build instructions](https://github.com/merbanan/rtl_433/blob/master/docs/BUILDING.md#linux--mac-os-x)).
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
