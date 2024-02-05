import { Command } from "commander";
import Debug from "debug";
import { configCheck } from "./configCheck";
import { addMagnetLink } from "./addMagnetLink";

const debug = Debug("realdebrid");

const program = new Command();

program
  .name("realdebrid-client")
  .description("CLI to interact with Real Debrid")
  .version("1.0.0");

program
  .command("config-check")
  .description("Check your real debrid config")
  .action(() => {
    configCheck(false);
  });

program
  .command("add-magnet <magnetFile>")
  .description("Add magnet file to Real Debrid")
  .option(
    "-t, --types <types>",
    "Specify file types to include, separated by commas"
  )
  .action((magnetFile, options) => {
    addMagnetLink(magnetFile, options.types);
  });
program.parse(process.argv);
