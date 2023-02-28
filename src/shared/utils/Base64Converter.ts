import { Buffer } from "buffer/";

export class Base64Converter {
    static convert(data: object) {
        const json = JSON.stringify(data);
        const buffer = Buffer.from(json, 'utf-8');
        const base64Json = buffer.toString('base64');
        return base64Json
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
}