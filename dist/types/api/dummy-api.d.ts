/**
 * Creates a no-op (dummy) implementation of the plugin API.
 *
 * This is used internally as a fallback when the plugin fails to initialize,
 * or as a "Self-Neuter" transformation when a plugin instance is destroyed.
 *
 * @returns A safe, non-functional `ILineToolsPlugin` object.
 */
export declare function createDummyPluginApi(): any;
