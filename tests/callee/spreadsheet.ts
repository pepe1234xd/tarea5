import { expect } from "chai";
import _ from "../create-callee";
import { TestSpreadsheet } from "../types";
import { Spreadsheet } from "../../src/spreadsheet/spreadsheet";
import { format } from "../../src/text-format";
import {
  CellSelector,
  RangeSelector,
  SpreadsheetContent,
  ValueData,
} from "../../src/types";

const buildCSV = function (item: any) {
  const {
    content,
    data,
  }: {
    content: SpreadsheetContent;
    data: ValueData<any>;
  } = item;
  return new Spreadsheet(
    data,
    content.isTable,
    content.headers,
    content.hasHeaders,
    {
      quote: format.quote,
      delimiter: format.delimiter,
      brk: format.brk,
    },
  );
};

type InvalidCase = "undefined" | "symbol" | "function" | "class";

export default function createSpreadsheetTest(key: TestSpreadsheet) {
  switch (key) {
    case "is-value-object":
      return _(key, function (item) {
        const csv = buildCSV({
          data: [[]],
          content: { isTable: false, headers: [], hasHeaders: false },
        });
        expect(csv.isValueObject(item.value)).to.equals(true);
      });
    case "bulk":
      return _(
        key,
        function (item) {
          const csv = buildCSV(item);
          const { expected, selector, writtable } = item;
          csv.bulk(writtable, selector);
          expect(csv.string).to.eql(expected);
        },
        function (is: InvalidCase | ValueData<any>, start: RangeSelector) {
          const csv = buildCSV({
            data: [["a"]],
            content: {
              isTable: true,
              headers: [],
              hasHeaders: false,
            },
          });

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
            default:
              _values = is;
              break;
          }

          csv.bulk(_values, start);
        },
      );
    case "read":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected, selector } = item;
        const v = csv.read(selector.row, selector.column);
        expect(v).to.eql(expected);
      });
    case "write":
      return _(
        key,
        function (item) {
          const csv = buildCSV(item);
          const { expected, selector, writtable } = item;
          csv.write(writtable, selector.row, selector.column);
          expect(csv.string).to.eql(expected);
        },
        function (is: InvalidCase, row: CellSelector, column: CellSelector) {
          const csv = buildCSV({
            data: [["a"]],
            content: {
              isTable: true,
              headers: [],
              hasHeaders: false,
            },
          });
          let value: any = null;
          switch (is) {
            case "undefined":
              value = undefined;
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              value = symbol;
              break;
            case "class":
              class SpreadhseetFake {}
              const _class = new SpreadhseetFake();
              value = _class;
              break;
            case "function":
              const _function = () => {};
              value = _function;
              break;
            default:
              value = is;
              break;
          }
          csv.write(value, row, column);
        },
      );
    default:
      throw new Error(`Check if a spreadsheet '${key}' test is missing`);
  }
}
