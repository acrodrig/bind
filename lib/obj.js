"use strict";

/**
 * The algorithms in this page are experimental for now. The idea would be to use deep equality/cloning
 * instead of JSON stringify/parse for dirty checking. Not yet ready for prime time, yet I put here to
 * start generating tests and demos.
 */

(function(exports) {

    /**
     * Deep Equal implementation
     */
    exports.equal = function(o1, o2) {
        var len, i;
        if (o1 === o2) return true;

        // Simple cases
        if (isDate(o1) && isDate(o2)) return o1.getTime() === o2.getTime();
        if (isNumber(o1) && isNumber(o2)) return o1 == o2;
        if (isRegExp(o1) && isRegExp(o2)) return ""+o1 == ""+o2;
        if (isString(o1) && isString(o2)) return o1 == o2;

        // Arrays
        if (Array.isArray(o1) && Array.isArray(o2)) {
            if (o1.length != o2.length) return false;
            len = o1.length;
            for (i = 0; i < len; i++) {
                if (!equal(o1[i], o2[i])) return false;
            }
            return true;
        }

        // Objects
        if (isObject(o1) && isObject(o2)) {
            var k1 = Object.keys(o1).sort(), k2 = Object.keys(o2).sort();
            if (k1.length != k2.length) return false;
            len = k1.length;
            for (i = 0; i < len; i++) {
                if (!equal(o1[k1[i]], o2[k2[i]])) return false;
            }
            return true;
        }

        return o1 == o2;
    };

    /**
     * Deep Clone implementation
     */
    exports.clone = function(o) {
        var len, i;
        // Simple cases
        if (isDate(o)) return new Date(o);
        if (isNumber(o)) return o;
        if (isRegExp(o)) return new RegExp(""+o);
        if (isString(o)) return o;

        // Arrays
        if (Array.isArray(o)) {
            var ca = o.slice(0);
            len = o.length;
            for (i = 0; i < len; i++) ca[i] = clone(o[i]);
            return ca;
        }

        // Objects
        if (isObject(o)) {
            var co = {};
            var k = Object.keys(o);
            len = k.length;
            for (i = 0; i < len; i++) {
                co[k[i]] = clone(o[k[i]]);
            }
            return co;
        }
        return o;
    };

})(typeof(exports) == "undefined" ? this["bind"] = { } : exports);
