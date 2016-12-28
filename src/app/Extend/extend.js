/**
 * Created by Sulf on 21.12.2016.
 */

"use strict";

function extend(base, sub) {

    const origProto = sub.prototype;
    sub.prototype = Object.create(base.prototype);
    for (let key in origProto)  {
        sub.prototype[key] = origProto[key];
    }
    // The constructor property was set wrong, let's fix it
    Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
    });
}

module.exports = extend;
