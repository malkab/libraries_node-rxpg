// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

import { RxPg } from "../src/index";

import * as rx from "rxjs";

import { OrmTestSingleKey } from "./ormtestsinglekey";

import { OrmError } from "@malkab/ts-utils";

const pg: RxPg = new RxPg({
  host: "postgis"
})

const o0: OrmTestSingleKey = new OrmTestSingleKey({ a: 1, b: "A", c: 23, additional: 0 });
// const o1: OrmTestSingleKey = new OrmTestSingleKey({ a: 1, b: "B", c: 1, additional: 1 });

rx.concat(
  o0.pgInsert$(pg),
  // o1.pgInsert$(pg),
  o0.pgUpdate$(pg),
  // OrmTestSingleKey.get$(pg, "103a", 48484848),
  // OrmTestSingleKey.getList$(pg, 900, 33),
  // o0.pgDelete$(pg),
  // o1.pgDelete$(pg)
).subscribe(

  (n: any) => console.log("next", n),

  (error: OrmError.OrmError) => console.log("error", error),

  () => console.log("completed")

);
