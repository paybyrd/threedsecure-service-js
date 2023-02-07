export function noop() {}

export const isTransientStatusCode = (response: { status: number }) =>
  [409, 424, 500, 503, 504].includes(response.status);

export const convertToBase64UriJson = (data: any) =>
  btoa(JSON.stringify(data))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export const getBrowserData = () => ({
  javaEnabled: navigator.javaEnabled(),
  javascriptEnabled: true,
  language: navigator.language,
  userAgent: navigator.userAgent,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  timezoneOffset: new Date().getTimezoneOffset(),
  colorDepth: [48, 32, 24, 16, 15, 8, 4, 1].find((x) => x <= screen.colorDepth),
  acceptHeader:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
});
