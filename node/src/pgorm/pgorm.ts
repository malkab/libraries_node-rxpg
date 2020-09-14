import { RxPg } from "../core/rxpg";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { EPGERRORCODES } from "../core/epgerrorcodes";

import { QueryResult } from "pg";

import { OrmError } from './ormerror';

import { EORMERRORCODES } from './eormerrorcodes';

/**
 *
 * These are a bunch of helpers to add standard persistence to objects of
 * PostgreSQL. Objects will need to implement some methods to add SQL logic for
 * PG persistence: INSERT / SELECT / UPDATE / DELETE operations. A set of
 * helpers are provided to make this process as standard as possible for future
 * integration with an standard matching REST POST / GET / PATCH / DELETE
 * workflow on Appian routers.
 *
 */

/**
 *
 * This class and the companion interface are helpers used to create classes
 * that are meant to be persisted at a PG instance. To use this helpers in a
 * class, apply the following guidelines.
 *
 * # Generic Guidelines
 *
 * This class don't reference an internal RxPg instance. Instead of that, the
 * RxPg instance upon which to perform the persistence operation must be
 * provided on each method call.
 *
 * Make the class implement the **IPgRestObject** interface. This will force the
 * class to implement the following methods and members.
 *
 * The class must have a **pgRestObject: PgRestObject** public member that needs
 * to be initialized at the constructor by providing the base RxPg object that
 * has the pool to the DB where the persistence is going to occur
 * (this.pgRestObject = new PgRestObject(pg)). This PgRestObject will provide
 * helpers to easily implement persistable methods in an standard way.
 *
 * # post$, patch$, and delete$ Procedures
 *
 * The class must implement three **post$** (create), **patch$** (update), and
 * **delete$** (delete) CRUD methods as public members. These methods operates
 * in the **this** context to persist the class instances. All this methods must
 * be implemented without parameters and they use the matching helpers in the
 * PgRestObject class, which needs an SQL and a set of params to pass to the
 * RxPg.executeParamQuery$(sql, params).
 *
 * In the end, each object defines their own SQL logic to perform as complex a
 * logic as needed.
 *

 *
 * The also static PgRestObject.get$(pg: RxPg, TheType: any, sql: string, key:
 * string, ...id: string[]) helper method of PgRestObject is used to perform the
 * select. A RxPg instance to the DB pool, the type class to create the new
 * objects, the SELECT SQL, the name of the key column, and finally the set of
 * ID to be retrieved must be provided. This means that the helper function only
 * works with single-column key tables. If the key is more complex, the helper
 * cannot be used and a custom get$ must be implemented.
 *
 * ## get$ Procedures
 *
 * Several **get$** (select) methods can be implemented. This methods are static
 * so they can be called without prior instantiation of the class:
 *
 * ```TypeScript
 * class TheType {
 *
 *    public static get$(pg: RxPg, ...id: string[]): rx.Observable<any> {}
 *
 * }
 *
 * TheType.get$(pg: RxPg, "a", "b", "c");
 * ```
 *
 * The class must have a deconstructed parameters constructor so columns coming
 * from QueryResult results can be easily translated into constructor parameters
 * using SELECT AS aliases. For example, if a table is defined as:
 *
 * ```SQL
 * create table a(
 *    param_a integer,
 *    param_b integer
 * )
 * ```
 *
 * and a class whose constructor is declared as:
 *
 * ```TypeScript
 * constructor({
 *    paramA,
 *    paramB
 *  }: {
 *    paramA: number;
 *    paramB: number;
 * })
 * ```
 *
 * can be easily matched if QueryResult is constructed with this SQL statement:
 *
 * ```SQL
 * select
 *    param_a as "paramA",
 *    param_b as "paramB"
 * from a;
 * ```
 *
 * that are tipically used at **get$** methods.
 *
 * Constructors can be easily feed with the direct results of QueryResult to
 * return new instances of the target class:
 *
 * ```TypeScript
 * queryResult.rows.map((x: any) => {
 *
 *    return new Type(x);
 *
 * })
 * ```
 *
 * To help create get$ methods, two helpers are available. The specific
 * **getByAnyColumnValue$** method returns records that matches a certain value
 * in a column. This is use for easily retrieve records with a certain ID or
 * another trait, for example:
 *
 * ```TypeScript
 * getByAnyColumnValue$(
 *    pg,
 *    TheTypeToBeReturned,
 *    "select param_a as paramA, param_b as paramB from a",
 *    "param_a",
 *    true,
 *    "a", "b", "c"
 * )
 * ```
 *
 * will return all rows that has any of a b c values at the param_a column. The
 * strict parameter (the true) will return an error if the number of returned
 * rows does not match the number of given values. This is useful when it is
 * mandatory, like in the case of key columns, that every passed value returns a
 * record.
 *
 * The other helper is just a call to RxPg.executeParamQuery with a custom SQL
 * and custom params, to retrieve objects based on any logic.
 *
 */


/**
 *
 * This is the interface an object must implement to comply with the standard
 * PostgreSQL INSERT / UPDATE / DELETE operations. Please note that the SELECT
 * operation is not provided in the interface. The SELECT operation is meant to
 * be an static method defined at the object so it can act as a factory to
 * provide custom subclasses if needed from the information persisted at PG.
 * Therefore, to comply with the standard workflow, the object must provide an
 * static method to retrieve **A SINGLE** item with this prototype:
 *
 * ```TypeScript
 * public static pgSelect$({ pg: RxPg, initParams: any }) => rx.Observable<T>
 * ```
 *
 * where **initParams** is an object with part of the class public interface.
 *
 * For example, say a class with a dual key **idA** and **idB** wants to be
 * retireved. An example of a **pgSelect$** static method could go on these
 * lines:
 *
 * ```TypeScript
 * public static pgSelect$({
 *      pg,
 *      initParams
 *    }: {
 *      pg: RxPg,
 *      initParams: any
 * }): rx.Observable<DummyPgObject> {
 *
 *    return select$<DummyPgObject>({
 *      pg: pg,
 *      sql: `
 *        select * from dummypgobjecttable
 *        where id_a = $1 and id_b = $2`,
 *      type: DummyPgObject,
 *      initParams: () => [ initParams.a, initParams.b ]
 *    })
 *
 * }
 * ```
 *
 * This static function is using the pgSelect$ helper provided in this module,
 * but any PG-bound retrieval logic is possible using the resources at RxPg.
 *
 * Please refer to the code of classes **PgPersistenceStandards** and
 * **PgPersistenceCustom** to check how to use all the helpers provided in this
 * module or how to go in a completely custom way.
 *
 */
export interface IPgOrm<T> {
  /**
   *
   * Each class needs to implement a POST method that takes the object (this)
   * and provide an SQL statement to INSERT the instance data. This method will
   * use the post$ helper method provided by PgRestObject to launch the INSERT
   * and control result in an standard way.
   *
   * This method must have deconstructed params so it can be called with anonymous params
   * by the ORM router constructors like the one at Appian.
   *
   */
  pgInsert$: ({ pg }: { pg: RxPg }) => rx.Observable<T>;
  /**
   *
   * Each class needs to implement a PATCH method that takes the object (this)
   * and provide an SQL statement to UPDATE the instance data. This method will
   * use the update$ helper method provided by PgRestObject to launch the UPDATE
   * and control result in an standard way.
   *
   */
  pgUpdate$: ({ pg }: { pg: RxPg }) => rx.Observable<T>;
  /**
   *
   * Each class needs to implement a DELETE method that takes the object (this)
   * and provide an SQL statement to DELETE the instance data. This method will
   * use the delete$ helper method provided by PgRestObject to launch the DELETE
   * and control result in an standard way.
   *
   */
  pgDelete$: ({ pg }: { pg: RxPg }) => rx.Observable<T>;
}

/**
 *
 * This is the interface to help create the default **pgInsert$** /
 * **pgUpdate$** / **pgDelete$** functions.
 *
 */
interface IDefaultPgOrmMethodsDefinitions {
  /**
   *
   * If true, will map PG errors to API errors, for an automatic integration
   * within the REST API router standard generation.
   *
   */
  restApiErrorMapping: boolean;
  /**
   *
   * Methods.
   *
   */
  methods?: {
    /**
     *
     * The **pgInsert$** operation. The SQL must be a paramtrized INSERT query and
     * the parameters will be taken from the function params, that will push an
     * array of members of the instance being inserted that must match the
     * parameter's order at the SQL definition.
     *
     */
    pgInsert$?: {
      sql: string;
      params: () => any[];
      returns?: (result: QueryResult) => any;
    },
    /**
     *
     * The **pgUpdate$** operation. The SQL must be a paramtrized UPDATE query and
     * the parameters will be taken from the function params, that will push an
     * array of members of the instance being inserted that must match the
     * parameter's order at the SQL definition.
     *
     */
    pgUpdate$?: {
      sql: string;
      params: () => any[];
      returns?: (result: QueryResult) => any;
    },
    /**
     *
     * The **pgDelete$** operation. The SQL must be a paramtrized DELETE query and
     * the parameters will be taken from the function params, that will push an
     * array of members of the instance being inserted that must match the
     * parameter's order at the SQL definition.
     *
     */
    pgDelete$?: {
      sql: string;
      params: () => any[];
      returns?: (result: QueryResult) => any;
    }
  }

}

/**
 *
 * This helper will generate and inject into the object implementing the
 * IPgPersistence interface default, single SQL versions of functions for the
 * persistence INSERT / UPDATE / DELETE operations (remember that SELECT is
 * implemented as an static function).
 *
 * @param object        The object to patch, **this** most probably at the
 *                      constructor.
 * @param config        The configuration of the SQL and parameters.
 */
export function generateDefaultPgOrmMethods(
  object: any,
  config: IDefaultPgOrmMethodsDefinitions
): void {

  Object.keys(config.methods).map((x: string) => {

    const c: {
      sql: string,
      params: () => any[],
      returns?: (result: QueryResult) => any
    } = (<any>config.methods)[x];

    object[x] = ({ pg }: { pg: RxPg }): rx.Observable<any> => {

      return executeParamQuery$({
        pg: pg,
        sql: c.sql,
        params: c.params
      })
      .pipe(

        rxo.catchError((e: Error) => {

          // Map PG errors to ORM ones?
          if (config.restApiErrorMapping) {

            // Invalid parameters
            if ((<any>e).code === EPGERRORCODES.invalid_text_representation) {

              throw new OrmError({
                code: EORMERRORCODES.INVALID_OBJECT_PARAMETERS,
                error: e,
                message: 'invalid object parameters'
              })

            }

            // Duplicated ID
            if ((<any>e).code === EPGERRORCODES.unique_violation) {

              throw new OrmError({
                code: EORMERRORCODES.DUPLICATED,
                error: e,
                message: 'duplicated key'
              })

            }

            // Default throw
            throw e;

          } else {

            throw e;

          }

        }),

        rxo.map((o: QueryResult) => {

          const r: (o: QueryResult) => any = c.returns !== undefined ?
            c.returns : (o: QueryResult) => o

          return r(o);

        })

      );

    }

  })

}

/**
 *
 * This helper function just takes a PG connection, a parametrized SQL, a
 * function returning the params in the correct order, and an optional return
 * function to execute the SQL in standard PostgreSQL **SELECT / INSERT / UPDATE
 * / DELETE** workflows.
 *
 */
export function executeParamQuery$({
  pg,
  sql,
  params,
  returns = (results: QueryResult) => results
}: {
  pg: RxPg;
  sql: string;
  params: () => any[];
  returns?: (results: QueryResult) => any;
}): rx.Observable<any> {

  return pg.executeParamQuery$(sql, params())
  .pipe(

    // Return true if successfull
    rxo.map((o: any) => {

      return returns(o);

    })

  )

}

/**
 *
 * GET: for getting objects by ID. CRUD READ operation. Static to be called
 * without instantiating an object and creating factories.
 *
 * Successfull code: 200 (OK).
 * Errors codes: 404 (Not Found) if object ID doesn't exists.
 *
 * @param pg                The persistence objects and/or parameters to
 *                          perform the CREATE option.
 * @param type              The type to create instances from the returned DB
 *                          rows.
 * @param sql               The SQL to pass to RxPg.executeParamQuery.
 * @param params            The params to use with the given SQL.
 * @returns                 An array of objects of class "type".
 *
 */
export function select$<T>({
  pg,
  sql,
  type,
  params
}: {
  pg: RxPg;
  sql: string;
  type: any;
  params: () => any[];
}): rx.Observable<T> {

  return pg.executeParamQuery$(
    sql,
    params()
  ).pipe(

    rxo.map((o: QueryResult) => {

      if (o.rows.length === 0) {
        throw new OrmError({
          code: EORMERRORCODES.NOT_FOUND,
          error: new Error("not found"),
          message: "not found"
        })
      }

      return <T>(new type(o.rows[0]));

    })

  );

}

/**
 *
 * GET: for getting objects by ID. CRUD READ operation. Static to be called
 * without instantiating an object and creating factories.
 *
 * Successfull code: 200 (OK).
 * Errors codes: 404 (Not Found) if object ID doesn't exists.
 *
 * @param pg                The persistence objects and/or parameters to
 *                          perform the CREATE option.
 * @param type              The type to create instances from the returned DB
 *                          rows.
 * @param sql               The SQL to pass to RxPg.executeParamQuery.
 * @param params            The params to use with the given SQL.
 * @returns                 An array of objects of class "type".
 *
 */
export function selectMany$<T>({
  pg,
  sql,
  type,
  params
}: {
  pg: RxPg;
  sql: string;
  type: any;
  params: () => any[];
}): rx.Observable<T[]> {

  return pg.executeParamQuery$(
    sql,
    params()
  )
  .pipe(

    rxo.map((o: QueryResult) => {

      return o.rows.map((r: any) => {

        return <T>(new type(r));

      })

    })

  );

}
