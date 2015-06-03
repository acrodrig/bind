"use strict";

(function(exports) {

    var EVENTS = {
        "onblur": true,
        "onchange": true,
        "onclick": true,
        "onenter": true,
        "onfocus": true,
        "oninput": true,
        "onkeypress": true,
        "onkeydown": true,
        "onkeyup": true,
        "onleave": true,
        "onmousedown": true,
        "onmouseup": true
    };

    // Shamelessly copied from underscore
    function isBoolean(o) { return o === true || o === false; }
    function isObject(o) { return (!!o) && (o.constructor === Object); }

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
        var mapping = (mapper ? mapper(model, elem) : model);
        if (!mapping) return elem;
        if (elem.hasAttribute("reset")) reset(elem);
        return map(elem, mapping);
    }

    /**
     * Either resets the element to original state or if its the first time invoked, it saves the info for
     * later resetting
     *
     * @param {Element} elem DOM element
     */
    function reset(elem) {
        if (!elem.originalNode) {
            elem.originalNode = elem.cloneNode(true);
        }
        else {
            while (elem.firstChild) elem.removeChild(elem.firstChild);
            var cn = elem.originalNode.childNodes;
            for (var i = 0; i < cn.length; i++) elem.appendChild(cn[i].cloneNode(true));
        }

        return elem;
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

        for (var key in mapping) {
            var value = mapping[key], pos = Math.max(key.indexOf("@"), key.indexOf(":"));
            var elemKey = (pos == -1 ? key : key.substring(0, pos));
            var nodes = ((elemKey == "." || elemKey == "") ? [ elem ] : elem.querySelectorAll(elemKey));
            var len = nodes.length;
            if (len == 0) continue;

            // Make nodes a real array if it is not already
            if (!Array.isArray(nodes)) nodes = Array.prototype.slice.call(nodes, 0);

            // An attribute or a property
            if (pos != -1) {
                var subKey = key.substring(pos+1);
                // console.log(key.substring(pos)+" --> "+nodes);
                switch (key[pos]) {
                    case '@': for (var i = 0; i < len; i++) setAttribute(nodes[i], subKey, value); break;
                    case ':': for (var i = 0; i < len; i++) setProperty(nodes[i], subKey, value); break;
                    default: console.error("No case for '"+key[pos]+"'");
                }
            }

            // Descend on object hierarchy
            else if (isObject(value)) for (var i = 0; i < len; i++) map(nodes[i], value);

            // Iterate
            else if (Array.isArray(value)) {
                for (var i = 0; i < len; i++) {
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
                for (var i = 0; i < len; i++) setContent(nodes[i], value);
            }
        }

        return elem;
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
        if (!elem || typeof(value) == "undefined") return null;
        if (value instanceof Function) value = value();

        if (typeof(value) == "undefined") elem.innerHTML = "";
        else if (isBoolean(value)) { if (!value) elem.parentNode.removeChild(elem); }
        else if (isObject(value)) elem.innerHTML = value.toString();
        else if (Array.isArray(value)) elem.innerHTML = value.toString();
        else elem.innerHTML = value;

        return elem;
    }

    function setAttribute(elem, attr, value) {
        if (!elem || typeof(value) == "undefined") return null;
        if (value instanceof Function) {
            // Events
            if (!EVENTS[attr]) value = value();
            else {
                // console.log("Event: ", attr.substring(2), value);
                return elem.addEventListener(attr.substring(2), value)
            }
        }

        if (typeof(value) == "undefined") elem.removeAttribute(attr);
        else if (isBoolean(value)) { if (!value) elem.removeAttribute(attr); }
        else if (isObject(value)) elem.setAttribute(attr, value.toString());
        else if (Array.isArray(value)) elem.setAttribute(attr, value.toString());
        else elem.setAttribute(attr, value);

        return elem;
    }

    function setProperty(elem, prop, value) {
        if (!elem || typeof(value) == "undefined") return null;
        if (value instanceof Function) value = value();

        if (typeof(value) == "undefined") delete elem[prop];
        else if (isBoolean(value)) { if (!value) delete elem[prop]; }
        else if (isObject(value)) elem[prop] = value;
        else if (Array.isArray(value)) elem[prop] = value;
        else elem.prop = value;

        return elem;
    }

    /**
     * If in browser, take bind global name, otherwise (in server) set the module to the bind function
     */
    if (typeof(window) != "undefined") window.bind = bind;
    if (typeof(module) != "undefined") module.exports = bind;

})(typeof(exports) == "undefined" ? this["bind"] = { } : exports);
