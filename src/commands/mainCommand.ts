import { YargsInstance } from "../deps/yargs.ts";
import { MainArgs } from "./mainArgs.type.ts";
import { join } from "../deps/path.std.ts";
import { log } from "../deps/log.std.ts";
import { which } from "../deps/which.ts";

/**
 * @param args
 */
async function commandHandler({ cliName, targetVersion, force }: MainArgs) {
  log.info(
    `Trying to update cli "${cliName}" to version "${targetVersion}"...`,
  );

  const commandFile = await which(cliName);
  if (commandFile === undefined) {
    throw new Deno.errors.NotFound(
      `Script file for command "${cliName}" could not be found! This should not happen, if the cli is callable manually!`,
    );
  }
  log.info(
    `Found: Script file for command "${cliName}" (a.k.a Command File): ${commandFile}`,
  );

  const commandFileString = await Deno.readTextFile(commandFile);
  const [_shebang, denoComment, execCommand] = commandFileString.split("\n");

  if (!force && denoComment !== "# generated by deno install") {
    throw new Deno.errors.InvalidData(
      `Command File "${commandFile}" may not have been generated by "deno install"! Force proceed by running again with -f (force). 
      File Content: 
      
      ${commandFileString}`,
    );
  }

  const commandModuleUrl = execCommand.split(" ").find((text) =>
    text.startsWith("'http")
  );

  if (commandModuleUrl === undefined) {
    throw new Deno.errors.InvalidData(
      `Can't extract module url from Command File "${commandFile}".
      File Content: 
      
      ${commandFileString}`,
    );
  }
  // trim single quotes from module url
  const sanitizedModuleUrl = commandModuleUrl.slice(1, -1);

  log.info(
    `Found: Command Module URL: "${sanitizedModuleUrl}"`,
  );

  // const denoInstall = Deno.env.get("DENO_INSTALL");
  // if (denoInstall === undefined) {
  //   throw new Deno.errors.NotFound(`DENO_INSTALL env var could not be found`);
  // }
  // const denoBinFolder = join(denoInstall, "bin");
  // log.info(denoBinFolder);
}

function argsBuilder(yargs: YargsInstance) {
  return yargs
    .boolean(`force`)
    .alias(`force`, "f")
    .describe(
      `force`,
      `forces the cli to ignore all security validations during an update.`,
    )
    .positional(`cliName`, {
      describe: `The name of the cliCommand as installed by "deno install" `,
    })
    .option(`targetVersion`, {
      alias: "v",
      describe:
        `A version tag which maches an available tag for the module on deno.land/x. Default: latest`,
      default: "latest",
    });
}

/**
 * Area of yargs command definition module export
 */

export const command = "$0 <cliName>";
export const describe =
  "Upgrades a given deno module binary installed by `deno install` from deno.land/x";
export const builder = argsBuilder;
export const handler = commandHandler;
