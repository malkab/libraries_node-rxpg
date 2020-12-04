import "mocha";

import { expect } from "chai";

import { pg, clearDatabase$, pgTooManyConnections } from "./common";

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
 * Check connection status, unstressed.
 *
 */
describe("Check connection status, unstressed", function() {

  rxMochaTests({

    testCaseName: "Check connection status, unstressed",

    observables: [
      pg.executeParamQuery$(`select 44 as x;`),
      pg.connectionReport$()
    ],

    assertions: [

      (o: QueryResult) => expect(o.rows[0].x).to.be.equal(44),
      (o: any) => {

        expect(o.totalConnections, "totalConnections").to.be.equal(5);
        expect(o.totalConnections, "idleConnections").to.be.equal(5);
        expect(o.totalConnections, "waitingConnections").to.be.equal(5);
        expect(o.totalConnections, "numberClients").to.be.equal(5);
        expect(o.totalConnections, "maxConnections").to.be.equal(5);
        expect(o.totalConnections, "connectionsToDb").to.be.equal(5);
        expect(o.totalConnections, "clientsByApps").to.be.equal(5);
        expect(o.totalConnections, "clients").to.be.equal(5);

      }

    ],

    verbose: false

  })

})

/**
 *
 * Test max connections.
 *
 */
describe("Test max connections", function() {

  rxMochaTests({

    testCaseName: "Test max connections",

    observables: [
      pg.testMaxConnections$(),
      pg.connectionReport$()
    ],

    assertions: [

      (o: boolean) => {
        expect(o).to.be.deep
          .equal({ attempted: 150, max: 150, withoutError: 150 })
      },
      (o: any) => {

        expect(o.totalConnections, "totalConnections").to.be.lessThan(155);
        expect(o.totalConnections, "idleConnections").to.be.lessThan(155);
        expect(o.totalConnections, "waitingConnections").to.be.lessThan(155);
        expect(o.totalConnections, "numberClients").to.be.lessThan(155);
        expect(o.totalConnections, "maxConnections").to.be.lessThan(155);
        expect(o.totalConnections, "connectionsToDb").to.be.lessThan(155);
        expect(o.totalConnections, "clientsByApps").to.be.lessThan(155);
        expect(o.totalConnections, "clients").to.be.lessThan(155);

      }

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

    observables: [
      pgTooManyConnections.testMaxConnections$()
    ],

    assertions: [

      (o: any) => {
        expect(o.code).to.be.equal(EPGERRORCODES.too_many_clients);
        expect(o.message).to.be.equal("sorry, too many clients already");
      }

    ],

    verbose: false

  })

})

/**
 *
 * Test undefined and null.
 *
 */
describe("Test undefined, true, false, 0, and null", function() {

  rxMochaTests({

    testCaseName: "Test undefined and null",

    observables: [

      pg.executeParamQuery$(`
        insert into test_null_undefined
        values ($1, $2, $3, $4, $5, $6, $7);
      `, {
        params: [ null, null, undefined, undefined, true, false, 0 ],
      }),

      pg.executeParamQuery$(`
        select * from test_null_undefined;`)

    ],

    assertions: [

      (o: QueryResult) =>
        expect(o.command, "insert of null and undefined")
          .to.be.equal("INSERT"),

      (o: QueryResult) =>
        expect(o.rows[0], "Check undefined").to.be.deep.equal({
          null_integer: undefined,
          null_varchar: undefined,
          undefined_integer: undefined,
          undefined_varchar: undefined,
          boolean_true: true,
          boolean_false: false,
          zero: 0
        })

    ],

    verbose: false

  })

})
