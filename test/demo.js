var README = "";

// Get a hold of the README file
var xhr = new XMLHttpRequest();
xhr.open("GET", "../README.md");
xhr.send(null);
xhr.onload = function() { README = xhr.responseText; };

if (typeof(Object.values) === "undefined") {
    Object.values = function(obj) {
        var values = [];
        for (var key in obj) values.push(obj[key]);
        return values;
    };
}

// Rendering function
function render(title) {
    if (title.nodeType) title = title.textContent;

    var re = new RegExp("### "+title+"([^\t]+?)```html([^\t]+?)```[^`]+```javascript([^`]+)", "m");
    var match = re.exec(README), description = match[1].trim(), html = match[2].trim(), javascript = match[3].trim();

    // Set explanation
    document.querySelector("aside").textContent = description;

    // Set template (via outerHTML so that we not re-bind the same element)
    document.querySelector("#render").outerHTML = "<pre id='render'>"+html+"</pre>";

    // Set other boxes
    document.querySelector("#html").textContent = html;
    document.querySelector("#javascript").textContent = javascript;

    // Run JS
    javascript = javascript.replace("document.body", "document.querySelector(\"#render\")");
    eval(javascript);

    // Set result
    document.querySelector("#result").textContent = document.querySelector("#render").innerHTML;

    // Pretty print!
    // TODO: Remove the `prettyprinted` class from the elements
    prettyPrint();
}
