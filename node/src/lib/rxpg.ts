import * as rx from "rxjs";

import { PoolConfig, Pool, QueryResult } from "pg";



/**
 * 
 * Class for interfacing to PG with Rx
 * 
 */

export class RxPg {

    /**
     * 
     * Error subject.
     * 
     */

    public redisError$: rx.Subject<Error> = new rx.Subject<Error>();



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

    get poolConfig(): PoolConfig {
        return {
            host: this._host,
            port: this._port,
            user: this._user,
            password: this._password,
            database: this._database,
            max: this._maxPoolSize
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
     * 
     */

    constructor({
      host = "postgis",
      port = 5432,
      user = "postgres",
      pass = "postgres",
      db = "postgres",
      maxPoolSize = 10
    }: {
      host?: string;
      port?: number;
      user?: string;
      pass?: string;
      db?: string;
      maxPoolSize: number;
    }) {

        this._host = host;
        this._port = port;
        this._user = user;
        this._password = pass;
        this._database = db;

        this._maxPoolSize = maxPoolSize;

        this._pool = new Pool(this.poolConfig);

        this._pool.on("error", (error) => {

            this.redisError$.error(error);

        });

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

}
