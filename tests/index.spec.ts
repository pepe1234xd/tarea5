import { describe, it } from "mocha";
import { read, readSync, resolve, throu } from "xufs";
import humps from "humps";

import {
  Callback,
  isParserTest,
  isSpreadsheetTest,
  Test,
  TestName,
  isAlphaetTest as isAlphabetTest,
  Thrower,
  Callee,
  ErrorCaseUnit,
  TestCaseUnit,
  isSourceTest,
} from "./types";
import path from "path";

// Tests
import createParserTest from "./callee/parser";
import createSpreadsheetTest from "./callee/spreadsheet";

// System
import url from "url";
import { setDefaultTextFormat, setTextFormat } from "../src/text-format";
import createAlphabetTest from "./callee/alphabet";
import { expect } from "chai";
import { replacer } from "dynason";
import createSourceTest from "./callee/source";

function capitalize(value: string) {
  const subs = value.substring(0, 1).toLocaleUpperCase();
  const computed = value
    .substring(1, value.length)
    .replace(/ \p{Ll}/gu, function (match, p1, offset, string) {
      return " " + match.toLocaleUpperCase();
    });

  return subs + computed;
}

const test_stack: {
  _id: string;
  skip: boolean;
  description: string;
  tests: TestCaseUnit<any, any>[];
  callback: Callback<any>;
}[] = [];

const error_stack: {
  _id: string;
  skip: boolean;
  description: string;
  errors: ErrorCaseUnit[];
  thrower: Thrower;
}[] = [];

let self: any = this;
async function collect() {
  const isFormatFile = (pathname: string) => pathname.includes("format.json");
  const isTemplateFile = (pathname: string) =>
    pathname.includes(".template.txt");

  await throu(
    {
      watcher: async (pathname) => {
        if (!isFormatFile(pathname) && !isTemplateFile(pathname)) {
          const key = path
            .basename(pathname)
            .replace(/.json/gi, "") as TestName;
          let callee: Callee<any>;
          if (isAlphabetTest(key)) {
            callee = createAlphabetTest(key);
          } else if (isParserTest(key)) {
            callee = createParserTest(key);
          } else if (isSpreadsheetTest(key)) {
            callee = createSpreadsheetTest(key);
          } else if (isSourceTest(key)) {
            callee = createSourceTest(key);
          } else {
            throw new Error(`Test '${key}' has no implementation`);
          }

          const testPath = url.pathToFileURL(pathname).toString();
          let test: Test<any> = (await import(testPath, {
            assert: { type: "json" },
          })) as any;
          if ((test as any).default) test = (test as any).default;

          const name = humps.pascalize(key);

          test_stack.push({
            _id: test._id,
            skip: test.skip,
            tests: test.items,
            description: capitalize(`${name} Testing`),
            callback: callee.cb,
          });
          const templates: Record<string, string> = {};
          if (test.errors) {
            for (let i = 0; i < test.errors.length; i++) {
              const error = test.errors[i];
              // If the error is an object, looks for a template to replace the values
              // found in the throws object
              if (typeof error.throws !== "string") {
                const file = resolve(
                  "tests",
                  "mocks",
                  "templates",
                  `${error.name}.template.txt`,
                );
                if (!templates[file])
                  templates[file] = readSync(file).replace(/\r/giu, "");
                error.throws = replacer(templates[file], error.throws, {
                  mode: "xml",
                });
              }
            }
            error_stack.push({
              _id: test._id,
              skip: test.skip,
              errors: test.errors,
              description: capitalize(`${name} Error Cases Testing`),
              thrower: callee.th,
            });
          }
        }
      },
      observe: "files",
    },
    resolve("tests", "mocks"),
  );
}

try {
  await collect();
  // Set default text format once
  setDefaultTextFormat();
  for (const { description, callback, tests, _id, skip } of test_stack) {
    describe(description, function () {
      this.beforeAll(function () {
        if (skip) this.skip();
      });
      for (const test of tests) {
        it(test.message, function (done) {
          if (test.skip) this.skip();
          if (test.format) setTextFormat(test.format);
          else setDefaultTextFormat();
          let open: any = null;
          open = callback.call(this, test, done);
          if (!open) done();
        });
      }
    });
  }
  for (const { _id, description, errors, skip, thrower } of error_stack) {
    describe(description, function () {
      this.beforeAll(function () {
        if (skip) this.skip();
      });

      for (const error of errors) {
        it(`${error.name} - ${error.message}`, function (done) {
          if (error.skip) this.skip();
          if (error.format) setTextFormat(error.format);
          else setDefaultTextFormat();
          expect(function () {
            thrower.apply({}, error.params);
          }).to.throws(error.throws);
          done();
        });
      }
    });
  }
} catch (error) {
  console.error(error);
}
