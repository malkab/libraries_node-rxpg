// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

import { RxPg } from "../src/index";

import * as rx from "rxjs";

import { OrmTestSingleKey } from "./ormtestsinglekey";

const pg: RxPg = new RxPg({
  host: "postgis"
})

const o0: OrmTestSingleKey = new OrmTestSingleKey({ a: 0, b: "A", c: 0, additional: 0 });
const o1: OrmTestSingleKey = new OrmTestSingleKey({ a: 1, b: "B", c: 1, additional: 1 });

rx.concat(
  o0.pgInsert$(pg),
  o1.pgInsert$(pg),
  o0.patch$({ b: "yu", c: 17 }),
  o0.pgUpdate$(pg),
  OrmTestSingleKey.get$(pg, 0, 48484848),
  OrmTestSingleKey.getList$(pg, 100, 33),
  o0.pgDelete$(pg),
  o1.pgDelete$(pg)
).subscribe(

  (n: any) => console.log("D: n", n),

  (error: any) => console.log("D: e", error),

  () => console.log("D: c")

);
