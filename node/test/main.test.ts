import "mocha";

import "webpack";

console.log(`

--------------------------

Mocha testing

--------------------------

`);

describe("libsunnsaasbackend Tests", () => {
  require("./tests/pgorm.test");
  // require("./tests/analysis.test");
  // require("./tests/dataset.test");
  // require("./tests/analysistasks.test");
});
