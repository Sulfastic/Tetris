/**
 * Created by Sulf on 21.12.2016.
 */

'use strict';

let _logic = null;
let _scored = false;

function Logic() {

    this.rotate = function(array) {
        let temp = [];
        temp.length = array.length;
        for(let i = 0; i < temp.length; i++){
            temp[i] = [];
            temp[i].length = temp.length;
            for (let j = 0; j < temp.length; j++){
                temp[i][j] = array[temp.length - j - 1][i];
            }
        }
        return temp;
    };

    this.randomInteger = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min)) + min;
    };

    this.merge = function(shape, board) {
        shape.shapeArray.forEach(function (row, y) {
            row.forEach(function (value, x) {
                if(value !== 0) {
                    board[y + shape.position.y][x + shape.position.x] = value;
                }
            })
        })
    };

    this.collide = function (shape, board) {
        const sArray = shape.shapeArray;
        const sPosition = shape.position;

        for(let i = 0; i < sArray.length; i++) {
            for(let j = 0; j < sArray[i].length; j++) {
                if(sArray[i][j] !== 0 &&
                    (board[i + sPosition.y] &&
                     board[i + sPosition.y][j + sPosition.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    this.clearRow = function(board) {
        outerArr: for (let i = board.length - 1; i > 0; i--) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === 0) {
                    continue outerArr;
                }
            }

            const row = board.splice(i, 1)[0].fill(0);
            board.unshift(row);
            i++;

            _scored = true;
        }
        return _scored;
    };

    this.calculateScore = function (score) {
        if(_scored) {
            score += 10;
            _scored = false;
        }

        return score;
    }
}

module.exports = {

    getLogicInstance: function () {
        if(_logic) {
            return _logic;
        } else {
            _logic = new Logic();
            return _logic;
        }
    }
};
