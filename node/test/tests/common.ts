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
  pass: "postgres"
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
