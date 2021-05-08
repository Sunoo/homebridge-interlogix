import {
  API,
  APIEvent,
  DynamicPlatformPlugin,
  HAP,
  Logging,
  PlatformAccessory,
  PlatformAccessoryEvent,
  PlatformConfig,
  Service
} from 'homebridge';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { InterlogixPlatformConfig } from './configTypes';
import { rtlMessage } from './rtlTypes';
import readline from 'readline';

let hap: HAP;
let Accessory: typeof PlatformAccessory;

const PLUGIN_NAME = 'homebridge-interlogix';
const PLATFORM_NAME = 'interlogix';

class InterlogixPlatform implements DynamicPlatformPlugin {
  private readonly log: Logging;
  private readonly api: API;
  private readonly config: InterlogixPlatformConfig;
  private readonly sensors = new Map<string, PlatformAccessory>();
  private readonly motionTimeouts = new Map<string, NodeJS.Timeout>();
  private rtl433?: ChildProcessWithoutNullStreams;

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.config = config as InterlogixPlatformConfig;
    this.api = api;

    api.on(APIEvent.DID_FINISH_LAUNCHING, this.didFinishLaunching.bind(this));
    api.on(APIEvent.SHUTDOWN, () => {
      this.rtl433?.kill('SIGKILL');
    });
  }

  didFinishLaunching(): void {
    this.log('Starting rtl_433...');
    this.rtl433 = spawn('rtl_433', ['-R', '100', '-f', '319508000', '-F', 'json'], { env: process.env });
    this.rtl433.on('exit', (code: number, signal: NodeJS.Signals) => {
      this.log('rtl_433 exited with code: ' + code + ' and signal: ' + signal);
    });

    const stdout = readline.createInterface({
      input: this.rtl433.stdout,
      terminal: false
    });
    stdout.on('line', (line: string) => {
      const message = JSON.parse(line) as rtlMessage;
      this.addUpdateAccessory(message);
    });
  }

  addUpdateAccessory(message: rtlMessage): void {
    if (!this.sensors.has(message.id) && !this.config.dontLearn) {
      this.log.debug('New sensor found - ID: ' + message.id + ', Type: ' + message.subtype);

      const uuid = hap.uuid.generate(message.id);
      const newAccessory = new Accessory(message.id, uuid);

      const accInfo = newAccessory.getService(hap.Service.AccessoryInformation);
      if (accInfo) {
        accInfo
          .setCharacteristic(hap.Characteristic.Manufacturer, message.model)
          .setCharacteristic(hap.Characteristic.Model, message.subtype)
          .setCharacteristic(hap.Characteristic.SerialNumber, message.id);
      }

      switch (message.subtype) {
        case 'contact':
          newAccessory.addService(hap.Service.ContactSensor);
          break;
        case 'motion':
          newAccessory.addService(hap.Service.MotionSensor);
          break;
        default:
          this.log.debug('Only motion and contact sensors are currently supported.');
          return;
      }

      this.configureAccessory(newAccessory);

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [newAccessory]);
    }
    this.updateState(message);
  }

  updateState(message: rtlMessage): void {
    const accessory = this.sensors.get(message.id);
    if (accessory) {
      const status = !(message.switch1 == 'CLOSED' || message.switch5 == 'CLOSED');
      const tamper = message.switch3 == 'OPEN';
      const lowBattery = message.battery_ok == 0;

      this.log.debug(message.id + ' - Status: ' + status + ', Tamper: ' + tamper + ', Low Battery: ' + lowBattery);
      this.log.debug(JSON.stringify(message));

      let sensorService: Service | undefined;

      switch (message.subtype) {
        case 'contact':
          sensorService = accessory.getService(hap.Service.ContactSensor)
            ?.setCharacteristic(hap.Characteristic.ContactSensorState, status);
          break;
        case 'motion':
          sensorService = accessory.getService(hap.Service.MotionSensor)
            ?.setCharacteristic(hap.Characteristic.MotionDetected, status);
          const oldTimeout = this.motionTimeouts.get(message.id);
          if (oldTimeout) {
            clearTimeout(oldTimeout);
            this.motionTimeouts.delete(message.id);
          }
          const newTimeout = setTimeout(() => {
            this.log.debug(message.id + ' - Motion timeout');
            sensorService
              ?.setCharacteristic(hap.Characteristic.MotionDetected, false);
          }, 60 * 1000);
          this.motionTimeouts.set(message.id, newTimeout);
          break;
      }

      if (sensorService) {
        sensorService
          .setCharacteristic(hap.Characteristic.StatusTampered, tamper)
          .setCharacteristic(hap.Characteristic.StatusLowBattery, lowBattery);
      }
    }
  }

  configureAccessory(accessory: PlatformAccessory): void {
    accessory.on(PlatformAccessoryEvent.IDENTIFY, () => {
      this.log(accessory.displayName, 'identify requested!');
    });

    accessory.getService(hap.Service.MotionSensor)
      ?.setCharacteristic(hap.Characteristic.MotionDetected, false);

    this.sensors.set(accessory.displayName, accessory);
  }
}

export = (api: API): void => {
  hap = api.hap;
  Accessory = api.platformAccessory;

  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, InterlogixPlatform);
};