#!/usr/bin/env mocha --check-leaks

var assert = require("assert");
var equal = require("../lib/bind.js").equal;

describe("equal(o1, o2)", function() {

    it("equal", function() {
        assert(equal(
            { a : [ 2, 3 ], b : [ 4 ] },
            { a : [ 2, 3 ], b : [ 4 ] }
        ));
    });

    it("not equal", function() {
        assert(!equal(
            { x : 5, y : [6] },
            { x : 5, y : 6 }
        ));
    });

    it("nested nulls", function() {
        assert(equal(
            [ null, null, null ],
            [ null, null, null ]
        ));
    });

    it("strict equal", function() {
        assert(!equal(
            [ { a: 3 }, { b: 4 } ],
            [ { a: "3" }, { b: "4" } ]
        ));
    });

    it("non-objects", function() {
        assert(equal(3, 3));
        assert(equal("beep", "beep"));
        assert(!equal("3", 3));
        assert(!equal("3", [3]));
    });

    it("dates", function() {
        assert(equal(
            new Date(1387585278000),
            new Date('Fri Dec 20 2013 16:21:18 GMT-0800 (PST)')
        ));
    });

    it("booleans and arrays", function() {
        assert(!equal(true, []));
    });

    it("null is not undefined", function() {
        assert(!equal(null, undefined));
    });

    it("cylic object", function() {
        var o1 = { a: "1" }, o2 = { a: "1" }, all = [o1, o2];
        o1.list = all;
        o2.list = all;
        assert(equal(o1, o2));
        o2.list = o1.list.slice(0);
        assert(equal(o1, o2));
        o1.self = o1;
        assert(!equal(o1, o2));
    });
});
