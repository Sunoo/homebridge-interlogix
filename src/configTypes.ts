import { PlatformIdentifier, PlatformName } from 'homebridge';

export type InterlogixPlatformConfig = {
  platform: PlatformName | PlatformIdentifier;
  name?: string;
  dontLearn?: boolean;
};