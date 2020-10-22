import { PgOrm } from "../src/index";

import { RxPg, QueryResult } from "../src/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

/**
 *
 * This is an example of a class that implements IPgOrm using all the helpers.
 * Some ORM methods are created by default, others are custom implemented:
 *
 * - pgInsert$ and pgUpdate$ are defaults;
 * - pgDelete$ is custom;
 * - get$ is an static custom, get$ cannot be created by default.
 *
 * The above methods are mandatory, although the IPgOrm interface cannot force
 * the object to define an static get$ method.
 *
 * getList$ is a custom retrieving method that get the full list of objects,
 * also using a helper.
 *
 */
export class OrmTestSingleKey implements PgOrm.IPgOrm<OrmTestSingleKey> {

  // Placeholder for the required functions at the IPgPersistence interface
  // These will be created automatically by a helper at construction time
  public pgInsert$: (pg: RxPg) => rx.Observable<OrmTestSingleKey>;
  public pgUpdate$: (pg: RxPg) => rx.Observable<OrmTestSingleKey>;
  public pgDelete$: (pg: RxPg) => rx.Observable<OrmTestSingleKey>;

  /**
   *
   * The A member, acting as key.
   *
   */
  private _a: number;

  get a(): number { return this._a }

  /**
   *
   * The B member.
   *
   */
  private _b: string;

  get b(): string { return this._b }
  set b(b: string) { this._b = b }

  /**
   *
   * The C member.
   *
   */
  private _c: number;

  get c(): number { return this._c }
  set c(c: number) { this._c = c }

  /**
   *
   * Constructor. It is most important that there is a correlation between:
   *
   * - the deconstructed parameter structure in this constructor;
   * - the SQL result column names (use AS for modifying column names to match
   *   this prototype) of any SELECT SQL;
   * - the deconstructed input of the patch$ function, used to modify the state
   *   of the object.
   *
   */
  constructor({
      a,
      b,
      c,
      additional
    }: {
      a: number;
      b: string;
      c: number;
      additional?: number;
  }) {

    if (a > 10) {

      throw new Error("a > 10");

    }

    // console.log("COMPLEX INITIALIZATION LOGIC HERE", additional);

    this._a = +a;
    this._b = b;
    this._c = +c;

    // This helper generates the pgInsert$, pgUpdate$, and pgDelete$ ORM methods
    // from parametrized SQL and functions that returns the correct paramters
    // sequence in this object context
    PgOrm.generateDefaultPgOrmMethods(this, {
      pgInsert$: {
        sql: 'insert into singlekeyobjects values ($1, $2, $3) returning *;',
        params: () => [ this.a, this.b, this.c ],
        // returns: (o: QueryResult, object: OrmTestSingleKey) => "OK"
      },
      pgUpdate$: {
        sql: 'update singlekeyobjects set b=$1, c=$3 where a=$2 returning *;',
        params: () => [ this.b, this.a, this.c ],
        // returns: (o: QueryResult) => "OK"
      },
      pgDelete$: {
        sql: 'delete from singlekeyobjects where a=$1 returning *;',
        params: () => [ this.a ]
        // returns: (o: QueryResult) => o.rowCount
      }
    })

  }

  /**
   *
   * This is a custom implementation of the pgDelete$ method. This option is
   * always available if there is a complex logic involved. Use the helpers at
   * PgOrm to make implement standard errors handling and such.
   *
   */
  // public pgDelete$(pg: RxPg): rx.Observable<OrmTestSingleKey> {

  //   // Here goes a super complex deletion logic
  //   return PgOrm.executeParamQuery$({
  //     pg: pg,
  //     sql: 'delete from singlekeyobjects where a=$1',
  //     params: () => [ this.a ],
  //     returns: (o: QueryResult) => o.rowCount
  //   })
  //   .pipe(

  //     rxo.map((o: any) => {

  //       console.log("this comes from the custom delete$ method");
  //       return this;

  //     })

  //   )

  // }

  /**
   *
   * This is the implementation of the mandatory get$ method that will be used
   * in it's simplest form as an object constructor. This method is used to get
   * a single instance of the object, NEVER many of them. Implement as many
   * other methods as necessary to retrieve lists of objects with any logic.
   * Keep in mind that the names of columns must match the constructor of the
   * object, use AS for mapping.
   *
   * The parameters for this method must be deconstructed so it allows for
   * anonymous usage by the ORM router of Appian, for example.
   *
   * This function uses an custom initializator function that injects additional
   * params into the contructor.
   *
   */
  public static get$(pg: RxPg, id: number, additional: number): rx.Observable<OrmTestSingleKey> {

    return PgOrm.select$<OrmTestSingleKey>({
      pg: pg,
      sql: 'select a as a, b as b, c as c from singlekeyobjects where a=$1;',
      params: () => [ id ],
      type: OrmTestSingleKey,
      /**
       *
       * This is an example of complex init function.
       *
       */
      newFunction: (params: any) => {
        // Errors can be launched here safely
        // throw new Error("ERROR HERE");
        console.log("params at newFunction", params);
        console.log("PERFORMING COMPLEX ASYNCH INIT LOGIC HERE");
        return rx.of(new OrmTestSingleKey({ ...params, additional: additional }));
      }
    })

  }

  /**
   *
   * This is an example of a list retrieving static method.
   *
   */
  public static getList$(pg: RxPg, id: number, additional: number): rx.Observable<OrmTestSingleKey[]> {

    return PgOrm.selectMany$({
      pg: pg,
      params: () => [ id ],
      // params: () => [],
      sql: "select * from singlekeyobjects where a<$1;",
      type: OrmTestSingleKey,
      /**
       *
       * This is an example of complex init function.
       *
       */
      newFunction: (params: any) => {
        console.log("PERFORMING COMPLEX ASYNCH INIT LOGIC HERE FOR MULTI");
        return rx.of(new OrmTestSingleKey({ ...params, additional: params.a + params.b + additional }));
      }
    })

  }

}
