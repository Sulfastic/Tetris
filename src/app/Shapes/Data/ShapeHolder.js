/**
 * Created by Sulf on 22.12.2016.
 */

"use strict";

const _shape = [
    [[1,1,],
     [1,1,]],

    [[0,2,0,],
     [0,2,0,],
     [0,2,2,]],

    [[0,3,0,],
     [0,3,0,],
     [3,3,0,]],

    [[0,0,0,],
     [4,4,4,],
     [0,4,0,]],

    [[5,0,0,0,],
     [5,0,0,0,],
     [5,0,0,0,],
     [5,0,0,0,]],

    [[0,0,0,],
     [6,6,0,],
     [0,6,6,]],

    [[0,0,0,],
     [0,7,7,],
     [7,7,0,]]
];

module.exports = {
    loadShape: function(which) {
        if(which > -1 && which < _shape.length) {
            return _shape[which];
        }
    }
};
