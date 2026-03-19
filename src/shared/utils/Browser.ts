import { IBrowser } from "../abstractions";

export class Browser {
    static create(culture?: string): IBrowser {
        const allowedBrowserColorDepth = [48, 32, 24, 16, 15, 8, 4, 1];
        const colorDepth = allowedBrowserColorDepth.find(x => x <= screen.colorDepth)!;
        return {
            javaEnabled: navigator.javaEnabled(),
            javascriptEnabled: true,
            language: (culture || navigator.language).replace(/^([a-zA-Z]+-[a-zA-Z]+)-.+$/, '$1'),
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezoneOffset: new Date().getTimezoneOffset(),
            colorDepth,
            acceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        };
    }
}