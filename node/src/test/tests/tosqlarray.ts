// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

import { helpers } from "../../lib/index";

console.log("D: jejje", helpers.toSqlArray([ 1, 2, 3], "varchar"));
