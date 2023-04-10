import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser, TestName } from "../types";

import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "transforms":
      return _(key, function (item) {
        const _transforms = transforms(item.string);
        if (item.expected === "undefined" || item.expected === "UNDEFINED")
          item.expected = undefined;
        expect(_transforms).to.eql(item.expected);
      });
    case "parse":
      return _(key, function (item) {
        // const _parse = parse(item.string);
        // expect(_parse).to.eql(item.expected);
      });
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
