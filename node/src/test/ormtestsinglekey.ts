import { IPgOrm, generateDefaultPgOrmMethods, select$, selectMany$, executeParamQuery$ } from "../pgorm/index";

import { RxPg, QueryResult } from "../core/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import lodash from "lodash";

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
export class OrmTestSingleKey implements IPgOrm<OrmTestSingleKey> {

  // Placeholder for the required functions at the IPgPersistence interface
  // These will be created automatically by a helper at construction time
  public pgInsert$: ({ pg }: { pg: RxPg }) => rx.Observable<OrmTestSingleKey>;
  public pgUpdate$: ({ pg }: { pg: RxPg }) => rx.Observable<OrmTestSingleKey>;

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
      c
    }: {
      a: number;
      b: string;
      c: number;
  }) {

    if (!lodash.isNumber(+a)) {

      throw new Error("a must be a number");

    }

    this._a = +a;

    // Using the patch$ function here to set the rest of the object at
    // construction level
    this.patch$({ b: b, c: c });

    // This helper generates the pgInsert$, pgUpdate$, and pgDelete$ ORM methods
    // from parametrized SQL and functions that returns the correct paramters
    // sequence in this object context
    generateDefaultPgOrmMethods(this, {
      restApiErrorMapping: true,
      methods: {
        pgInsert$: {
          sql: 'insert into singlekeyobjects values ($1, $2, $3);',
          params: () => [ this.a, this.b, this.c ],
          // returns: (o: QueryResult) => o
        },
        pgUpdate$: {
          sql: 'update singlekeyobjects set b=$1, c=$3 where a=$2;',
          params: () => [ this.b, this.a, this.c ],
          returns: (o: QueryResult) => "OK"
        }
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
  public pgDelete$({ pg }: { pg: RxPg }): rx.Observable<OrmTestSingleKey> {

    // Here goes a super complex deletion logic
    return executeParamQuery$({
      pg: pg,
      sql: 'delete from singlekeyobjects where a=$1',
      params: () => [ this.a ],
      returns: (o: QueryResult) => o.rowCount
    })
    .pipe(

      rxo.map((o: any) => {

        console.log("D: this comes from the custom delete$ method");
        console.log("D: ", o);

        return this;

      })

    )

  }

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
   */
  public static get$(
    { pg, id }:
    { pg: RxPg, id: number }
  ): rx.Observable<OrmTestSingleKey> {

    return select$<OrmTestSingleKey>({
      pg: pg,
      sql: 'select a as a, b as b from singlekeyobjects where a=$1;',
      params: () => [ id ],
      type: OrmTestSingleKey
    })

  }

  /**
   *
   * This is an example of a list retrieving static method.
   *
   */
  public static getList$(pg: RxPg): rx.Observable<OrmTestSingleKey[]> {

    return selectMany$({
      pg: pg,
      params: () => null,
      sql: "select * from singlekeyobjects",
      type: OrmTestSingleKey
    })

  }

  /**
   *
   * This is the mandatory **patch$** method used to get an structure of params
   * that is a subset of that of the constructor and modify the status of the
   * object accordingly.
   *
   */
  public patch$({
      b,
      c
    }: {
      b: string;
      c: number;
  }): rx.Observable<OrmTestSingleKey> {

    this._b = b;
    this._c = c;
    return rx.of(this);

  }

}
