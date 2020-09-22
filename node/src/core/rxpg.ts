import * as rx from "rxjs";

import { PoolConfig, Pool, QueryResult } from "pg";

import * as fs from "fs";

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
    idleTimeoutMillis=10000
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
  }) {

    this._host = host;
    this._port = port;
    this._user = user;
    this._password = pass;
    this._database = db;
    this._maxPoolSize = maxPoolSize;
    this._minPoolSize = minPoolSize;

    if (applicationName) {

      this._applicationName = applicationName;

    } else {

      this._applicationName = undefined;

    }

    this._idleTimeoutMillis = idleTimeoutMillis;

    this._pool = new Pool(this.poolConfig);

    this._pool.on("error", (error: any) => {

      throw error;

    });

  }

  /**
   *
   * Executes a script file.
   *
   */
  public executeScript$(file: string): rx.Observable<QueryResult> {

    const script = fs.readFileSync(file).toString();
    return this.executeQuery$(script);

  }

  /**
   *
   * Closes the pool
   *
   */
  public close(): void {

    this._pool.end();

  }

  /**
   *
   * Executes an arbitrary query
   *
   */
  public executeQuery$(query: string): rx.Observable<QueryResult> {

    let _client: any = null;

    return new rx.Observable<QueryResult>((o: any) => {
      this._pool.connect()
      .then((client: any) => {

        _client = client;
        return _client.query(query);

      })
      .then((res: any) => {

        _client.release();
        o.next(res);
        o.complete();

      })
      .catch((error: any) => {

        if (_client) {

          _client.release();

        }

        o.error(error);

      });

    });

  }

  /**
   *
   * Executes an arbitrary parametrized query
   *
   * query: tag parameters with $X, where X is a correlative number
   * values: a list
   *
   */
  public executeParamQuery$(query: string, values: any):
  rx.Observable<QueryResult> {

    let _client: any = null;

    return new rx.Observable<QueryResult>((o: any) => {

      this._pool.connect()
      .then((client: any) => {

        _client = client;
        return _client.query(query, values);

      })
      .then((res: any) => {

        _client.release();
        o.next(res);
        o.complete();

      })
      .catch((error: any) => {

        if (_client) {

          _client.release();

        }

        o.error(error);

      });

    });

  }

  /**
   *
   * Return number of connections at the pool.
   *
   */
  get totalConnections(): number {

    return this._pool.totalCount;

  }

  /**
   *
   * Return number of idle connections at the pool.
   *
   */
  get idleConnections(): number {

    return this._pool.idleCount;

  }

  /**
   *
   * Return number of idle connections at the pool.
   *
   */
  get waitingConnections(): number {

    return this._pool.waitingCount;

  }

  /**
   *
   * Return the list of clients connected to the database.
   *
   */
  public getClients(): rx.Observable<any[]> {

    return this.executeQuery$(`
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

      rxo.map((x: QueryResult) => {

        return x.rows;

      })

    )

  }

  /**
   *
   * Return the number of clients connected to the database.
   *
   */
  public getNumberClients(): rx.Observable<number> {

    return this.executeQuery$(`
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

      rxo.map((x: QueryResult) => {

        return x.rowCount;

      })

    );

  }

  /**
   *
   * Return the number of clients for each app.
   *
   */
  public getAppClients(): rx.Observable<any[]> {

    return this.executeQuery$(`
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
  public getMaxConnections(): rx.Observable<number> {

    return this.executeQuery$(`
      show max_connections;
    `)
    .pipe(

      rxo.map((x: QueryResult) => {

        return +x.rows[0]["max_connections"];

      })

    );

  }

  /**
   *
   * Return connections to each database.
   *
   */
  public getConnectionsToDb(): rx.Observable<any[]> {

    return this.executeQuery$(`
      select
        datname as "databaseName",
        numbackends as "numBackends"
      from pg_stat_database
      where datname is not null;
    `)
    .pipe(

      rxo.map((x: QueryResult) => {

        return x.rows;

      })

    );

  }

  /**
   *
   * Returns a report of connection status to the server.
   *
   */
  public connectionReport(): rx.Observable<any> {

    return rx.zip(
      this.getNumberClients(),
      this.getMaxConnections(),
      this.getConnectionsToDb(),
      this.getAppClients(),
      this.getClients()
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
  public getDatabaseSizes(): rx.Observable<any> {

    return this.executeQuery$(`
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

}
