// Stub for build
export const AntiLeakService = {
  detectLeakage: () => ({ detected: false, severity: "none" }),
  shouldBlockMessage: () => false,
  calculateUserTrustLevel: () => 1
};

export const AntiLeakServiceWithLogging = {
  detectAndLogLeakage: () => ({ detected: false, severity: "none" })
};
