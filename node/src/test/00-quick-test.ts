// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

import { RxPg } from "../core/index";

import * as rx from "rxjs";

import { OrmTestSingleKey } from "./ormtestsinglekey";

const pg: RxPg = new RxPg({
  host: "postgis"
})

const o: OrmTestSingleKey = new OrmTestSingleKey({ a: 724374, b: "t", c: 78 });

rx.concat(
  o.pgInsert$(pg),
  o.patch$({ b: "yu", c: 17 }),
  o.pgUpdate$(pg),
  // o.pgDelete$(pg),
  // OrmTestSingleKey.get$(pg, 1),
  OrmTestSingleKey.getList$(pg)
).subscribe(

  (n: any) => console.log("D: n", n),

  (error: any) => console.log("D: e", error),

  () => console.log("D: c")

);
