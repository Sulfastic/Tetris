/**
 * Created by Sulf on 22.12.2016.
 */

const ShapeBuilder = require('./ShapeBuilder.js');
const extend = require('./../../Extend/extend');
'use strict';

function ConcreteShapeBuilder() {

    ShapeBuilder.call(this);
    this.createShape = function (which) {
        return this.getCreatedShape(which);
    };
}

extend(ShapeBuilder, ConcreteShapeBuilder);
module.exports = ConcreteShapeBuilder;
