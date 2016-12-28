/**
 * Created by Sulf on 22.12.2016.
 */

let ShapeBuilder = require('./ShapeBuilder.js');
const extend = require('./../../Extend/extend');
const Logic = require('../../Logic/Logic.js');
'use strict';

const _logic = Logic.getLogicInstance();

function RandomShapeBuilder() {

    ShapeBuilder.call(this);
    this.createShape = function () {
        return this.getCreatedShape(_logic.randomInteger(0,7));
    };
}

extend(ShapeBuilder, RandomShapeBuilder);
module.exports = RandomShapeBuilder;

