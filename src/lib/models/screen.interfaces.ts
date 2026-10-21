import { IDevices } from './devices';
import { BrowserEnum, OperatingSystemEnum, OrientationScreenEnum, ScreenEnums, } from './screen.enums';

export type TNullable<T> = T | null;
export type TScreen = ScreenEnums.Desktop | ScreenEnums.Tablet | ScreenEnums.Phone;
export type TOrientation = OrientationScreenEnum.Horizontal | OrientationScreenEnum.Vertical;

export interface IScreenProportions {
	width: TNullable<number>;
	height: TNullable<number>;
	innerWidth: TNullable<number>;
	innerHeight: TNullable<number>;
}

export interface IScreenOptions {
	operatingSystem: OperatingSystemEnum;
	browser: BrowserEnum;
	pixelRatio: TNullable<number>;
	proportions: IScreenProportions;
	maxSize: TNullable<number>;
}

export interface IScreenInfo {
	devices: IDevices;
	screen: {
		type: TNullable<TScreen>;
		orientation: TNullable<TOrientation>;
		options: IScreenOptions;
	};
}
