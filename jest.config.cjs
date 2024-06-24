module.exports = {
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts?$": ["@swc/jest"],
  },
};
