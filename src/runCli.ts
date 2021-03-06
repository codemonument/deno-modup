import { yargs } from "./deps/yargs.ts";
import { commands } from "./commands/index.ts";
import { VERSION } from "../VERSION.ts";

/**
 * The yargs parser instance.
 * Exported for easier unit testing
 */
export const parser = yargs()
  .command(commands)
  .showHelpOnFail(false, `Specify --help for available options`)
  .help(false)
  .version(VERSION);

/**
 * @param args should normally contain Deno.args, but can also contain mocked data for testing
 */
export async function runCli(args: string[]) {
  const res = await parser.parseAsync(args).argv;
}
