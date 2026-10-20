import { OperatingSystemEnum } from '../models/screen.enums';

export function detectOperatingSystem(userAgent: string = navigator.userAgent): OperatingSystemEnum {
    const ua = userAgent.toLowerCase();

    if (ua.includes('win')) return OperatingSystemEnum.Windows;
    if (ua.includes('mac')) return OperatingSystemEnum.MacOS;
    if (ua.includes('android')) return OperatingSystemEnum.Android;
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return OperatingSystemEnum.iOS;
    if (ua.includes('linux')) return OperatingSystemEnum.Linux;
    if (ua.includes('x11')) return OperatingSystemEnum.UNIX;

    return OperatingSystemEnum.Unknown;
}
