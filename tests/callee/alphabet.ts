import { expect } from "chai";
import _ from "../create-callee";
import type { TestAlphabet } from "../types";

import { alphabet } from "../../src/alphabet";
import { process } from "../../src/parser/process";
import { context, createContext } from "../../src/parser/context";
import { NotValidBase26String } from "../../src/errors";

export default function createAlphabetTest(key: TestAlphabet) {
  switch (key) {
    case "from-number":
      return _(key, function (item) {
        const _string = alphabet.fromNumber(item.number);
        expect(_string).to.eql(item.expected);
      });
    case "get-number":
      return _(key, function (item) {
        if (item.throws === "NotValidBase26String") {
          expect(function () {
            alphabet.getNumber(item.string);
          }).to.throw(NotValidBase26String);
        } else {
          const _number = alphabet.getNumber(item.string);
          expect(_number).to.eql(item.expected);
        }
      });
    default:
      throw new Error(`Check if a alphabet '${key}' test is missing`);
  }
}
