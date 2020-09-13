import { IPgOrm } from "../pgorm/index";

import { RxPg } from "../core/index";

import * as rx from "rxjs";

import * as lodash from "lodash";

/**
 *
 * This is an example of a class that implements IPgOrm using all the helpers
 * for an standard workflow.
 *
 */
export class OrmTestA implements IPgOrm<OrmTestA> {

  // Placeholder for the required functions at the IPgPersistence interface
  // These will be created automatically by a helper at construction time
  public pgInsert$: ({ pg }: { pg: RxPg }) => rx.Observable<OrmTestA>;
  public pgUpdate$: ({ pg }: { pg: RxPg }) => rx.Observable<OrmTestA>;
  public pgDelete$: ({ pg }: { pg: RxPg }) => rx.Observable<OrmTestA>;

  /**
   *
   * The A member.
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
   * Constructor.
   *
   */
  constructor({
      a,
      b
    }: {
      a: number;
      b: string;
  }) {

    if (!lodash.isNumber(+a)) {

      throw new Error("a must be a number");

    }

    this._a = +a;

    this.patch$({ b: b });

    generateDefaultPgFunctions(this, {

      restApiErrorMapping: true,

      pgCreate$: {
        params: () => [ this._a, this._b ],
        sql: "insert into dummyrestobject values($1, $2)",
        returns: () => this
      }

    })

}
