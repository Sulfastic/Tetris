/**
 * Created by Sulf on 22.12.2016.
 */

const ConcreteShapeBuilder = require('./Builder/ConcreteShapeBuilder.js');
const RandomShapeBuilder = require('./Builder/RandomShapeBuilder.js');
'use strict';

function ShapeDirector() {

    this.buildShape = function (which) {
        let builder;
        if(which != null || which != undefined) {
            builder = new ConcreteShapeBuilder(which);
        } else {
            builder = new RandomShapeBuilder();
        }

        return builder.createShape(which);
    }
}

module.exports = ShapeDirector;
