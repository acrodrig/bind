"use strict";

(function(exports) {

    // Shamelessly copied from underscore
    function isObject(o) { return toString.call(o) == "[object Object]"; }
    function isString(o) { return toString.call(o) == "[object String]"; }

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
        return map(elem, mapping);
    }

    /**
     * Either resets the element to original state or if its the first time invoked, it saves the info for
     * later resetting
     *
     * @param {Element} elem DOM element
     */
    /*
    function init(elem) {
        if (elem.originalChildren) {
            while (elem.firstChild) elem.removeChild(elem.firstChild);
            elem.appendChild(elem.originalChildren.cloneNode(true));
        }
        else {
            var nl = elem.childNodes;
            var df = elem.ownerDocument.createDocumentFragment();
            for (var i = 0; i < nl.length; i++) df.appendChild(nl[i].cloneNode(true));
            elem.originalChildren = df;
        }
    }
    */

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
        if (!isObject(mapping)) return set(elem, null, mapping);

        for (var key in mapping) {
            var value = mapping[key], pos = key.indexOf("@");
            var ek = (pos == -1 ? key : key.substring(0,pos));
            var ak = (pos != -1 ? key.substring(pos+1) : null);
            var nodes = ((ek == "." || ek == "") ? [ elem ] : elem.querySelectorAll(ek));
            if (nodes.length == 0) continue;

            // If we are at the attribute level, set right away
            if (ak) set(nodes[0], ak, value);

            // Descend on object hierarchy
            else if (isObject(value)) map(nodes[0], value);

            // Iterate
            else if (Array.isArray(value)) {
                var node = nodes[0];
                for (var i = 0; i < value.length; i++) {
                    var clone = node.parentNode.insertBefore(node.cloneNode(true), node);
                    map(clone, value[i]);
                }
                node.parentNode.removeChild(node);
            }

            // Fix value into the view
            else set(nodes[0], ak, value);
        }

        return elem;
    }

    /**
     * Set the value of a key in an element
     *
     * @param {Element} elem a DOM element
     * @param {String} key an extended CSS selector
     * @param {Object|String|Function} value a value to replace. If it is a string, it is replaced verbatim, if it is a
     * function then the function is executed first and the return value used as the value. If it is anything else, the
     * `toString` function is called on it.
     *
     * @return {Element} the element again
     */
    function set(elem, attr, value) {
        if (!elem) return null;
        if (value instanceof Function) value = value();

        // Do we have an attribute selector?
        if (attr) {
            if (!value) elem.removeAttribute(attr);
            else if (isObject(value)) elem[attr] = value;
            else elem.setAttribute(attr, value);
        }
        else {
            if (value) {
                if (value !== true) elem.innerHTML = value;
            }
            else elem.parentNode.removeChild(elem);
        }

        return elem;
    }

    /**
     * If in browser, take bind global name, otherwise (in server) set the module to the bind function
     */
    if (typeof(window) != "undefined") window.bind = bind;
    if (typeof(module) != "undefined") module.exports = bind;

})(typeof(exports) == "undefined" ? this["bind"] = { } : exports);
