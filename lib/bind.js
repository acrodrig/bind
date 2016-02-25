"use strict";

(function(exports) {

    var EVENTS = {
        "onblur": true,
        "onchange": true,
        "onclick": true,
        "ondblclick": true,
        "onenter": true,
        "onfocus": true,
        "oninput": true,
        "onkeypress": true,
        "onkeydown": true,
        "onkeyup": true,
        "onleave": true,
        "onmousedown": true,
        "onmouseup": true,
        "onmousemove": true,
        "onmouseleave": true
    };

    // Since we do not want to pollute the HTMLElement object, we store the clone in parallel arrays
    var CACHE = [];

    // Shamelessly copied from underscore
    function isDate(o) { return toString.call(o) === "[object Date]"; }
    function isNumber(o) { return toString.call(o) === "[object Number]"; }
    function isObject(o) { return (!!o) && (o.constructor === Object); }
    function isRegExp(o) { return toString.call(o) === "[object RegExp]"; }
    function isString(o) { return toString.call(o) === "[object String]"; }

    // DOM Helpers
    function content(node) {
        var df = node.ownerDocument.createDocumentFragment();
        while (node.firstChild) df.appendChild(node.firstChild);
        return df;
    }

    function empty(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

    /**
     * Binds an element based on CSS selector data. The approach is inspired by
     * See http://zealdev.wordpress.com/2008/02/22/mootools-template-engine-a-new-approach/
     *
     * Given a DOM sub-tree, it binds (replaces) parts of it with data.
     *
     * @param {Element} elem DOM element
     * @param {Object|Array} model a JavaScript simple Object or Array
     * @param {Function} [mapper] a function that receives model and returns map with CSS selectors as keys and strings as values
     *
     * @return {Element} a DOM element where the elements matching the CSS selectors have been replaced with the values
     */
    function bind(elem, model, mapper) {
        if (!elem || !elem.nodeType) throw "bind.js: No DOM element was passed to 'bind'!";
        var mapping = (mapper ? mapper(model, elem) : model);
        if (!mapping) return elem;

        // Cache
        var cache = clone(elem, model, mapper);
        if (cache.count > 0) {
            empty(elem).appendChild(content(cache.clone.cloneNode(true)));
        }

        return map(elem, mapping);
    }

    /**
     * This two variables serve to HIDE/SHOW content in the templates
     */
    bind.NO = "bind.NO";
    bind.YES = "bind.YES";
    bind.YN = function(arg) { return arg ? bind.YES : bind.NO };

    /**
     * Clones the element. It returns the object that goes into the CACHE array.
     *
     * @param {Element} elem DOM element
     * @param {Object|Array} model a JavaScript simple Object or Array
     * @param {Function} [mapper] a function that receives model and returns map with CSS selectors as keys and strings as values
     */
    function clone(elem, model, mapper) {
        var pos = -1, cache;
        for (var i = 0; i < CACHE.length; i++) {
            if (CACHE[i].elem == elem) {
                if (CACHE[i].model != model && mapper) {
                    throw "bind.js: Element is already bound to a different model";
                }
                pos = i;
                break;
            }
        }
        if (pos == -1) {
            cache = { elem: elem, clone: elem.cloneNode(true), count: 0 };
            CACHE.push(cache);

            // The first time around, if there is a mapper, start watching elem and
            // re-calculate representation in this case
            if (mapper && elem.addEventListener) {
                elem.addEventListener("change", function(ev) {

                    // Walk up the DOM tree trying to find a model, and then check names
                    var node = ev.target, name = node.getAttribute("name");
                    while (node.parentNode != document.body) {
                        if (node.model && (name in node.model)) {
                            node.model[name] = value(ev.target);
                            // console.log("JUST DID TO RE-MODEL, MODEL: "+JSON.stringify(cache.model));
                            break;
                        }
                        node = node.parentNode;
                    }

                    cache.modelRep = JSON.stringify(model);
                });
            }
        }
        else {
            cache = CACHE[pos];
            cache.count += 1;
        }

        // Update objects and representation one way or the other
        cache.model = model;
        cache.mapper = mapper;

        return cache;
    }

    /**
     *
     * Given an element and a mapping of CSS selectors to values, it replaces the matching elements/attributes with
     * the values.
     *
     * @param {Element} elem
     * @param {Object} mapping a map with keys being extended CSS selectors and string values
     *
     * @return {Element} a DOM element where the elements matching the CSS selectors have been replaced with the values
     */
    function map(elem, mapping) {
        if (!isObject(mapping)) return setContent(elem, mapping);

        var i;
        for (var key in mapping) {
            var value = mapping[key], pos = Math.max(key.indexOf("@"), key.indexOf("&"));
            var elemKey = (pos == -1 ? key : key.substring(0, pos));
            var nodes = ((elemKey == "." || elemKey == "") ? [ elem ] : elem.querySelectorAll(elemKey));
            var len = nodes.length;
            if (len == 0) continue;

            // Make nodes a real array if it is not already
            if (!Array.isArray(nodes)) nodes = Array.prototype.slice.call(nodes, 0);

            // An attribute or a property
            if (pos != -1) {
                var subKey = key.substring(pos+1);
                switch (key[pos]) {
                    case '@': for (i = 0; i < len; i++) setAttribute(nodes[i], subKey, value); break;
                    case '&': for (i = 0; i < len; i++) setProperty(nodes[i], subKey, value); break;
                    default: console.error("No case for '"+key[pos]+"'");
                }
            }

            // Descend on object hierarchy
            else if (isObject(value)) for (i = 0; i < len; i++) map(nodes[i], value);

            // Iterate
            else if (Array.isArray(value)) {
                for (i = 0; i < len; i++) {
                    var n = nodes[i];
                    for (var j = 0; j < value.length; j++) {
                        var clone = n.parentNode.insertBefore(n.cloneNode(true), n);
                        map(clone, value[j]);
                    }
                    n.parentNode.removeChild(n);
                }
            }

            // Fix value into the view
            else {
                for (i = 0; i < len; i++) setContent(nodes[i], value);
            }
        }

        return elem;
    }

    /**
     * Capture the value of a form element
     *
     * @return {Object} the form element value, or null if it is not part of a form
     */
    function value(elem) {
        if (!("value" in elem)) return null;
        var type = elem.type;
        if (elem.constructor == HTMLSelectElement) type = "select";
        if (elem.constructor == HTMLTextAreaElement) type = "textarea";
        switch (type) {
            case "checkbox": return elem.checked;
            default: return elem.value;
        }
    }

    /**
     * Set the value of a key in an element
     *
     * @param {Element} elem a DOM element
     * @param {Object|String|Function} value a value to replace. If it is a string, it is replaced verbatim, if it is a
     * function then the function is executed first and the return value used as the value. If it is anything else, the
     * `toString` function is called on it.
     *
     * @return {Element} the element again
     */
    function setContent(elem, value) {
        if (!elem || value === undefined) return null;
        if (value instanceof Function) value = value();

        if (value == bind.YES) return elem;
        else if (value === bind.NO) return elem.parentNode.removeChild(elem);
        else if (isObject(value)) elem.innerHTML = value.toString();
        else if (Array.isArray(value)) elem.innerHTML = value.toString();
        else elem.innerHTML = value;

        return elem;
    }

    function setAttribute(elem, attr, value) {
        if (!elem || value === undefined) return null;
        if (EVENTS[attr]) return elem.addEventListener(attr.substring(2), value);
        if (value instanceof Function) value = value();

        if (value == bind.YES) return elem;
        else if (value == bind.NO) elem.removeAttribute(attr);
        else if (isObject(value)) elem.setAttribute(attr, value.toString());
        else if (Array.isArray(value)) elem.setAttribute(attr, value.toString());
        else elem.setAttribute(attr, value);

        return elem;
    }

    function setProperty(elem, prop, value) {
        if (!elem || value === undefined) return null;
        if (value instanceof Function) value = value();

        if (value == bind.YES) return elem;
        else if (value == bind.NO) delete elem[prop];
        else if (isObject(value)) elem[prop] = value;
        else if (Array.isArray(value)) elem[prop] = value;
        else elem[prop] = value;

        return elem;
    }

    /**
     * Detect changes through dirty checking
     */
    function digest() {
        // var start = (new Date()).getTime();
        for (var i = 0; i < CACHE.length; i++) {
            var cache = CACHE[i];
            // If the models are different, then we should re-bind
            if (cache.modelRep != JSON.stringify(cache.model)) {
                // console.log("ABOUT TO RE-RENDER, MODEL: "+JSON.stringify(cache.model));
                bind(cache.elem, cache.model, cache.mapper);
            }
        }
    }

    // Make available from outside
    bind.digest = digest;
    // if (typeof(window) != "undefined") window.setInterval(digest, 200);

    /**
     * If in browser, take bind global name, otherwise (in server) set the module to the bind function
     */
    if (typeof(window) != "undefined") window.bind = bind;
    if (typeof(module) != "undefined") module.exports = bind;

})(typeof(exports) == "undefined" ? this["bind"] = { } : exports);
