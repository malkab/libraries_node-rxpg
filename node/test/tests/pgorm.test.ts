import "mocha";

import { expect } from "chai";

import * as rx from "rxjs";

import { pg, clearDatabase$ } from "./common";

import { PgOrm } from "../../src/index";

import { rxMochaTests } from "@malkab/ts-utils";

import { OrmTestSingleKey } from "../ormtestsinglekey";

/**
 *
 * Check lists when they are empty.
 *
 */
describe("Check lists when they are empty", function() {

  rxMochaTests({

    testCaseName: "Check lists when they are empty",

    observable: rx.concat(

      clearDatabase$,

      PgOrm.selectMany$<OrmTestSingleKey>({

        sql: `select * from singlekeyobjects;`,
        params: () => [],
        pg: pg,
        type: OrmTestSingleKey

      })

    ),

    assertions: [

      (o: boolean) => expect(o).to.be.true,

      (o: OrmTestSingleKey[]) => expect(o).to.be.deep.equal([])

    ],

    verbose: false

  })

})

/**
 *
 * Check lists when they have elements.
 *
 */
describe("Check lists when they have elements", function() {

  const o0: OrmTestSingleKey = new OrmTestSingleKey(
    { a: 1, b: "A", c: 2, additional: 0 });

  const o1: OrmTestSingleKey = new OrmTestSingleKey(
    { a: 2, b: "B", c: 1, additional: 1 });

  rxMochaTests({

    testCaseName: "Check lists when they have elements",

    observable: rx.concat(

      clearDatabase$,

      o0.pgInsert$(pg),

      o1.pgInsert$(pg),

      PgOrm.selectMany$<OrmTestSingleKey>({

        sql: `select * from singlekeyobjects order by a;`,
        params: () => [],
        pg: pg,
        type: OrmTestSingleKey

      })

    ),

    assertions: [

      (o: boolean) => expect(o).to.be.true,

      (o: OrmTestSingleKey) => expect(o.b).to.be.deep.equal("A"),

      (o: OrmTestSingleKey) => expect(o.b).to.be.deep.equal("B"),

      (o: OrmTestSingleKey[]) => {

        expect(o.map((o: OrmTestSingleKey) => o.b))
          .to.be.deep.equal([ "A", "B" ]);

      }

    ],

    verbose: false

  })

})
