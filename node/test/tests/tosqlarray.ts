// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

import { Helpers } from "../../src/index";

console.log("toSqlArray", Helpers.toSqlArray([ 1, 2, 3], "varchar"));
