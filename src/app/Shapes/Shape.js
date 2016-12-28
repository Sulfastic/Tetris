/**
 * Created by Sulf on 21.12.2016.
 */

const ShapeHelper = require('./Data/ShapeHelper.js');
const _logic = require('../Logic/Logic.js').getLogicInstance();
"use strict";

function Shape() {
    this.position = new ShapeHelper(5,0);
    this.shapeArray = [];
    this.rotate = function() {
        this.shapeArray = _logic.rotate(this.shapeArray);
    };
}

module.exports = Shape;