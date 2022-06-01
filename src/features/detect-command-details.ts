import { log } from "../deps/log.std.ts";
import { parseDenoModuleUrl } from "./parse-deno-module-url.ts";

/**
 * This function detects all required information for updating that command script
 * from the available command script itself.
 *
 * @param commandFile The filepath from the command file in question (only for better debugging messages)
 * @param commandFileString A string extracted from a command script generated by `deno install`
 */
export function detectCommandDetails(
  commandFile: string,
  commandFileString: string,
  force = false,
) {
  const [_shebang, denoComment, execCommand] = commandFileString.split("\n");

  if (!force && denoComment !== "# generated by deno install") {
    throw new Deno.errors.InvalidData(
      `Command File "${commandFile}" may not have been generated by "deno install"! Force proceed by running again with -f (force). 
      File Content: 
      
      ${commandFileString}`,
    );
  }

  const commandSplit = execCommand.split(" ");
  const commandModuleUrl = commandSplit.find((text) =>
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
  const sanitizedModuleUrl = new URL(commandModuleUrl.slice(1, -1));
  log.info(
    `Found: Command Module URL: "${sanitizedModuleUrl}"`,
  );

  const { moduleName, moduleVersion, filepath } = parseDenoModuleUrl(
    sanitizedModuleUrl,
  );

  const execFlags = commandSplit.filter((section) =>
    !section.startsWith(`exec`) &&
    !section.startsWith(`deno`) &&
    !section.startsWith(`run`) &&
    !section.startsWith(`'http`) &&
    !section.startsWith(`"$@"`)
  );

  const commandDetails = {
    execCommand,
    execFlags,
    moduleUrl: sanitizedModuleUrl,
    moduleUrlString: sanitizedModuleUrl.toString(),
    moduleBaseUrl: new URL(`/x/${moduleName}`, sanitizedModuleUrl),
    moduleName,
    moduleVersion,
    filepath,
  };

  return commandDetails;
}
