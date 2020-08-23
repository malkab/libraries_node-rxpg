import * as rx from "rxjs";

import { RxPg } from "../../lib/index";

/**
 *
 * This code displays the consequences of playing with the max_connections
 * parameter at postgresql.conf and maxPoolSize at pool initialization. To
 * experiment, tune the parameter at the postgresql.conf and at the
 * initializator below. A stress test launching a lot of queries to the database
 * is shown below. Defining a maxPoolSize bigger than what the DB can handle
 * result in a "too many clients" error, while keeping below the limit, while
 * allowing for bigger maxPoolSize, makes the stress test faster.
 *
 */

// Timer
const startTime = Date.now();

/**
 *
 * Initialization and report.
 *
 */
const rxPg: RxPg = new RxPg({
  maxPoolSize: 3,
  minPoolSize: 1,
  host: "rxpg_postgis_dev",
  applicationName: "quick-test",
  idleTimeoutMillis: 0
});

const queries: any = [];

rxPg.connectionReport()
.subscribe(

  (x: any) => {

    console.log("Connection report:\n\n", x);

  },

  (error: any) => {

    console.log("Error at reporting:\n\n", error);

  },

  () => {

    console.log("Completed reporting observable")

  }

)

/**
 *
 * Stress test.
 *
 */
for(let i=0; i<20000; i++) {

  queries.push(rxPg.executeQuery$(`insert into test values (${i});`));

}

rx.zip(...queries)
.subscribe(

  (o: any) => {

    console.log("Final execution of zipped queries, results: ", o.length);
    console.log(`Finish time: ${(Date.now() - startTime) / 1000}s`);

  },

  (error: any) => {

    console.log("Error at execution of zipped queries", error);

  },

  () => {

    console.log("Completed zipped queries observable");

  }

)
