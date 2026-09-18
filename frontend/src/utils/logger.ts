/**
 * Frontend logger utility
 */
export const logger = {
  get info() {
    return console.info.bind(console, `[INFO] ${new Date().toISOString()} -`);
  },
  get warn() {
    return console.warn.bind(console, `[WARN] ${new Date().toISOString()} -`);
  },
  get error() {
    return console.error.bind(console, `[ERROR] ${new Date().toISOString()} -`);
  },
  get trace() {
    return console.debug.bind(console, `[TRACE] ${new Date().toISOString()} -`);
  }
};
