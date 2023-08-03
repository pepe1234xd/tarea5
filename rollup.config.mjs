// Contents of the file /rollup.config.js
import path from "path"
import { empty, read, resolve, write, writeSync } from "xufs";
import { rollup } from "rollup";
import ts from 'rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';
import { nodeResolve as node } from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert { type: "json" };
import { replacer } from "dynason";

/** Bases the paths to the `lib` folder */
function lib(...paths) {
  return resolve("lib", ...paths);
}

const isDeclarationFile = (filename) => /\.d\.[mc]?ts$/gui.test(filename);
const isSourceMap = (filename) => /\.[cm]?[tj]s\.map$/gui.test(filename);

async function build() {

  /** @type {import('rollup').InputOptions} */
  const inputOptions = {
    input: "src/exports/index.ts",
    external: ["dynason"],
    plugins: [ts(), copy({
      targets: [
        { src: 'README.md', dest: lib("") },
        { src: 'package.json', dest: lib("") },
      ]
    })]
  };

  /** @type {import('rollup').OutputOptions[]} */
  const outputOptions = [
    {
      file: lib(pkg.module),
      format: 'esm',
      sourcemap: false
    },
    {
      file: lib(pkg.main),
      format: 'cjs',
      sourcemap: false
    }]

  let isGlobalTypesBundledAlready = false;
  // Wmptying folder before start
  await empty(lib(), true)
  // Creating bundle instance
  const bundle = await rollup(inputOptions);
  for (const outputOption of outputOptions) {
    const { output } = await bundle.generate(outputOption);
    for (const _ of output) {
      if (_.type === "chunk") {
        // Writing code to its file
        writeSync(outputOption.file, _.code);
        if (_.map) {
          // Write maps if enabled
          const name = `${outputOption.file}.map`;
          writeSync(name, JSON.stringify(_.map));
        }
      } else {
        // Write only once the global declaration file
        if (isDeclarationFile(_.fileName)) {
          if (!isGlobalTypesBundledAlready) {
            const name = lib(_.fileName.replace(/[mc]ts$/, "ts"));
            writeSync(name, _.source);
            isGlobalTypesBundledAlready = true;
          }
          // Write isolated types
          const name = path.join(path.dirname(outputOption.file), "index.d.ts");
          writeSync(name, _.source);
        } else if (!isSourceMap(_.fileName)) {
          // Write any other asset to the lib that is not a source map
          const name = lib(_.fileName);
          writeSync(name, _.source);
        }
      }
    }
  }
  // Finishes bundle session
  await bundle.close();
}

async function buildMinified() {
  /**
   * @type {import('rollup').InputOptions}
   * Is enough to use the ESM bundled lib as input
   */
  const inputOptions = {
    input: 'src/exports/umd.ts',
    plugins: [terser(), node(), ts()]
  };

  /** @type {import('rollup').OutputOptions[]} */
  const outputOptions = [
    {
      name: "spreadsheet-light",
      file: lib("umd", "index.js"),
      format: 'umd',
      sourcemap: true
    }]

  const bundle = await rollup(inputOptions);
  for (const outputOption of outputOptions) {
    const { output } = await bundle.generate(outputOption);
    for (const _ of output) {
      if (_.type === "chunk") {
        // Writing code to its file
        writeSync(outputOption.file, _.code);
        if (_.map) {
          // Write maps if enabled
          const name = `${outputOption.file}.map`;
          writeSync(name, JSON.stringify(_.map));
        }
      } else {
        // Write only once the declaration file
        if (isDeclarationFile(_.fileName)) {
          const name = path.join(path.dirname(outputOption.file), "index.d.ts");
          writeSync(name, _.source);
        }
      }
    }
  }
  // Finishes bundle session
  await bundle.close();
}

/**
 * Replaces the `'<version>'` tag with the current package version
 * @param {string[]} filenames
*/
async function versionage(filenames) {
  for (const filename of filenames) {
    let template = await read(filename);
    template = replacer(template, { version: pkg.version });
    await write(filename, template);
  }
}

await build();
// This depends on the plain builds
await buildMinified();
// Update version to documentations
await versionage([
  lib("README.md"),
]);