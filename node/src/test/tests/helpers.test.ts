import "mocha";

import { helpers as h } from "../../lib/index";

import { expect } from "chai";





describe("helpers module", function() {

  it("inOperatorString", function() {

    expect(h.inOperatorString("ID0", "ID1", "ID2") ).to.equal(
      "('ID0','ID1','ID2')"
    );

  });

});
