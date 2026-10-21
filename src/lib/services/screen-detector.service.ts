import {Injectable} from '@angular/core';
import {IDevices} from '../models/devices';
import {BrowserEnum, OperatingSystemEnum, OrientationScreenEnum, ScreenEnums,} from '../models/screen.enums';
import {IScreenInfo} from '../models/screen.interfaces';
import {detectBrowser} from '../utils/browser.util';
import {detectOperatingSystem} from '../utils/os.util';

@Injectable({providedIn: 'root'})
export class ScreenDetectorService {
	public getScreen(devices: IDevices): IScreenInfo {
		const proportions = {
			width: window.screen.width,
			height: window.screen.height,
			innerWidth: window.innerWidth,
			innerHeight: window.innerHeight,
		};

		const maxSize = proportions.innerWidth >= proportions.innerHeight
			? proportions.innerWidth
			: proportions.innerHeight;

		return {
			devices,
			screen: {
				type: this.getType(maxSize, devices),
				orientation: this.getOrientation(),
				options: {
					operatingSystem: detectOperatingSystem(),
					browser: detectBrowser(),
					pixelRatio: window.devicePixelRatio,
					proportions,
					maxSize,
				},
			},
		};
	}

	public getEmptyScreen(devices: IDevices): IScreenInfo {
		return {
			devices,
			screen: {
				type: null,
				orientation: null,
				options: {
					operatingSystem: OperatingSystemEnum.Unknown,
					browser: BrowserEnum.Unknown,
					pixelRatio: null,
					proportions: {
						width: null,
						height: null,
						innerWidth: null,
						innerHeight: null,
					},
					maxSize: null,
				},
			},
		};
	}

	private getType(maxSize: number, devices: IDevices): ScreenEnums {
		if (maxSize > devices.tabletMaxSize) return ScreenEnums.Desktop;
		if (maxSize > devices.phoneMaxSize) return ScreenEnums.Tablet;
		return ScreenEnums.Phone;
	}

	private getOrientation(): OrientationScreenEnum {
		return window.matchMedia('(orientation: landscape)').matches
			? OrientationScreenEnum.Horizontal
			: OrientationScreenEnum.Vertical;
	}
}
