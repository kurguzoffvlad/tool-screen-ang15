import { InjectionToken, Provider } from '@angular/core';
import { DEFAULT_DEVICES, IDevices } from '../models/devices';

export interface IToolScreenConfig {
    devices: IDevices;
    resizeDebounceMs: number;
}

export const DEFAULT_TOOL_SCREEN_CONFIG: IToolScreenConfig = {
    devices: DEFAULT_DEVICES,
    resizeDebounceMs: 50,
};

export const TOOL_SCREEN_CONFIG = new InjectionToken<IToolScreenConfig>('TOOL_SCREEN_CONFIG');

export function provideToolScreenConfig(config: Partial<IToolScreenConfig> = {}): Provider {
    return {
        provide: TOOL_SCREEN_CONFIG,
        useValue: {
            ...DEFAULT_TOOL_SCREEN_CONFIG,
            ...config,
            devices: { ...DEFAULT_DEVICES, ...(config.devices ?? {}) },
        },
    };
}
