#!/usr/bin/env mocha -t 5000 -R list

var assert = require("assert");
var domino = require("domino");
var bind = require("../lib/bind.js");

function dom(html) {
    var doc = domino.createWindow(html).document;
    return doc.body.firstChild;
}

describe("bind(elem, bindigs)", function() {

    it("should leave input untouched if no bindings", function() {
        var node = dom("<div>Some Content</div>");
        var result = bind(node);
        assert.equal("<div>Some Content</div>", result.outerHTML);
    });

    it("replace one simple node", function() {
        var node = dom("<div>Hello <span>NAME</span>!</div>");
        var model = { "name": "John" };
        var mapper = function(m) { return { "span": m.name }};
        var result = bind(node, model, mapper);
        assert.equal("<div>Hello <span>John</span>!</div>", result.outerHTML);
    });

    it("iterate over simple list with an array model", function() {
        var node = dom("<div>Fruits: <i>NAME</i></div>");
        var model = [ "Orange", "Banana", "Apple" ];
        var mapper = function(m) { return { "i": m }};
        var result = bind(node, model, mapper);
        assert.equal("<div>Fruits: <i>Orange</i><i>Banana</i><i>Apple</i></div>", result.outerHTML);
    });

    it("replace simple attribute with direct mapping (no model)", function() {
        var node = dom("<div style='STYLE'>Hello John!</div>");
        var mapping = { "@style": "font-weight: bold;" };
        var result = bind(node, mapping);
        assert.equal("<div style=\"font-weight: bold;\">Hello John!</div>", result.outerHTML);
    });

    it("conditional replacement based on boolean values", function() {
        var node = dom("<div>Hello <span class='first'>John</span> <span class='last'>Smith</span>!</div>");
        var model = { onlyFirst: true };
        var mapper = function(m) { return { "span.first": m.onlyFirst, "span.last": !m.onlyFirst }};
        var result = bind(node, model, mapper);
        assert.equal("<div>Hello <span class=\"first\">John</span> !</div>", result.outerHTML);
    });

    it("replace node with functional value", function() {
        var node = dom("<div>Hello <span>NAME</span>!</div>");
        var model = { "first": "John", "last": "Smith" };
        var mapper = function(m) { return { "span": function() { return (m.first+" "+ m.last).toUpperCase() } }};
        var result = bind(node, model, mapper);
        assert.equal("<div>Hello <span>JOHN SMITH</span>!</div>", result.outerHTML);
    });

});
