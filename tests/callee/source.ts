import { expect } from "chai";
import { TestSource } from "../types";
import { isValueObject } from "../../src/is-value-object";
import _ from "../create-callee";
import { stringify } from "../../src/stringify";
import { ValueData } from "../../src/types";

export default function createSourceTest(key: TestSource) {
  switch (key) {
    case "is-value-object":
      return _(key, function (item) {
        expect(isValueObject(item.value)).to.equals(true);
      });
    case "stringify":
      return _(
        key,
        function (item) {
          expect(stringify(item.object)).to.equals(item.expected);
        },
        function (is: string) {
          let _values: ValueData<any> = [[]];

          switch (is) {
            case "undefined":
              _values[0].push(undefined);
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              _values[0].push(symbol);
              break;
            case "class":
              class SpreadhseetFake {}
              const _class = new SpreadhseetFake();
              _values[0].push(_class);
              break;
            case "function":
              const _function = () => {};
              _values[0].push(_function);
              break;
          }

          stringify(_values);
        },
      );
  }
}
