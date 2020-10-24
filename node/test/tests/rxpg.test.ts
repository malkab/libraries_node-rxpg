import "mocha";

import { expect } from "chai";

import * as rx from "rxjs";

import { pg, clearDatabase$ } from "./common";

import { QueryResult } from "../../src/index";

import { rxMochaTests } from "@malkab/ts-utils";

/**
 *
 * Open and close the connection.
 *
 */
describe("Open and close the connection", function() {

  rxMochaTests({

    testCaseName: "Open and close the connection",

    observable: rx.concat(

      clearDatabase$,

      pg.executeQuery$(`select 44 as x;`)

    ),

    assertions: [

      (o: boolean) => expect(o).to.be.true,

      (o: QueryResult) => expect(o.rows[0].x).to.be.equal(44)

    ],

    verbose: false

  })

})
