/**
 * Created by Sulf on 22.12.2016.
 */

const Shape = require('./../Shape.js');
const _logic = require('../../Logic/Logic.js').getLogicInstance();
const _shapeHolder = require('./../Data/ShapeHolder.js');
"use strict";

function ShapeBuilder() {

    this.getCreatedShape = function(what) {
        const shape = new Shape();
        shape.shapeArray =_shapeHolder.loadShape(what);
        return shape;
    };
}

module.exports = ShapeBuilder;
