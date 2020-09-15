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

const o: OrmTestSingleKey = new OrmTestSingleKey({ a: 535, b: "t", c: 78 });

rx.concat(
  o.pgInsert$(pg),
  o.patch$({ b: "yu", c: 17 }),
  o.pgUpdate$(pg),
  OrmTestSingleKey.get$(pg, 55),
  OrmTestSingleKey.getList$(pg),
  o.pgDelete$(pg)
).subscribe(

  (n: any) => console.log("D: n", n),

  (error: any) => console.log("D: e", error),

  () => console.log("D: c")

);
