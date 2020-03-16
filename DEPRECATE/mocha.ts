console.log("mocha");


// /**
//  * 
//  * Main TypeDoc comment.
//  * 
//  */

// // This comment here is important because if not present the above one
// // is not shown in the TypeDoc documentation.

// import { expect } from "chai";
// import "mocha";


// // Testing imports
// import { sum } from "./lib/lib";
// import { substract } from "./lib/lib2/lib2";





// /**
//  * 
//  * An exported, very important, very mighty, const
//  * 
//  */
// export const THECONST: string = "I'm a mighty const";

// console.log("Running Mocha tests...");

// // Debugger stops here
// debugger;

// /**
//  *
//  * Sums 10 to input.
//  * 
//  * @param a     The number to sum 10 to.
//  * @returns     a plus 10
//  */

// function testFunction(a: number): number {

//     return a + 10;

// }

// /**
//  * 
//  * This is a comment for a test.
//  */

// describe("sum", () => {

//     it("Return type", () => {
//         expect(sum(2, 2)).to.deep.equal(4);
//     });

// });


// describe("substract", () => {

//     it("Return type", () => {
//         expect(substract(2, 2)).to.deep.equal(0);
//     });

//     // This is the way promises are tested

//     it("set", (done) => {

//         const testObject: TestClass = new TestClass("testID", 5);

//         const promise = redisService.set(testObject);

//         promise.then((result: boolean) => {

//             expect(result).to.equal(true);
//             done();

//         });

//     })

// });