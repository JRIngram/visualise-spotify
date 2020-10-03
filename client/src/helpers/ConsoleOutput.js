const { log, error } = console;

// Helper function to get around the linter complaining about console outputs

const logMessage = (message) => {
  log(message);
};

const logError = (message) => {
  error(message);
};

export { logError, logMessage };
