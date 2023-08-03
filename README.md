# Staquia

This is a configurable **Spreadsheet** based algorithm, used to parse or create strings in CSV format. To have easy access to it.

You can install it like below.

```npm
  npm install spreadsheet-light --save-dev
```

Or use it from the `unpkg` cdn as a simple script tag via the browser.

```html
  <script src="https://unpkg.com/spreadsheet-light@'<version/>'/umd/index.js"><script/>
```

This exposes a global `xsv` object that works exactly the same way as the `ECMA` import version.

All of the examples in this document uses `ECMA` syntax to import or export code from the library, but this supports `CommonJS` syntax as well.

```js
// ECMA Syntax
import { xsv } from "spreadsheet-light";

// CommonJS Syntax
const { xsv } = require("spreadsheet-light");

// Some libraries will support conditional imports poorly
// or not even support it.
// For these cases you can force the imports like below.

// For ECMA Scripts
import { xsv } from "spreadsheet-light/esm";
// For CommonJS Scripts
const { xsv } = require("spreadsheet-light/cjs");
// For browser applications UMD
const { xsv } = require("spreadsheet-light/umd");
```

## Format

You can pass as to the text format the options to create the best spreadsheet that fits your needs.

```typescript
import { xsv } from "spreadsheet-light";

// This example has an 27th base number set [a - z]
xsv.format = {
  // The string to scape special values
  quote: '"',
  // The string to separate columns
  delimiter: ",",
  // The string to separate columns
  brk: "\r\n",
  // What to do when finding empty lines
  ignoreEmptyLines: true,
  // If the string comes from contains a not well formatted file,
  // here can be set to true if there is not ending character there
  hasEndCharacter: false,
  // This flag allows you find possible issues in your CSV content
  strictMode: true,
  // If your content contains headers set this to true
  hasHeaders: false,
  // Avoids repeating the algorithm when parsing the same string
  memoize: true,
  // Allow transformation from text to JSON or Arrays objects
  transform: true,
  // What to do write when finding no content in a CSV cell
  empty: "",
};
```

> **_Note:_** All of the following examples are shown using the above text format in the example.

## Value Object

A _Value Object_ is any valid javascript primitive that can be parsed without issues to some text, such as:

- Strings
- Numbers
- _null_
- JSON and Arrays containing the previous ones

Classes, functions, symbols or _undefined_ are not supported as this library tries to help you to keep your CSV content consistent.

### isValueObject

This function then is for validating that any passed value is valid to be serialized into CSV content.

## Spreadsheet Class

The **Spreadsheet** class is a representation of rows and columns. You can think this like a literal table or list, where you read, add, or modify the content within.

### Parsing

Parsing is a _serialization algorithm_ meant to have input information from one type then transforming this one to another type. For this case the input type is the **string** type that will be transformed to the **Spreadsheet** class to be handled as a small database chunk.

```js
import { xsv } from "spreadsheet-light";

// Imagine this how your CSV file would look like
const csv = `
"a","b"
"c","d"
`;

// This library allows you to create a Spreadsheet object
// so you can immediately start to work with your data!
const spreadsheet = xsv.parse(csv);

// The spreadsheet contains information about the parsing result, like:

// Checks if the parsed content is a table like object
spreadsheet.isTable;
// The string that represents the CSV, using the last
// text format when this element was created to create a clean
// representation that can be stored in a file to be used in programs like excel
spreadsheet.string;
// Wether the spreadsheet has headers
spreadsheet.hasHeaders;
// And what the headers are
spreadsheet.headers;
```

The parsing will check if the passed content can be considered as a **Table** like content. If so, you can use the methods below.

### Insert

You can insert new rows with the method _insert_.

```js
// Now the content will be:
// "a","b"
// "c","d"
// "e","f"
spreadsheet.insert([["e", "f"]]);
```

### Write and Bulk

You can modify the rows that already exists, either just a cell with the _write_ method or a whole mini table with the _bulk_ method

```js
// Here just a cell will be overriden:
// "a","b"
// "c","d"
// "e","X"
spreadsheet.write("X", 2, 3);

// But here a whole set is changed:
// 0,1
// 2,3
// "e","X"
spreadsheet.bulk(
  [
    [0, 1],
    [2, 3],
  ],
  // Here you can use the shorthands like "@left-top" if you don't want to hardcode the start
  {
    row: 1,
    column: 1,
  },
);
```

### Read and Range

The same way you can modify you can access the rows content, either just a cell with the _read_ method or a whole section with the _range_ method

```js
// From here just "d" will be returned:
// "a","b"
// "c","d"
spreadsheet.read("@right", 3);

// But here a whole set is being read:
// "a","b","c"
// "d","e","f"
// "g","h","i"
//
// The extracted content will look like this
// "e","f"
// "h","i"
spreadsheet.range(
  {
    row: 2,
    column: 2,
  },
  "@right-bottom",
);
```

### Shorthands

As mentioned before to access or modify the data there are two objects _CellSelector_ and _RangeSelector_. These can be numbers, objects or shorthands.

Each can be represented in the following way:

**Cell Selector**:

- Any `number` that is within the bounds of `x` or `y`
- The `@bottom` shorthand that is the maximum `y` value from the table
- The `@right` shorthand that is the maximum `x` value from the table

**Range Selector**:

This can be either shorthands or an `object` containing a `row` and a `column` property that are _CellSelector_ themselves.

```js
// This is how a selector may look as an object
const selector = {
  row: 1,
  column: "@bottom",
};
```

The shorhands are:

- The `@left-top` shorthand that is for `y = 0` and `x = 0`
- The `@left-bottom` shorthand that is for the maximum `y` value from the table and `x = 0`
- The `@right-top` shorthand that is for `y = 0` and the maximum `x` value from the table
- The `@right-bottom` shorthand that is for the maximum `y` and `x` value from the table

### Serialization

You can _serialize_ your content again if you want to use it for other purposes;

```js
// You can get back a cleaned version of the original string that
// you can use to create a save CSV file
spreadsheet.toString();

// Or you can get a plain matrix of columns (y), rows (x) to play with
// To access information you should place the y first like in matrix[y][x];
let matrix = spreadsheet.toArray();

// Or you can create a clone from the original object if you don't want to
// interfere with the data from the original one
spreadsheet.clone();
```

## Stringify

Stringify is a _serialization algorithm_ meant to have as input either a **matrix** or a **Spreadsheet** object then output a save CSV `string` representation. You can serialize your matrix to a simple `string` as long as it is a column-row matrix.

```js
// Like so
// This is the matrix
// "a","b"
// "c","d"
let string = xsv.stringify([
  ["a", "b"],
  ["c", "d"],
]);
```
