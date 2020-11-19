import { RxPg, QueryResult } from "../../src/index";

import * as rxo from "rxjs/operators";

import * as rx from "rxjs";

/**
 *
 * PG connection.
 *
 */
export const pg: RxPg = new RxPg({
  applicationName: "test-libsunnsaasbackend",
  db: "postgres",
  host: "postgis",
  pass: "postgres",
  maxPoolSize: 150,
  minPoolSize: 150,
  idleTimeoutMillis: 0,
  // onConnectEvent: (client: any) => console.log("D: CONNECT"),
  // onAcquireEvent: (client: any) => console.log("D: ACQUIRE"),
  // onRemoveEvent: (client: any) => console.log("D: REMOVE"),
  onErrorEvent: (err: Error) => console.log("D: ERROR", err)
});

export const pgTooManyConnections: RxPg = new RxPg({
  applicationName: "test-libsunnsaasbackend",
  db: "postgres",
  host: "postgis",
  pass: "postgres",
  maxPoolSize: 2000,
  minPoolSize: 2000,
  idleTimeoutMillis: 0
});

/**
 *
 * Clear the database. Define here service functions and Observables that are
 * going to be reused.
 *
 */
export const clearDatabase$: rx.Observable<boolean> =
  pg.executeScript$("./test/010-postgresql_test.sql")
  .pipe(

    rxo.map((o: QueryResult) => true)

  );
