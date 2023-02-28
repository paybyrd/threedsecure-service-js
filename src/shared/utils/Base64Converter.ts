export class Base64Converter {
    static convert(data: object) {
        const json = JSON.stringify(data);
        const base64Json = btoa(json);
        return base64Json
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
}