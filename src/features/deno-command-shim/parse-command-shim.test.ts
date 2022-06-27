import {
  assertSnapshot,
  assertThrows,
  describe,
  it,
} from "../../deps/testing.std.ts";
import { parseCommandShim } from "./parse-command-shim.ts";

describe(`Function parse-deno-command-shim`, () => {
  describe(`with validateDenoShim === true`, () => {
    it(`should return correct shim datastructure (with deno.land)`, (t) => {
      const shimLines = [
        `#!/bin/sh`,
        `# generated by deno install`,
        `exec deno run 'https://deno.land/x/cowsay/cowsay.ts' "$@"`,
      ];
      const res = parseCommandShim("fakePath", shimLines);

      assertSnapshot(t, res);
    });

    it(`should throw on wrong deno comment`, () => {
      assertThrows(() => {
        parseCommandShim("fakePath", [
          `#!/bin/sh`,
          `# NOT generated by deno install - fake comment`,
          `exec deno run 'https://deno.land/x/cowsay/cowsay.ts' "$@"`,
        ]);
      });
    });

    it(`should parse nest.land shim `, (t) => {
      const shimLines = [
        `#!/bin/sh`,
        `# generated by deno install`,
        `exec deno run --allow-read=deps.ts --allow-write=deps.ts --allow-net=cdn.deno.land,api.deno.land,x.nest.land,raw.githubusercontent.com,github.com,api.github.com 'https://x.nest.land/dmm@2.1.0/mod.ts' "$@"`,
      ];
      const res = parseCommandShim("fakePath", shimLines);

      assertSnapshot(t, res);
    });
  });
});
