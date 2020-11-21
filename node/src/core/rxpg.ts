import * as fs from "fs";

import { Pool, PoolConfig, QueryResult } from "pg";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

/**
 *
 * Class for interfacing to PG with Rx
 *
 */
export class RxPg {

  /**
   *
   * Connection properties
   *
   */
  private _host: string;
  private _port: number;
  private _user: string;
  private _password: string;
  private _database: string;
  private _pool: Pool;
  private _maxPoolSize: number;
  private _minPoolSize: number;
  private _applicationName: string | undefined;
  // number of milliseconds a client must sit idle in the pool and not be
  // checked out before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of
  // idle clients
  private _idleTimeoutMillis: number;

  /**
   *
   * Returns the pool configuration.
   *
   */
  get poolConfig(): PoolConfig {

    return {
      host: this._host,
      port: this._port,
      user: this._user,
      password: this._password,
      database: this._database,
      max: this._maxPoolSize,
      min: this._minPoolSize,
      idleTimeoutMillis: this._idleTimeoutMillis,
      application_name: this._applicationName
    };

  }

  /**
   *
   * Constructor, initializes the connections
   *
   * @param host
   * @param port
   * @param user
   * @param pass
   * @param db
   * @param maxPoolSize
   * @param idleTimeoutMillis
   *
   */
  constructor({
    host="localhost",
    port=5432,
    user="postgres",
    pass="postgres",
    db="postgres",
    maxPoolSize=10,
    minPoolSize=3,
    applicationName,
    idleTimeoutMillis=10000,
    onConnectEvent = undefined,
    onAcquireEvent = undefined,
    onErrorEvent = undefined,
    onRemoveEvent = undefined
  }: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    db?: string;
    maxPoolSize?: number;
    minPoolSize?: number;
    applicationName?: string;
    idleTimeoutMillis?: number;
    onConnectEvent?: (client: any) => void;
    onAcquireEvent?: (client: any) => void;
    onErrorEvent?: (err: Error, client: any) => void;
    onRemoveEvent?: (client: any) => void
  }) {

    this._host = host;
    this._port = +port;
    this._user = user;
    this._password = pass;
    this._database = db;
    this._maxPoolSize = +maxPoolSize;
    this._minPoolSize = +minPoolSize;

    if (applicationName) {

      this._applicationName = applicationName;

    } else {

      this._applicationName = undefined;

    }

    this._idleTimeoutMillis = +idleTimeoutMillis;
    this._pool = new Pool(this.poolConfig);

    if (onConnectEvent) this._pool.on("connect", onConnectEvent);
    if (onAcquireEvent) this._pool.on("acquire", onAcquireEvent);
    if (onRemoveEvent) this._pool.on("remove", onRemoveEvent);
    if (onErrorEvent) {

      this._pool.on("error", onErrorEvent);

    } else {

      this._pool.on("error", (error: any) => {

        throw error;

      });

    }

  }

  /**
   *
   * Executes a script file.
   *
   */
  public executeScript$(file: string): rx.Observable<QueryResult> {

    const script = fs.readFileSync(file).toString();
    return this.executeParamQuery$(script);

  }

  /**
   *
   * Closes the pool
   *
   */
  public close$(): rx.Observable<boolean> {

    return rx.from(this._pool.end())
    .pipe(

      rxo.map((o: any) => true)

    )

  }

  /**
   *
   * Executes an arbitrary parametrized query. By default, null database values
   * are returned as **null**, but this is sometimes very inconvenient, for
   * example, for ORM operations with deconstructed parameters. The option
   * nullAsUndefined transforms nulls coming from the DB into undefined.
   *
   * @param query
   * The query to be executed.
   *
   * @param __namedParameters
   * Two options are available:
   * - **params:** parameters for the query
   * - **nullAsUndefined:** transforms nulls coming from the DB into undefined
   *
   */
  public executeParamQuery$(
    query: string,
    {
      params,
      nullAsUndefined = false
    }: {
      params?: any[],
      nullAsUndefined?: boolean
    } = {}
  ): rx.Observable<QueryResult> {

    return new rx.Observable<QueryResult>((o: any) => {

      this._pool.query(query, params)
      .then((queryResult: QueryResult) => {

        if (nullAsUndefined) {

          queryResult.rows.map((o: any) => {

            Object.keys(o).map((k: string) => o[k] = o[k] ? o[k] : undefined)

          })

        }

        o.next(queryResult);
        o.complete();

      })
      .catch((error: any) => {

        o.error(error);
        o.complete();

      })

    })

  }

  /**
   *
   * Return number of connections at the pool.
   *
   */
  get totalConnections(): number { return this._pool.totalCount; }

  /**
   *
   * Return number of idle connections at the pool.
   *
   */
  get idleConnections(): number { return this._pool.idleCount; }

  /**
   *
   * Return number of waiting connections at the pool.
   *
   */
  get waitingConnections(): number { return this._pool.waitingCount; }

  /**
   *
   * Return the list of clients connected to the database.
   *
   */
  public getClients$(): rx.Observable<any[]> {

    return this.executeParamQuery$(`
      select
        pid as "processId",
        usename as "userName",
        datname as "databaseName",
        client_addr as "clientAddress",
        client_hostname as "clientHostname",
        application_name as "applicationName",
        backend_start as "backendStart",
        state,
        state_change as "stateChange"
      from pg_stat_activity
      where datname is not null;
    `)
    .pipe(

      rxo.map((x: QueryResult) => x.rows)

    )

  }

  /**
   *
   * Return the number of clients connected to the database.
   *
   */
  public getNumberClients$(): rx.Observable<number> {

    return this.executeParamQuery$(`
      select
        pid as process_id,
        usename as username,
        datname as database_name,
        client_addr as client_address,
        application_name,
        backend_start,
        state,
        state_change
      from pg_stat_activity
      where datname is not null;
    `)
    .pipe(

      rxo.map((x: QueryResult) => x.rowCount)

    );

  }

  /**
   *
   * Return the number of clients for each app.
   *
   */
  public getAppClients$(): rx.Observable<{
    appName: string;
    clients: number;
  }[]> {

    return this.executeParamQuery$(`
      select
        application_name as "appName",
        count(*) as "clients"
      from pg_stat_activity
      where datname is not null
      group by application_name;
    `)
    .pipe(

      rxo.map((x: QueryResult) => {

        return x.rows.map((y: any) => {

          return {
            appName: y.appName,
            clients: +y.clients
          }

        })

      })

    );

  }

  /**
   *
   * Return max connections to the database.
   *
   */
  public getMaxConnections$(): rx.Observable<number> {

    return this.executeParamQuery$(`
      show max_connections;
    `)
    .pipe(

      rxo.map((x: QueryResult) => +x.rows[0]["max_connections"])

    );

  }

  /**
   *
   * Return connections to each database.
   *
   */
  public getConnectionsToDb$(): rx.Observable<any[]> {

    return this.executeParamQuery$(`
      select
        datname as "databaseName",
        numbackends as "numBackends"
      from pg_stat_database
      where datname is not null;
    `)
    .pipe(

      rxo.map((x: QueryResult) => x.rows)

    );

  }

  /**
   *
   * Returns a report of connection status to the server.
   *
   * @returns
   * A data structure with the following items:
   * - totalConnections: total connections in the pool (a number)
   * - idleConnections: total idle connections in the pool (a number)
   * - waitingConnections: total waiting connections in the pool (a number)
   * - numberClients: total number of clients connected to the DB (a number)
   * - maxConnections: total connections supported by the DB (a number)
   * - connectionsToDb: number of connections to each DB (a list of databases, small)
   * - clientsByApps: list of number of connections by application name (a small list)
   * - clients: list of clients connected to the DB (can be really large)
   *
   */
  public connectionReport$(): rx.Observable<{
    totalConnections: number;
    idleConnections: number;
    waitingConnections: number;
    numberClients: number;
    maxConnections: number;
    connectionsToDb: any[];
    clientsByApps: any[];
    clients: any[];
  }> {

    return rx.zip(
      this.getNumberClients$(),
      this.getMaxConnections$(),
      this.getConnectionsToDb$(),
      this.getAppClients$(),
      this.getClients$()
    )
    .pipe(

      rxo.map((x: any) => {

        return {

          totalConnections: this.totalConnections,
          idleConnections: this.idleConnections,
          waitingConnections: this.waitingConnections,
          numberClients: x[0],
          maxConnections: x[1],
          connectionsToDb: x[2],
          clientsByApps: x[3],
          clients: x[4]

        };

      })

    )

  }

  /**
   *
   * Returns the size of all databases.
   *
   */
  public getDatabaseSizes$(): rx.Observable<any> {

    return this.executeParamQuery$(`
      select
        a as "databaseName",
        pg_size_pretty(pg_database_size(a)) as "prettySize",
        pg_database_size(a) as size
      from (
        select datname as a
        from pg_stat_database
        where datname is not null
      ) as a;
    `)
    .pipe(

      rxo.map((x: any) => {

        return x.rows.map((y: any) => {

          return {
            databaseName: y.databaseName,
            prettySize: y.prettySize,
            size: +y.size
          }

        })

      })

    )

  }

  /**
   *
   * Test connections. Tries to open the maximum allowed connections for this
   * pool to check if the database allows or reject them.
   *
   * @returns
   * An object with the following members:
   * - max: this pool max size
   * - attempted: the number of simultaneous connections attempted
   * - withoutError: the number of those connections returning without an error
   *
   * They should be the same.
   *
   */
  public testMaxConnections$(): rx.Observable<{
    attempted: number, max: number, withoutError: number }> {

    return rx.zip(
      ...Array.from(Array(this._maxPoolSize).keys()).map(o =>
        this.executeParamQuery$(`select 'RxPg testMaxConnections' as x;`)
      ))
    .pipe(

      rxo.map((o: any) => {

        return { max: this._maxPoolSize, attempted: o.length,
          withoutError: o.filter((o: any) => o.command === "SELECT").length }

      })

    )

  }

}
