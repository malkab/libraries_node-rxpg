import { OrmError } from "@malkab/ts-utils";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { EPGERRORCODES, QueryResult, RxPg } from "../index";

/**
 *
 * These are a bunch of helpers to add standard persistence to objects of
 * PostgreSQL. Objects will need to implement some methods to add SQL logic for
 * PG persistence: INSERT / SELECT / UPDATE / DELETE operations. A set of
 * helpers are provided to make this process as standard as possible for future
 * integration with an standard matching REST POST / GET / PATCH / DELETE
 * workflow on Appian routers.
 *
 * This ORM adapters (this is for PG, others adapt to RxRedis, for example). All
 * adapters must return errors in the ts-utils OrmError error.
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
 * select$, selectMany$ support errors thrown by the constructor and by
 * newFunction custom initializators, so feel free to throw errors there.
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
  pgInsert$: (pg: RxPg, ...additionalParams: any) => rx.Observable<T>;
  /**
   *
   * Each class needs to implement a PATCH method that takes the object (this)
   * and provide an SQL statement to UPDATE the instance data. This method will
   * use the update$ helper method provided by PgRestObject to launch the UPDATE
   * and control result in an standard way.
   *
   */
  pgUpdate$: (pg: RxPg, ...additionalParams: any) => rx.Observable<T>;
  /**
   *
   * Each class needs to implement a DELETE method that takes the object (this)
   * and provide an SQL statement to DELETE the instance data. This method will
   * use the delete$ helper method provided by PgRestObject to launch the DELETE
   * and control result in an standard way.
   *
   */
  pgDelete$: (pg: RxPg, ...additionalParams: any) => rx.Observable<T>;
}

/**
 *
 * This is the interface to help create the default **pgInsert$** /
 * **pgUpdate$** / **pgDelete$** functions.
 *
 */
interface IDefaultPgOrmMethodsDefinitions<T> {
  /**
   *
   * The **pgInsert$** operation. The SQL must be a paramtrized INSERT query and
   * the parameters will be taken from the function params, that will push an
   * array of members of the instance being inserted that must match the
   * parameter's order at the SQL definition.
   *
   */
  pgInsert$?: {
    preprocessing$?: (object: T, additionalParams?: any) => rx.Observable<any>;
    sql: (additionalParams?: any) => string;
    params$: (object: T, additionalParams?: any) => rx.Observable<any[]>;
    returns$?: (result: QueryResult, object?: T, additionalParams?: any) =>
      rx.Observable<any>;
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
    preprocessing$?: (object: T, additionalParams?: any) => rx.Observable<any>;
    sql: (additionalParams?: any) => string;
    params$: (object: T, additionalParams?: any) => rx.Observable<any[]>;
    returns$?: (result: QueryResult, object?: T, additionalParams?: any) =>
      rx.Observable<any>;
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
    preprocessing$?: (object: T, additionalParams?: any) => rx.Observable<any>;
    sql: (additionalParams?: any) => string;
    params$: (object: T, additionalParams?: any) => rx.Observable<any[]>;
    returns$?: (result: QueryResult, object?: T, additionalParams?: any) =>
      rx.Observable<any>;
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
export function generateDefaultPgOrmMethods<T>(
  object: T,
  config: IDefaultPgOrmMethodsDefinitions<T>
): void {

  // Check if pgInsert$ has been configured
  if(config.pgInsert$) {

    const c = config.pgInsert$;

    // Generate a default preprocessing and returns function
    const preprocessing: (object: T, additionalParams?: any) => rx.Observable<any> =
      c.preprocessing$ ? c.preprocessing$ : (object: T, additionalParams?: any) => rx.of(object);

    const returns: (result: QueryResult, object: T, additionalParams?: any) => rx.Observable<any> =
      c.returns$ ? c.returns$ : (result: QueryResult, object: T, additionalParams?: any) => rx.of(object);

    // To store computed params
    let computedParams: any[];

    // Run
    (<any>object)["pgInsert$"] = (pg: RxPg, additionalParams?: any): rx.Observable<T> => {

      return preprocessing(object, additionalParams)
      .pipe(

        rxo.concatMap((o: any) => c.params$(object, additionalParams)),

        rxo.concatMap((o: any) => {

          computedParams = o;
          return executeParamQuery$({ pg: pg, sql: c.sql(additionalParams),
            params: () => computedParams })

        }),

        rxo.catchError((e: Error) => {

          // Invalid parameters
          if ((<any>e).code === EPGERRORCODES.invalid_text_representation) {

            throw new OrmError.OrmError(e,
              OrmError.EORMERRORCODES.INVALID_OBJECT_PARAMETERS,
              `RxPg ORM ${(<any>object).constructor.name} pgInsert$ method params [${computedParams}] invalid object parameters: `);

          }

          // Foreign key violations
          if ((<any>e).code === EPGERRORCODES.foreign_key_violation) {

            throw new OrmError.OrmError(e,
              OrmError.EORMERRORCODES.UNMET_BACKEND_DEPENDENCY,
              `RxPg ORM ${(<any>object).constructor.name} pgInsert$ method params [${computedParams}] unmet backend dependency: `);

          }

          // Duplicated ID
          if ((<any>e).code === EPGERRORCODES.unique_violation) {

            throw new OrmError.OrmError(e,
              OrmError.EORMERRORCODES.DUPLICATED,
              `RxPg ORM ${(<any>object).constructor.name} pgInsert$ method params [${computedParams}] duplicated: `);

          }

          // Default throw
          throw new OrmError.OrmError(e,
            OrmError.EORMERRORCODES.UNSPECIFIED_BACKEND_ERROR,
            `RxPg ORM ${(<any>object).constructor.name} pgInsert$ method params [${computedParams}] unspecified backend error: `);

        }),

        rxo.concatMap((o: QueryResult) => returns(o, object, additionalParams))

      )

    }

  }

  // Check if pgUpdate$ has been configured
  if(config.pgUpdate$) {

    const c = config.pgUpdate$;

    // Generate a default preprocessing and returns function
    const preprocessing: (object: T, additionalParams?: any) => rx.Observable<any> =
      c.preprocessing$ ? c.preprocessing$ : (object: T, additionalParams?: any) => rx.of(object);

    const returns: (result: QueryResult, object: T, additionalParams?: any) => rx.Observable<any> =
      c.returns$ ? c.returns$ : (result: QueryResult, object: T, additionalParams?: any) => rx.of(object);

    // To store computed params
    let computedParams: any[];

    // Run
    (<any>object)["pgUpdate$"] = (pg: RxPg, additionalParams?: any): rx.Observable<T> => {

      return preprocessing(object, additionalParams)
      .pipe(

        rxo.concatMap((o: any) => c.params$(object, additionalParams)),

        rxo.concatMap((o: any) => {

          computedParams = o;
          return executeParamQuery$({ pg: pg, sql: c.sql(additionalParams),
            params: () => computedParams })

        }),

        rxo.catchError((e: Error) => {

          // Invalid parameters
          if ((<any>e).code === EPGERRORCODES.invalid_text_representation) {

            throw new OrmError.OrmError(e,
              OrmError.EORMERRORCODES.INVALID_OBJECT_PARAMETERS,
              `RxPg ORM ${(<any>object).constructor.name} pgUpdate$ method params [${computedParams}] invalid object parameters: `);

          }

          // Foreign key violations
          if ((<any>e).code === EPGERRORCODES.foreign_key_violation) {

            throw new OrmError.OrmError(e,
              OrmError.EORMERRORCODES.UNMET_BACKEND_DEPENDENCY,
              `RxPg ORM ${(<any>object).constructor.name} pgUpdate$ method params [${computedParams}] unmet backend dependency: `);

          }

          // Default throw
          throw new OrmError.OrmError(e,
            OrmError.EORMERRORCODES.UNSPECIFIED_BACKEND_ERROR,
            `RxPg ORM ${(<any>object).constructor.name} pgUpdate$ method params [${computedParams}] unspecified backend error: `);

        }),

        rxo.concatMap((o: QueryResult) => {

          // Check if there was any object updated, else throw not found
          if (o.rowCount === 0) {

            throw new OrmError.OrmError(new Error("not found"),
              OrmError.EORMERRORCODES.NOT_FOUND,
              `RxPg ORM ${(<any>object).constructor.name} pgUpdate$ method params [${computedParams}] not found error: `);

          }

          return returns(o, object, additionalParams)

        })

      )

    }

  }

  // Check if pgDelete$ has been configured
  if(config.pgDelete$) {

    const c = config.pgDelete$;

    // Generate a default preprocessing and returns function
    const preprocessing: (object: T, additionalParams?: any) => rx.Observable<any> =
      c.preprocessing$ ? c.preprocessing$ : (object: T, additionalParams?: any) => rx.of(object);

    const returns: (result: QueryResult, object: T, additionalParams?: any) => rx.Observable<any> =
      c.returns$ ? c.returns$ : (result: QueryResult, object: T, additionalParams?: any) => rx.of(object);

    // To store computed params
    let computedParams: any[];

    // Run
    (<any>object)["pgDelete$"] = (pg: RxPg, additionalParams?: any): rx.Observable<T> => {

      return preprocessing(object, additionalParams)
      .pipe(

        rxo.concatMap((o: any) => c.params$(object, additionalParams)),

        rxo.concatMap((o: any) => {

          computedParams = o;
          return executeParamQuery$({ pg: pg, sql: c.sql(additionalParams),
            params: () => computedParams })

        }),

        rxo.catchError((e: Error) => {

          // Invalid parameters
          if ((<any>e).code === EPGERRORCODES.invalid_text_representation) {

            throw new OrmError.OrmError(e,
              OrmError.EORMERRORCODES.INVALID_OBJECT_PARAMETERS,
              `RxPg ORM ${(<any>object).constructor.name} pgDelete$ method params [${computedParams}] invalid object parameters: `);

          }

          // Default throw
          throw new OrmError.OrmError(e,
            OrmError.EORMERRORCODES.UNSPECIFIED_BACKEND_ERROR,
            `RxPg ORM ${(<any>object).constructor.name} pgDelete$ method params [${computedParams}] unspecified backend error: `);

        }),

        rxo.concatMap((o: QueryResult) => {

          // Check if there was any object updated, else throw not found
          if (o.rowCount === 0) {

            throw new OrmError.OrmError(new Error("not found"),
              OrmError.EORMERRORCODES.NOT_FOUND,
              `RxPg ORM ${(<any>object).constructor.name} pgDelete$ method params [${computedParams}] not found error: `);

          }

          return returns(o, object, additionalParams);

        })

      )

    }

  }

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

  return pg.executeParamQuery$(sql, {
    params: params() })
  .pipe(

    // Return true if successfull
    rxo.map((o: any) => {

      return returns(o);

    })

  )

}

/**
 *
 * Helper function to write the get$ methods for ORM objects, that usually are
 * statics. This function returns a single instantiated object of class T, also
 * defined by the object **type** passed as a param.
 *
 * @param pg
 * The persistence objects and/or parameters to perform the CREATE option.
 *
 * @param sql
 * The SQL to pass to RxPg.executeParamQuery.
 *
 * @param type
 * The type to create instances from the returned DB rows.
 *
 * @param params
 * The params to use with the given SQL, passed as a paramless function that
 * must return an array of params in the right order.
 *
 * @param newFunction
 * This function allows for a customized object T initialization workflow. By
 * default, this method just calls the new constructor of the type with the
 * parameters coming from the database, as designed in the provided SQL. The
 * definition of this custom function allow for the definition of complex,
 * potentially asynchronous tasks. This function has the prototype:
 *
 * ```TypeScript
 * (params: any) => rx.Observable<T>
 * ```
 *
 * Into this function are injected several parameters:
 *
 * - rows obtained from the SQL query;
 * - an additional param by the name **select$params** that contains:
 *   - the RxPg object used to connect to the DB;
 *   - the params from the params function parameter.
 *
 * The newFunction return is any so factories can be used.
 *
 * @returns
 * An instantiated object of class "type" with values coming from the DB.
 *
 */
export function select$<T>({
  pg,
  sql,
  type,
  params = () => [],
  newFunction = (params: any) => rx.of(new type(params))
}: {
  pg: RxPg;
  sql: string;
  type: any;
  params?: () => any[];
  newFunction?: (params: any) => rx.Observable<any>;
}): rx.Observable<T> {

  return pg.executeParamQuery$( sql, {
    params: params() })
  .pipe(

    rxo.concatMap((o: QueryResult) => {

      // Launch base not found error here for later caching at catchError
      if (o.rows.length === 0) {

        throw new Error("not found");

      }

      return newFunction(
        { ...o.rows[0], select$params: { pg: pg, params: params() } })

    }),

    rxo.catchError((e: Error) => {

      // Filter the OrmError NOT_FOUND of the last pipe
      if (e.message === "not found") {

        throw new OrmError.OrmError(e,
          OrmError.EORMERRORCODES.NOT_FOUND,
          `RxPg ORM ${type.name} select$ method params [${params()}] not found error: `);

      }

      // User provided wrong select parameters
      if ((<any>e).code === EPGERRORCODES.invalid_text_representation) {

        throw new OrmError.OrmError(e,
          OrmError.EORMERRORCODES.INVALID_OBJECT_PARAMETERS,
          `RxPg ORM ${type.name} select$ method params [${params()}] invalid object parameters: `);

      }

      // A PG error code not catched before
      if ((<any>e).code) {

        throw new OrmError.OrmError(e,
          OrmError.EORMERRORCODES.UNSPECIFIED_BACKEND_ERROR,
          `RxPg ORM ${type.name} select$ method params [${params()}] unspecified backend error: `);

      }

      throw new OrmError.OrmError(e,
        OrmError.EORMERRORCODES.ERROR_INSTANTIATING_OBJECT,
        `RxPg ORM ${type.name} select$ method params [${params()}] instantiation error by values retrieved from the backend: `);

    })

  );

}

/**
 *
 * Helper function to write the get$ methods for ORM objects, that usually are
 * statics. This function returns an array of instantiated objects of class T,
 * also defined by the object **type** passed as a param.
 *
 * The newFunction return is any so factories can be used.
 *
 * @param pg
 * The persistence objects and/or parameters to perform the CREATE option.
 *
 * @param sql
 * The SQL to pass to RxPg.executeParamQuery.
 *
 * @param type
 * The type to create instances from the returned DB rows.
 *
 * @param params
 * The params to use with the given SQL, passed as a paramless function that
 * must return an array of params in the right order.
 *
 * @param newFunction
 * This function allows for a customized object T initialization workflow. By
 * default, this method just calls the new constructor of the type with the
 * parameters coming from the database, as designed in the provided SQL. The
 * definition of this custom function allow for the definition of complex,
 * potentially asynchronous tasks. This function has the prototype:
 *
 * ```TypeScript
 * (params: any) => rx.Observable<T>
 * ```
 *
 * Into this function are injected several parameters:
 *
 * - rows obtained from the SQL query;
 * - an additional param by the name **select$params** that contains:
 *   - the RxPg object used to connect to the DB;
 *   - the params from the params function parameter.
 *
 * @returns
 * An instantiated object of class "type" with values coming from the DB.
 *
 */
export function selectMany$<T>({
  pg,
  sql,
  type,
  params = () => [],
  newFunction = (params: any) => rx.of(new type(params))
}: {
  pg: RxPg;
  sql: string;
  type: any;
  params?: () => any[];
  newFunction?: (params: any) => rx.Observable<any>;
}): rx.Observable<T[]> {

  return pg.executeParamQuery$(sql, {
    params: params() })
  .pipe(

    rxo.concatMap((o: QueryResult) => {

      const obs: rx.Observable<T>[] =
        o.rows.map((r: any) => newFunction({ ...r,
          selectMany$params: { pg: pg, params: params() } }));

      if (obs.length > 0) {

        return rx.zip(...obs);

      } else {

        return rx.of([]);

      }

    }),

    rxo.catchError((e: Error) => {

      // User provided wrong select parameters
      if ((<any>e).code === EPGERRORCODES.invalid_text_representation) {

        throw new OrmError.OrmError(e,
          OrmError.EORMERRORCODES.INVALID_OBJECT_PARAMETERS,
          `RxPg ORM ${type.name} selectMany$ method params [${params()}] invalid object parameters: `);

      }

      // A PG error code not catched before
      if ((<any>e).code) {

        throw new OrmError.OrmError(e,
          OrmError.EORMERRORCODES.UNSPECIFIED_BACKEND_ERROR,
          `RxPg ORM ${type.name} selectMany$ method params [${params()}] unspecified backend error: `);

      }

      throw new OrmError.OrmError(e,
        OrmError.EORMERRORCODES.ERROR_INSTANTIATING_OBJECT,
        `RxPg ORM ${type.name} selectMany$ method params [${params()}] instantiation error by values retrieved from the backend: `);

    }),

    rxo.map((o: any) => {

      return o;

    })

  );

}
