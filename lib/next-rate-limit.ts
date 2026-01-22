// Stub for build
export const rateLimit = (options: any) => (handler: any) => handler;
export const authRateLimit = rateLimit({ interval: 900000 });
export const paymentRateLimit = rateLimit({ interval: 900000 });
export const verificationRateLimit = rateLimit({ interval: 900000 });
