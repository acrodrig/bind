var fs = require("fs");
var domino = require("domino");
var path = require("path");
var bind = require("../lib/bind.js");

// Create document
var file = path.join(__dirname, "page.html");
var html = fs.readFileSync(file);
var doc = domino.createWindow(html).document;

// Simpler version of the one contained in Underscore
function times(n, iteratee) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
}

var mapping = {
    div: "Title",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    li: times(100, function(i) { return i; })
};

var count = 100;

console.log("Benchmarking... ");

console.time("simple");
for (var i = 0; i < count; i++) {
    // console.log("Iteration [", i, "]: ", doc.innerHTML);
    var result = bind(doc.body, mapping);
    // console.log("Result: ", result.outerHTML);
}
console.timeEnd("simple");
