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



// Closes the namespace

}
