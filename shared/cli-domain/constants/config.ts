/**
 * CLI_MAIN_CONFIG_OBJECT
 *
 * MAIN CONFIG OBJECT MAINTAINING CLI CONFIG COMMAND ITEMS
 * Acts as the immutable command registry for the XALOR CLI.
 *
 * @key - key: command identifier exposed to the CLI parser.
 * @key - flags: whitelist of supported command-line flags.
 * @key - envKey: The environment variable used internally to identify or activate the command throughout the CLI runtime.
 * @key - transformerMode: boolean to indicate if the CLI COMMAND has a role in our transformer, and thus a specified route
 */
export const CLI_MAIN_CONFIG_OBJECT = Object.freeze({
  watch: {
    key: 'watch',
    flags: [],
    envKey: 'XALOR_CLI_WATCH',
    transformerMode: true,
  },
  compile: {
    key: 'compile',
    flags: [],
    envKey: 'XALOR_CLI_COMPILE',
    transformerMode: true,
  },
  studio: {
    key: 'studio',
    flags: [],
    envKey: 'XALOR_CLI_STUDIO',
    transformerMode: true,
  },
  help: {
    key: 'help',
    flags: [],
    envKey: 'XALOR_CLI_HELP',
    transformerMode: false,
  },
  vacuum: {
    key: 'vacuum',
    flags: [],
    envKey: 'XALOR_CLI_VACUUM',
    transformerMode: true,
  },
  audit: {
    key: 'audit',
    flags: ['fix', 'json', 'verbose', 'debug'] as const,
    envKey: 'XALOR_CLI_AUDIT',
    transformerMode: false,
  },
  clear: {
    key: 'clear',
    flags: [],
    envKey: 'XALOR_CLI_CLEAR',
    transformerMode: true,
  },
} as const);
