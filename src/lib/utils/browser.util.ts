import { BrowserEnum } from '../models/screen.enums';

export function detectBrowser(userAgent: string = navigator.userAgent): BrowserEnum {
	const ua = userAgent.toLowerCase();

	if (ua.includes('edg/')) return BrowserEnum.Edge;
	if (ua.includes('opera/') || ua.includes('opr/')) return BrowserEnum.Opera;
	if (ua.includes('chrome/')) return BrowserEnum.Chrome;
	if (ua.includes('firefox/')) return BrowserEnum.Firefox;
	if (ua.includes('safari/') && !ua.includes('chrome/')) return BrowserEnum.Safari;
	if (ua.includes('trident/') || ua.includes('msie')) return BrowserEnum.InternetExplorer;

	return BrowserEnum.Unknown;
}
