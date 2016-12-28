/**
 * Created by Sulf on 22.12.2016.
 */

"use strict";

let _gameTable = [];

const _createGameTable = function (width, height) {

    for(let i=0; i<height; i++) {
        _gameTable[i] = [];
        for(let j=0; j<width; j++) {
            _gameTable[i][j] = 0;
        }
    }

    return _gameTable;
};

function GameBoard(width, height) {

    return _createGameTable(width, height);
}

module.exports = GameBoard;
