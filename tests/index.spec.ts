import { describe, it } from "mocha";
import { resolve, throu } from "xufs";
import humps from "humps";

import {
  Callback,
  isParserTest,
  isCSVTest,
  Test,
  TestName,
  isAlphaetTest as isAlphabetTest,
} from "./types";
import path from "path";

// Tests
import createParserTest from "./callee/parser";
import createCSVTest from "./callee/csv";

// System
import url from "url";
import { setDefaultTextFormat, setTextFormat } from "../src/text-format";
import createAlphabetTest from "./callee/alphabet";

function capitalize(value: string) {
  const subs = value.substring(0, 1).toLocaleUpperCase();
  const computed = value
    .substring(1, value.length)
    .replace(/ \p{Ll}/gu, function (match, p1, offset, string) {
      return " " + match.toLocaleUpperCase();
    });

  return subs + computed;
}

const stack: { description: string; test: Test<any>; callee: Callback<any> }[] =
  [];

let self: any = this;
async function collect() {
  const isFormatFile = (pathname: string) => pathname.includes("format.json");

  await throu(
    {
      watcher: async (pathname) => {
        if (!isFormatFile(pathname)) {
          const key = path
            .basename(pathname)
            .replace(/.json/gi, "") as TestName;
          let callee: Callback<any>;
          if (isAlphabetTest(key)) {
            callee = createAlphabetTest(key);
          } else if (isParserTest(key)) {
            callee = createParserTest(key);
          } else if (isCSVTest(key)) {
            callee = createCSVTest(key);
          } else {
            throw new Error(`Test '${key}' has no implementation`);
          }

          const testPath = url.pathToFileURL(pathname).toString();
          let test = (await import(testPath, {
            assert: { type: "json" },
          })) as any;
          if (test.default) test = test.default;
          const description = capitalize(`${humps.pascalize(key)} Testing`);

          stack.push({ test, description, callee });
        }
      },
      observe: "files",
    },
    resolve("tests", "mocks"),
  );
}

try {
  await collect();
  for (const { description, callee, test } of stack) {
    describe(description, function () {
      const { items, skip } = test;

      this.beforeAll(function () {
        if (skip) this.skip();
      });

      for (const item of items) {
        it(item.message, function (done) {
          if (item.skip) this.skip();
          if (item.format) setTextFormat(item.format);
          else setDefaultTextFormat();
          const open = callee.call(this, item, done);
          if (!open) done();
        });
      }
    });
  }
} catch (error) {
  console.error(error);
}
