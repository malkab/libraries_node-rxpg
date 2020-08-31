import { trimEnd } from "lodash";

/**
 *
 * This module contains a set of helpers that are commonly used in
 * many applications.
 *
 */
export namespace helpers {

/**
 *
 * This function takes an array of strings and outputs a string suitable
 * to be used in an IN condition. For example, call this function
 * with:
 *
 *  [ "id0", "id1", "id2" ]
 *
 * and this function will return:
 *
 *  ('id0', 'id1', 'id2')
 *
 */
export function inOperatorString(...items: string[]): string {

  items = items.map((x) => {

    return `\'${x}\'`;

  })

  return `(${items.join(",")})`;

}

/**
 *
 * Returns an array compatible syntax for transforming JS arrays into SQL
 * arrays:
 *
 * [ 1, 2, 3, 4 ]    > array[1,2,3,4]::integer[]
 *
 * [ 'a', 'b', 'c' ] > array['a', 'b', 'c']::varchar[]
 *
 * @param array     The array to transform.
 * @param type      The type of the array. If varchar, items will be quoted.
 *
 */
export function toSqlArray(array: any[], type: string): string {

  let a: string = "array[";

  array.map((x: any) => {

    if (type === "varchar") {

      a = `${a}'${x}',`;

    } else {

      a = `${a}${x},`;

    }

  })

  return `${trimEnd(a, ",")}]::${type}[]`;

}

// Closes the namespace
}
