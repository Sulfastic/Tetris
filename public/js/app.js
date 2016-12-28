(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by Sulf on 21.12.2016.
 */

"use strict";

function extend(base, sub) {

    const origProto = sub.prototype;
    sub.prototype = Object.create(base.prototype);
    for (let key in origProto) {
        sub.prototype[key] = origProto[key];
    }
    // The constructor property was set wrong, let's fix it
    Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
    });
}

module.exports = extend;

},{}],2:[function(require,module,exports){
/**
 * Created by Sulf on 21.12.2016.
 */

const settings = require('./Settings.js');
const ShapeDirector = require('./Shapes/ShapeDirector.js');
const GameBoard = require('./GameBoard/GameBoard.js');
const logic = require('./Logic/Logic.js').getLogicInstance();
const colors = require('./Shapes/Data/ColorHolder.js');
"use strict";

const mainCanvas = document.getElementById('tetris');
const nextCanvas = document.getElementById('next');
let scoreTag = document.getElementById('score');
const mainContext = mainCanvas.getContext('2d');
const nextContext = nextCanvas.getContext('2d');
mainContext.scale(20, 20);
nextContext.scale(4, 4);

const tetrisTheme = new Audio('./assets/tetris_song.mp3');
const dropSound = new Audio('./assets/drop_sound.mp3');
const booSound = new Audio('./assets/boo.mp3');
const clearSound = new Audio('./assets/clear.mp3');

const shapeDirector = new ShapeDirector();
let shape = shapeDirector.buildShape();
let newShape = shapeDirector.buildShape();
let score = 0;
const gameBoard = new GameBoard(settings.width, settings.height);

document.addEventListener('keydown', function (event) {
    if (event.keyCode === 37) {
        //move left
        move(-1);
    } else if (event.keyCode === 39) {
        //move right
        move(1);
    } else if (event.keyCode === 40) {
        //move down
        drop();
    } else if (event.keyCode === 38) {
        //rotate
        rotate();
    }
});

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

function move(direction) {
    shape.position.x += direction;
    if (logic.collide(shape, gameBoard)) {
        shape.position.x -= direction;
    }
}

function drop() {
    shape.position.y++;
    if (logic.collide(shape, gameBoard)) {
        shape.position.y--;
        logic.merge(shape, gameBoard);
        shape = newShape;
        newShape = shapeDirector.buildShape();
        if (logic.collide(shape, gameBoard)) {
            booSound.play();
            gameBoard.forEach(function (row) {
                row.fill(0);
            });
            score = 0;
        }

        logic.clearRow(gameBoard) ? clearSound.play() : dropSound.play();
    }

    dropCounter = 0;
}

function rotate() {
    shape.rotate();
}

function draw() {
    mainContext.fillStyle = '#000';
    mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    drawArray(gameBoard, { x: 0, y: 0 });
    drawArray(shape.shapeArray, shape.position);
    drawNext();
}

function drawArray(array, offset) {
    array.forEach(function (row, y) {
        row.forEach(function (value, x) {
            if (value !== 0) {
                mainContext.fillStyle = colors.getColor(value - 1);
                mainContext.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawNext() {
    newShape.shapeArray.forEach(function (row, y) {
        row.forEach(function (value, x) {
            if (value !== 0) {
                nextContext.fillStyle = colors.getColor(value - 1);
                nextContext.fillRect(x + 1, y + 1, 1, 1);
            }
        });
    });
}

function update(time = 0) {
    const deltaTime = time - lastTime;

    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        drop();
    }
    draw();
    updateScore();
    requestAnimationFrame(update);
}

function updateScore() {
    score = logic.calculateScore(score);
    scoreTag.innerHTML = "Your current score is: " + score;
}

tetrisTheme.addEventListener("ended", function () {
    tetrisTheme.currentTime = 0;
    tetrisTheme.play();
});
tetrisTheme.play();

update();

},{"./GameBoard/GameBoard.js":3,"./Logic/Logic.js":4,"./Settings.js":5,"./Shapes/Data/ColorHolder.js":9,"./Shapes/ShapeDirector.js":13}],3:[function(require,module,exports){
/**
 * Created by Sulf on 22.12.2016.
 */

"use strict";

let _gameTable = [];

const _createGameTable = function (width, height) {

    for (let i = 0; i < height; i++) {
        _gameTable[i] = [];
        for (let j = 0; j < width; j++) {
            _gameTable[i][j] = 0;
        }
    }

    return _gameTable;
};

function GameBoard(width, height) {

    return _createGameTable(width, height);
}

module.exports = GameBoard;

},{}],4:[function(require,module,exports){
/**
 * Created by Sulf on 21.12.2016.
 */

'use strict';

let _logic = null;
let _scored = false;

function Logic() {

    this.rotate = function (array) {
        let temp = [];
        temp.length = array.length;
        for (let i = 0; i < temp.length; i++) {
            temp[i] = [];
            temp[i].length = temp.length;
            for (let j = 0; j < temp.length; j++) {
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

    this.merge = function (shape, board) {
        shape.shapeArray.forEach(function (row, y) {
            row.forEach(function (value, x) {
                if (value !== 0) {
                    board[y + shape.position.y][x + shape.position.x] = value;
                }
            });
        });
    };

    this.collide = function (shape, board) {
        const sArray = shape.shapeArray;
        const sPosition = shape.position;

        for (let i = 0; i < sArray.length; i++) {
            for (let j = 0; j < sArray[i].length; j++) {
                if (sArray[i][j] !== 0 && (board[i + sPosition.y] && board[i + sPosition.y][j + sPosition.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    this.clearRow = function (board) {
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
        if (_scored) {
            score += 10;
            _scored = false;
        }

        return score;
    };
}

module.exports = {

    getLogicInstance: function () {
        if (_logic) {
            return _logic;
        } else {
            _logic = new Logic();
            return _logic;
        }
    }
};

},{}],5:[function(require,module,exports){
/**
 * Created by Sulf on 21.12.2016.
 */

"use strict";

module.exports = {
  height: 20,
  width: 12
};

},{}],6:[function(require,module,exports){
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

},{"./../../Extend/extend":1,"./ShapeBuilder.js":8}],7:[function(require,module,exports){
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
        return this.getCreatedShape(_logic.randomInteger(0, 7));
    };
}

extend(ShapeBuilder, RandomShapeBuilder);
module.exports = RandomShapeBuilder;

},{"../../Logic/Logic.js":4,"./../../Extend/extend":1,"./ShapeBuilder.js":8}],8:[function(require,module,exports){
/**
 * Created by Sulf on 22.12.2016.
 */

const Shape = require('./../Shape.js');
const _logic = require('../../Logic/Logic.js').getLogicInstance();
const _shapeHolder = require('./../Data/ShapeHolder.js');
"use strict";

function ShapeBuilder() {

    this.getCreatedShape = function (what) {
        const shape = new Shape();
        shape.shapeArray = _shapeHolder.loadShape(what);
        return shape;
    };
}

module.exports = ShapeBuilder;

},{"../../Logic/Logic.js":4,"./../Data/ShapeHolder.js":11,"./../Shape.js":12}],9:[function(require,module,exports){
/**
 * Created by Sulf on 12/28/2016.
 */
const _colors = ['#FFE5A0', '#FFA77B', '#9CAFFB', '#CB88FC', '#87D3D5', '#F8869A', '#9CE0C7'];

module.exports = {
    getColor: function (which) {
        if (which > -1 && which < _colors.length) {
            return _colors[which];
        }
    }
};

},{}],10:[function(require,module,exports){
/**
 * Created by Sulf on 12/28/2016.
 */

function ShapeHelper(x, y) {
  this.x = x;
  this.y = y;
}

module.exports = ShapeHelper;

},{}],11:[function(require,module,exports){
/**
 * Created by Sulf on 22.12.2016.
 */

"use strict";

const _shape = [[[1, 1], [1, 1]], [[0, 2, 0], [0, 2, 0], [0, 2, 2]], [[0, 3, 0], [0, 3, 0], [3, 3, 0]], [[0, 0, 0], [4, 4, 4], [0, 4, 0]], [[5, 0, 0, 0], [5, 0, 0, 0], [5, 0, 0, 0], [5, 0, 0, 0]], [[0, 0, 0], [6, 6, 0], [0, 6, 6]], [[0, 0, 0], [0, 7, 7], [7, 7, 0]]];

module.exports = {
    loadShape: function (which) {
        if (which > -1 && which < _shape.length) {
            return _shape[which];
        }
    }
};

},{}],12:[function(require,module,exports){
/**
 * Created by Sulf on 21.12.2016.
 */

const ShapeHelper = require('./Data/ShapeHelper.js');
const _logic = require('../Logic/Logic.js').getLogicInstance();
"use strict";

function Shape() {
    this.position = new ShapeHelper(5, 0);
    this.shapeArray = [];
    this.rotate = function () {
        this.shapeArray = _logic.rotate(this.shapeArray);
    };
}

module.exports = Shape;

},{"../Logic/Logic.js":4,"./Data/ShapeHelper.js":10}],13:[function(require,module,exports){
/**
 * Created by Sulf on 22.12.2016.
 */

const ConcreteShapeBuilder = require('./Builder/ConcreteShapeBuilder.js');
const RandomShapeBuilder = require('./Builder/RandomShapeBuilder.js');
'use strict';

function ShapeDirector() {

    this.buildShape = function (which) {
        let builder;
        if (which != null || which != undefined) {
            builder = new ConcreteShapeBuilder(which);
        } else {
            builder = new RandomShapeBuilder();
        }

        return builder.createShape(which);
    };
}

module.exports = ShapeDirector;

},{"./Builder/ConcreteShapeBuilder.js":6,"./Builder/RandomShapeBuilder.js":7}],14:[function(require,module,exports){
require('./app/Game.js');

},{"./app/Game.js":2}]},{},[14])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGFwcFxcRXh0ZW5kXFxleHRlbmQuanMiLCJzcmNcXGFwcFxcR2FtZS5qcyIsInNyY1xcYXBwXFxHYW1lQm9hcmRcXEdhbWVCb2FyZC5qcyIsInNyY1xcYXBwXFxMb2dpY1xcTG9naWMuanMiLCJzcmNcXGFwcFxcU2V0dGluZ3MuanMiLCJzcmNcXGFwcFxcU2hhcGVzXFxCdWlsZGVyXFxDb25jcmV0ZVNoYXBlQnVpbGRlci5qcyIsInNyY1xcYXBwXFxTaGFwZXNcXEJ1aWxkZXJcXFJhbmRvbVNoYXBlQnVpbGRlci5qcyIsInNyY1xcYXBwXFxTaGFwZXNcXEJ1aWxkZXJcXFNoYXBlQnVpbGRlci5qcyIsInNyY1xcYXBwXFxTaGFwZXNcXERhdGFcXENvbG9ySG9sZGVyLmpzIiwic3JjXFxhcHBcXFNoYXBlc1xcRGF0YVxcU2hhcGVIZWxwZXIuanMiLCJzcmNcXGFwcFxcU2hhcGVzXFxEYXRhXFxTaGFwZUhvbGRlci5qcyIsInNyY1xcYXBwXFxTaGFwZXNcXFNoYXBlLmpzIiwic3JjXFxhcHBcXFNoYXBlc1xcU2hhcGVEaXJlY3Rvci5qcyIsInNyY1xcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUlBOztBQUVBLFNBQVMsTUFBVCxDQUFnQixJQUFoQixFQUFzQixHQUF0QixFQUEyQjs7QUFFdkIsVUFBTSxZQUFZLElBQUksU0FBdEI7QUFDQSxRQUFJLFNBQUosR0FBZ0IsT0FBTyxNQUFQLENBQWMsS0FBSyxTQUFuQixDQUFoQjtBQUNBLFNBQUssSUFBSSxHQUFULElBQWdCLFNBQWhCLEVBQTRCO0FBQ3hCLFlBQUksU0FBSixDQUFjLEdBQWQsSUFBcUIsVUFBVSxHQUFWLENBQXJCO0FBQ0g7QUFDRDtBQUNBLFdBQU8sY0FBUCxDQUFzQixJQUFJLFNBQTFCLEVBQXFDLGFBQXJDLEVBQW9EO0FBQ2hE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QUNwQyxzQkFBVSxJQUFJLG9CQUFKLENBQXlCLEtBQXpCLENBQVY7QUFDSCxTQUZELE1BRU87QUFDSCxzQkFBVSxJQUFJLGtCQUFKLEVBQVY7QUFDSDs7QUFFRCxlQUFPLFFBQVEsV0FBUixDQUFvQixLQUFwQixDQUFQO0FBQ0gsS0FURDtBQVVIOztBQUVELE9BQU8sT0FBUCxHQUFpQixhQUFqQjs7O0FDdEJBLFFBQVEsZUFBUiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ3JlYXRlZCBieSBTdWxmIG9uIDIxLjEyLjIwMTYuXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBleHRlbmQoYmFzZSwgc3ViKSB7XHJcblxyXG4gICAgY29uc3Qgb3JpZ1Byb3RvID0gc3ViLnByb3RvdHlwZTtcclxuICAgIHN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGJhc2UucHJvdG90eXBlKTtcclxuICAgIGZvciAobGV0IGtleSBpbiBvcmlnUHJvdG8pICB7XHJcbiAgICAgICAgc3ViLnByb3RvdHlwZVtrZXldID0gb3JpZ1Byb3RvW2tleV07XHJcbiAgICB9XHJcbiAgICAvLyBUaGUgY29uc3RydWN0b3IgcHJvcGVydHkgd2FzIHNldCB3cm9uZywgbGV0J3MgZml4IGl0XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc3ViLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywge1xyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIHZhbHVlOiBzdWJcclxuICAgIH0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuZDtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU3VsZiBvbiAyMS4xMi4yMDE2LlxyXG4gKi9cclxuXHJcbmNvbnN0IHNldHRpbmdzID0gcmVxdWlyZSgnLi9TZXR0aW5ncy5qcycpO1xyXG5jb25zdCBTaGFwZURpcmVjdG9yID0gcmVxdWlyZSgnLi9TaGFwZXMvU2hhcGVEaXJlY3Rvci5qcycpO1xyXG5jb25zdCBHYW1lQm9hcmQgPSByZXF1aXJlKCcuL0dhbWVCb2FyZC9HYW1lQm9hcmQuanMnKTtcclxuY29uc3QgbG9naWMgPSByZXF1aXJlKCcuL0xvZ2ljL0xvZ2ljLmpzJykuZ2V0TG9naWNJbnN0YW5jZSgpO1xyXG5jb25zdCBjb2xvcnMgPSByZXF1aXJlKCcuL1NoYXBlcy9EYXRhL0NvbG9ySG9sZGVyLmpzJyk7XHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgbWFpbkNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXRyaXMnKTtcclxuY29uc3QgbmV4dENhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXh0Jyk7XHJcbmxldCBzY29yZVRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpO1xyXG5jb25zdCBtYWluQ29udGV4dCA9IG1haW5DYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuY29uc3QgbmV4dENvbnRleHQgPSBuZXh0Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbm1haW5Db250ZXh0LnNjYWxlKDIwLDIwKTtcclxubmV4dENvbnRleHQuc2NhbGUoNCw0KTtcclxuXHJcbmNvbnN0IHRldHJpc1RoZW1lID0gbmV3IEF1ZGlvKCcuL2Fzc2V0cy90ZXRyaXNfc29uZy5tcDMnKTtcclxuY29uc3QgZHJvcFNvdW5kID0gbmV3IEF1ZGlvKCcuL2Fzc2V0cy9kcm9wX3NvdW5kLm1wMycpO1xyXG5jb25zdCBib29Tb3VuZCA9IG5ldyBBdWRpbygnLi9hc3NldHMvYm9vLm1wMycpO1xyXG5jb25zdCBjbGVhclNvdW5kID0gbmV3IEF1ZGlvKCcuL2Fzc2V0cy9jbGVhci5tcDMnKTtcclxuXHJcbmNvbnN0IHNoYXBlRGlyZWN0b3IgPSBuZXcgU2hhcGVEaXJlY3RvcigpO1xyXG5sZXQgc2hhcGUgPSBzaGFwZURpcmVjdG9yLmJ1aWxkU2hhcGUoKTtcclxubGV0IG5ld1NoYXBlID0gc2hhcGVEaXJlY3Rvci5idWlsZFNoYXBlKCk7XHJcbmxldCBzY29yZSA9IDA7XHJcbmNvbnN0IGdhbWVCb2FyZCA9IG5ldyBHYW1lQm9hcmQoc2V0dGluZ3Mud2lkdGgsIHNldHRpbmdzLmhlaWdodCk7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZihldmVudC5rZXlDb2RlID09PSAzNykgeyAvL21vdmUgbGVmdFxyXG4gICAgICAgIG1vdmUoLTEpO1xyXG4gICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkgeyAvL21vdmUgcmlnaHRcclxuICAgICAgICBtb3ZlKDEpO1xyXG4gICAgfSBlbHNlIGlmKGV2ZW50LmtleUNvZGUgPT09IDQwKSB7IC8vbW92ZSBkb3duXHJcbiAgICAgICAgZHJvcCgpO1xyXG4gICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOCkgeyAvL3JvdGF0ZVxyXG4gICAgICAgIHJvdGF0ZSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbmxldCBsYXN0VGltZSA9IDA7XHJcbmxldCBkcm9wQ291bnRlciA9IDA7XHJcbmxldCBkcm9wSW50ZXJ2YWwgPSAxMDAwO1xyXG5cclxuZnVuY3Rpb24gbW92ZShkaXJlY3Rpb24pIHtcclxuICAgIHNoYXBlLnBvc2l0aW9uLnggKz0gZGlyZWN0aW9uO1xyXG4gICAgaWYobG9naWMuY29sbGlkZShzaGFwZSwgZ2FtZUJvYXJkKSkge1xyXG4gICAgICAgIHNoYXBlLnBvc2l0aW9uLnggLT0gZGlyZWN0aW9uO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkcm9wKCkge1xyXG4gICAgc2hhcGUucG9zaXRpb24ueSsrO1xyXG4gICAgaWYobG9naWMuY29sbGlkZShzaGFwZSxnYW1lQm9hcmQpKSB7XHJcbiAgICAgICAgc2hhcGUucG9zaXRpb24ueS0tO1xyXG4gICAgICAgIGxvZ2ljLm1lcmdlKHNoYXBlLCBnYW1lQm9hcmQpO1xyXG4gICAgICAgIHNoYXBlID0gbmV3U2hhcGU7XHJcbiAgICAgICAgbmV3U2hhcGUgPSBzaGFwZURpcmVjdG9yLmJ1aWxkU2hhcGUoKTtcclxuICAgICAgICBpZihsb2dpYy5jb2xsaWRlKHNoYXBlLCBnYW1lQm9hcmQpKSB7XHJcbiAgICAgICAgICAgIGJvb1NvdW5kLnBsYXkoKTtcclxuICAgICAgICAgICAgZ2FtZUJvYXJkLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgICAgICAgICAgcm93LmZpbGwoMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzY29yZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2dpYy5jbGVhclJvdyhnYW1lQm9hcmQpID8gY2xlYXJTb3VuZC5wbGF5KCkgOiBkcm9wU291bmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyb3BDb3VudGVyID0gMDtcclxufVxyXG5cclxuZnVuY3Rpb24gcm90YXRlKCkge1xyXG4gICAgc2hhcGUucm90YXRlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBtYWluQ29udGV4dC5maWxsU3R5bGUgPSAnIzAwMCc7XHJcbiAgICBtYWluQ29udGV4dC5maWxsUmVjdCgwLCAwLCBtYWluQ2FudmFzLndpZHRoLCBtYWluQ2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgbmV4dENvbnRleHQuZmlsbFN0eWxlID0gJyMwMDAnO1xyXG4gICAgbmV4dENvbnRleHQuZmlsbFJlY3QoMCwgMCwgbmV4dENhbnZhcy53aWR0aCwgbmV4dENhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGRyYXdBcnJheShnYW1lQm9hcmQsIHt4OjAsIHk6MH0pO1xyXG4gICAgZHJhd0FycmF5KHNoYXBlLnNoYXBlQXJyYXksIHNoYXBlLnBvc2l0aW9uKTtcclxuICAgIGRyYXdOZXh0KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdBcnJheShhcnJheSwgb2Zmc2V0KSB7XHJcbiAgICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIHkpIHtcclxuICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIHgpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBtYWluQ29udGV4dC5maWxsU3R5bGUgPSBjb2xvcnMuZ2V0Q29sb3IodmFsdWUgLSAxKTtcclxuICAgICAgICAgICAgICAgIG1haW5Db250ZXh0LmZpbGxSZWN0KHggKyBvZmZzZXQueCwgeSArIG9mZnNldC55LCAxLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd05leHQoKSB7XHJcbiAgICBuZXdTaGFwZS5zaGFwZUFycmF5LmZvckVhY2goZnVuY3Rpb24gKHJvdywgeSkge1xyXG4gICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgeCkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIG5leHRDb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9ycy5nZXRDb2xvcih2YWx1ZSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgbmV4dENvbnRleHQuZmlsbFJlY3QoeCArIDEsIHkgKyAxLCAxLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUodGltZSA9IDApIHtcclxuICAgIGNvbnN0IGRlbHRhVGltZSA9IHRpbWUgLSBsYXN0VGltZTtcclxuXHJcbiAgICBsYXN0VGltZSA9IHRpbWU7XHJcbiAgICBkcm9wQ291bnRlciArPSBkZWx0YVRpbWU7XHJcbiAgICBpZihkcm9wQ291bnRlciA+IGRyb3BJbnRlcnZhbCkge1xyXG4gICAgICAgIGRyb3AoKTtcclxuICAgIH1cclxuICAgIGRyYXcoKTtcclxuICAgIHVwZGF0ZVNjb3JlKCk7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlU2NvcmUoKSB7XHJcbiAgICBzY29yZSA9IGxvZ2ljLmNhbGN1bGF0ZVNjb3JlKHNjb3JlKTtcclxuICAgIHNjb3JlVGFnLmlubmVySFRNTCA9IFwiWW91ciBjdXJyZW50IHNjb3JlIGlzOiBcIiArIHNjb3JlO1xyXG59XHJcblxyXG50ZXRyaXNUaGVtZS5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgIHRldHJpc1RoZW1lLmN1cnJlbnRUaW1lID0gMDtcclxuICAgIHRldHJpc1RoZW1lLnBsYXkoKTtcclxufSk7XHJcbnRldHJpc1RoZW1lLnBsYXkoKTtcclxuXHJcbnVwZGF0ZSgpO1xyXG5cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU3VsZiBvbiAyMi4xMi4yMDE2LlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxubGV0IF9nYW1lVGFibGUgPSBbXTtcclxuXHJcbmNvbnN0IF9jcmVhdGVHYW1lVGFibGUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xyXG5cclxuICAgIGZvcihsZXQgaT0wOyBpPGhlaWdodDsgaSsrKSB7XHJcbiAgICAgICAgX2dhbWVUYWJsZVtpXSA9IFtdO1xyXG4gICAgICAgIGZvcihsZXQgaj0wOyBqPHdpZHRoOyBqKyspIHtcclxuICAgICAgICAgICAgX2dhbWVUYWJsZVtpXVtqXSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBfZ2FtZVRhYmxlO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gR2FtZUJvYXJkKHdpZHRoLCBoZWlnaHQpIHtcclxuXHJcbiAgICByZXR1cm4gX2NyZWF0ZUdhbWVUYWJsZSh3aWR0aCwgaGVpZ2h0KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lQm9hcmQ7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFN1bGYgb24gMjEuMTIuMjAxNi5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5sZXQgX2xvZ2ljID0gbnVsbDtcclxubGV0IF9zY29yZWQgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIExvZ2ljKCkge1xyXG5cclxuICAgIHRoaXMucm90YXRlID0gZnVuY3Rpb24oYXJyYXkpIHtcclxuICAgICAgICBsZXQgdGVtcCA9IFtdO1xyXG4gICAgICAgIHRlbXAubGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0ZW1wLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgdGVtcFtpXSA9IFtdO1xyXG4gICAgICAgICAgICB0ZW1wW2ldLmxlbmd0aCA9IHRlbXAubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgdGVtcFtpXVtqXSA9IGFycmF5W3RlbXAubGVuZ3RoIC0gaiAtIDFdW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZW1wO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnJhbmRvbUludGVnZXIgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcclxuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcclxuICAgICAgICBtYXggPSBNYXRoLmZsb29yKG1heCk7XHJcblxyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMubWVyZ2UgPSBmdW5jdGlvbihzaGFwZSwgYm9hcmQpIHtcclxuICAgICAgICBzaGFwZS5zaGFwZUFycmF5LmZvckVhY2goZnVuY3Rpb24gKHJvdywgeSkge1xyXG4gICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIHgpIHtcclxuICAgICAgICAgICAgICAgIGlmKHZhbHVlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9hcmRbeSArIHNoYXBlLnBvc2l0aW9uLnldW3ggKyBzaGFwZS5wb3NpdGlvbi54XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29sbGlkZSA9IGZ1bmN0aW9uIChzaGFwZSwgYm9hcmQpIHtcclxuICAgICAgICBjb25zdCBzQXJyYXkgPSBzaGFwZS5zaGFwZUFycmF5O1xyXG4gICAgICAgIGNvbnN0IHNQb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgc0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBzQXJyYXlbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmKHNBcnJheVtpXVtqXSAhPT0gMCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChib2FyZFtpICsgc1Bvc2l0aW9uLnldICYmXHJcbiAgICAgICAgICAgICAgICAgICAgIGJvYXJkW2kgKyBzUG9zaXRpb24ueV1baiArIHNQb3NpdGlvbi54XSkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY2xlYXJSb3cgPSBmdW5jdGlvbihib2FyZCkge1xyXG4gICAgICAgIG91dGVyQXJyOiBmb3IgKGxldCBpID0gYm9hcmQubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGJvYXJkW2ldLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYm9hcmRbaV1bal0gPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBvdXRlckFycjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgcm93ID0gYm9hcmQuc3BsaWNlKGksIDEpWzBdLmZpbGwoMCk7XHJcbiAgICAgICAgICAgIGJvYXJkLnVuc2hpZnQocm93KTtcclxuICAgICAgICAgICAgaSsrO1xyXG5cclxuICAgICAgICAgICAgX3Njb3JlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfc2NvcmVkO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNhbGN1bGF0ZVNjb3JlID0gZnVuY3Rpb24gKHNjb3JlKSB7XHJcbiAgICAgICAgaWYoX3Njb3JlZCkge1xyXG4gICAgICAgICAgICBzY29yZSArPSAxMDtcclxuICAgICAgICAgICAgX3Njb3JlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNjb3JlO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgICBnZXRMb2dpY0luc3RhbmNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYoX2xvZ2ljKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfbG9naWM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgX2xvZ2ljID0gbmV3IExvZ2ljKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBfbG9naWM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTdWxmIG9uIDIxLjEyLjIwMTYuXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGhlaWdodDogMjAsXHJcbiAgICB3aWR0aDogMTJcclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBTdWxmIG9uIDIyLjEyLjIwMTYuXHJcbiAqL1xyXG5cclxuY29uc3QgU2hhcGVCdWlsZGVyID0gcmVxdWlyZSgnLi9TaGFwZUJ1aWxkZXIuanMnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnLi8uLi8uLi9FeHRlbmQvZXh0ZW5kJyk7XHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmZ1bmN0aW9uIENvbmNyZXRlU2hhcGVCdWlsZGVyKCkge1xyXG5cclxuICAgIFNoYXBlQnVpbGRlci5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5jcmVhdGVTaGFwZSA9IGZ1bmN0aW9uICh3aGljaCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENyZWF0ZWRTaGFwZSh3aGljaCk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHRlbmQoU2hhcGVCdWlsZGVyLCBDb25jcmV0ZVNoYXBlQnVpbGRlcik7XHJcbm1vZHVsZS5leHBvcnRzID0gQ29uY3JldGVTaGFwZUJ1aWxkZXI7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFN1bGYgb24gMjIuMTIuMjAxNi5cclxuICovXHJcblxyXG5sZXQgU2hhcGVCdWlsZGVyID0gcmVxdWlyZSgnLi9TaGFwZUJ1aWxkZXIuanMnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnLi8uLi8uLi9FeHRlbmQvZXh0ZW5kJyk7XHJcbmNvbnN0IExvZ2ljID0gcmVxdWlyZSgnLi4vLi4vTG9naWMvTG9naWMuanMnKTtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgX2xvZ2ljID0gTG9naWMuZ2V0TG9naWNJbnN0YW5jZSgpO1xyXG5cclxuZnVuY3Rpb24gUmFuZG9tU2hhcGVCdWlsZGVyKCkge1xyXG5cclxuICAgIFNoYXBlQnVpbGRlci5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5jcmVhdGVTaGFwZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDcmVhdGVkU2hhcGUoX2xvZ2ljLnJhbmRvbUludGVnZXIoMCw3KSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHRlbmQoU2hhcGVCdWlsZGVyLCBSYW5kb21TaGFwZUJ1aWxkZXIpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFJhbmRvbVNoYXBlQnVpbGRlcjtcclxuXHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFN1bGYgb24gMjIuMTIuMjAxNi5cclxuICovXHJcblxyXG5jb25zdCBTaGFwZSA9IHJlcXVpcmUoJy4vLi4vU2hhcGUuanMnKTtcclxuY29uc3QgX2xvZ2ljID0gcmVxdWlyZSgnLi4vLi4vTG9naWMvTG9naWMuanMnKS5nZXRMb2dpY0luc3RhbmNlKCk7XHJcbmNvbnN0IF9zaGFwZUhvbGRlciA9IHJlcXVpcmUoJy4vLi4vRGF0YS9TaGFwZUhvbGRlci5qcycpO1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlQnVpbGRlcigpIHtcclxuXHJcbiAgICB0aGlzLmdldENyZWF0ZWRTaGFwZSA9IGZ1bmN0aW9uKHdoYXQpIHtcclxuICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgICAgIHNoYXBlLnNoYXBlQXJyYXkgPV9zaGFwZUhvbGRlci5sb2FkU2hhcGUod2hhdCk7XHJcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZUJ1aWxkZXI7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFN1bGYgb24gMTIvMjgvMjAxNi5cclxuICovXHJcbmNvbnN0IF9jb2xvcnMgPSBbXHJcbiAgICAnI0ZGRTVBMCcsXHJcbiAgICAnI0ZGQTc3QicsXHJcbiAgICAnIzlDQUZGQicsXHJcbiAgICAnI0NCODhGQycsXHJcbiAgICAnIzg3RDNENScsXHJcbiAgICAnI0Y4ODY5QScsXHJcbiAgICAnIzlDRTBDNydcclxuXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgZ2V0Q29sb3I6IGZ1bmN0aW9uICh3aGljaCkge1xyXG4gICAgICAgIGlmKHdoaWNoID4gLTEgJiYgd2hpY2ggPCBfY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX2NvbG9yc1t3aGljaF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTdWxmIG9uIDEyLzI4LzIwMTYuXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gU2hhcGVIZWxwZXIoeCx5KSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZUhlbHBlcjtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU3VsZiBvbiAyMi4xMi4yMDE2LlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgX3NoYXBlID0gW1xyXG4gICAgW1sxLDEsXSxcclxuICAgICBbMSwxLF1dLFxyXG5cclxuICAgIFtbMCwyLDAsXSxcclxuICAgICBbMCwyLDAsXSxcclxuICAgICBbMCwyLDIsXV0sXHJcblxyXG4gICAgW1swLDMsMCxdLFxyXG4gICAgIFswLDMsMCxdLFxyXG4gICAgIFszLDMsMCxdXSxcclxuXHJcbiAgICBbWzAsMCwwLF0sXHJcbiAgICAgWzQsNCw0LF0sXHJcbiAgICAgWzAsNCwwLF1dLFxyXG5cclxuICAgIFtbNSwwLDAsMCxdLFxyXG4gICAgIFs1LDAsMCwwLF0sXHJcbiAgICAgWzUsMCwwLDAsXSxcclxuICAgICBbNSwwLDAsMCxdXSxcclxuXHJcbiAgICBbWzAsMCwwLF0sXHJcbiAgICAgWzYsNiwwLF0sXHJcbiAgICAgWzAsNiw2LF1dLFxyXG5cclxuICAgIFtbMCwwLDAsXSxcclxuICAgICBbMCw3LDcsXSxcclxuICAgICBbNyw3LDAsXV1cclxuXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbG9hZFNoYXBlOiBmdW5jdGlvbih3aGljaCkge1xyXG4gICAgICAgIGlmKHdoaWNoID4gLTEgJiYgd2hpY2ggPCBfc2hhcGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfc2hhcGVbd2hpY2hdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU3VsZiBvbiAyMS4xMi4yMDE2LlxyXG4gKi9cclxuXHJcbmNvbnN0IFNoYXBlSGVscGVyID0gcmVxdWlyZSgnLi9EYXRhL1NoYXBlSGVscGVyLmpzJyk7XHJcbmNvbnN0IF9sb2dpYyA9IHJlcXVpcmUoJy4uL0xvZ2ljL0xvZ2ljLmpzJykuZ2V0TG9naWNJbnN0YW5jZSgpO1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBTaGFwZUhlbHBlcig1LDApO1xyXG4gICAgdGhpcy5zaGFwZUFycmF5ID0gW107XHJcbiAgICB0aGlzLnJvdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2hhcGVBcnJheSA9IF9sb2dpYy5yb3RhdGUodGhpcy5zaGFwZUFycmF5KTtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGU7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU3VsZiBvbiAyMi4xMi4yMDE2LlxyXG4gKi9cclxuXHJcbmNvbnN0IENvbmNyZXRlU2hhcGVCdWlsZGVyID0gcmVxdWlyZSgnLi9CdWlsZGVyL0NvbmNyZXRlU2hhcGVCdWlsZGVyLmpzJyk7XHJcbmNvbnN0IFJhbmRvbVNoYXBlQnVpbGRlciA9IHJlcXVpcmUoJy4vQnVpbGRlci9SYW5kb21TaGFwZUJ1aWxkZXIuanMnKTtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuZnVuY3Rpb24gU2hhcGVEaXJlY3RvcigpIHtcclxuXHJcbiAgICB0aGlzLmJ1aWxkU2hhcGUgPSBmdW5jdGlvbiAod2hpY2gpIHtcclxuICAgICAgICBsZXQgYnVpbGRlcjtcclxuICAgICAgICBpZih3aGljaCAhPSBudWxsIHx8IHdoaWNoICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBidWlsZGVyID0gbmV3IENvbmNyZXRlU2hhcGVCdWlsZGVyKHdoaWNoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBidWlsZGVyID0gbmV3IFJhbmRvbVNoYXBlQnVpbGRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIuY3JlYXRlU2hhcGUod2hpY2gpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlRGlyZWN0b3I7XHJcbiIsInJlcXVpcmUoJy4vYXBwL0dhbWUuanMnKTsiXX0=
