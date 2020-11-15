import "mocha";

import { expect } from "chai";

import * as rx from "rxjs";

import { pg, clearDatabase$ } from "./common";

import { QueryResult, EPGERRORCODES } from "../../src/index";

import { rxMochaTests } from "@malkab/ts-utils";

/**
 *
 * Clear database.
 *
 */
describe("Clear database", function() {

  rxMochaTests({

    testCaseName: "Clear database",

    observables: [ clearDatabase$ ],

    assertions: [

      (o: boolean) => expect(o).to.be.true

    ],

    verbose: false

  })

})

/**
 *
 * Open and close the connection.
 *
 */
describe("Open and close the connection", function() {

  rxMochaTests({

    testCaseName: "Open and close the connection",

    observables: [
      pg.executeQuery$(`select 44 as x;`),
      // rx.of(pg.totalConnections),
      // rx.of(pg.waitingConnections),
      pg.connectionReport()
    ],

    assertions: [

      (o: QueryResult) => expect(o.rows[0].x).to.be.equal(44),
      (o: any) => console.log("D: kkke", o)

    ],

    verbose: false

  })

})

/**
 *
 * Stress the connection.
 *
 */
describe("Stress the connection", function() {

  rxMochaTests({

    testCaseName: "Stress the connection",

    observables: [ rx.zip(
      ...Array.from(Array(10).keys()).map(o =>
        pg.executeQuery$(`select 44 as x;`)
      )
    ) ],

    assertions: [

      (o: any) => {
        expect(o.code).to.be.equal(EPGERRORCODES.too_many_clients);
        expect(o.message).to.be.equal("sorry, too many clients already");
      }

    ],

    verbose: false

  })

})
