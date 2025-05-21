import "mocha";

import "webpack";

console.log(`

--------------------------

Mocha testing

--------------------------

`);

describe("libsunnsaasbackend Tests", () => {
  describe("\n\n  --- rxpg.test ---\n", () => require("./tests/rxpg.test"));
  describe("\n\n  --- pgorm.test ---\n", () => require("./tests/pgorm.test"));
});
