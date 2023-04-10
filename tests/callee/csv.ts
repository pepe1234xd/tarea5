import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser, TestName, TestCSV } from "../types";

import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";

export default function createCSVTest(key: TestCSV) {
  switch (key) {
    case "insert":
      return _(key, function (item) {
        // const _parse = parse(item.string);
        // expect(_parse).to.eql(item.expected);
      });
    case "update":
      return _(key, function (item) {
        // const _parse = parse(item.string);
        // expect(_parse).to.eql(item.expected);
      });
    default:
      throw new Error(`Check if a csv '${key}' test is missing`);
  }
}
