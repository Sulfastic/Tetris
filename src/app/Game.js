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
mainContext.scale(20,20);
nextContext.scale(4,4);

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
    if(event.keyCode === 37) { //move left
        move(-1);
    } else if (event.keyCode === 39) { //move right
        move(1);
    } else if(event.keyCode === 40) { //move down
        drop();
    } else if (event.keyCode === 38) { //rotate
        rotate();
    }
});

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

function move(direction) {
    shape.position.x += direction;
    if(logic.collide(shape, gameBoard)) {
        shape.position.x -= direction;
    }
}

function drop() {
    shape.position.y++;
    if(logic.collide(shape,gameBoard)) {
        shape.position.y--;
        logic.merge(shape, gameBoard);
        shape = newShape;
        newShape = shapeDirector.buildShape();
        if(logic.collide(shape, gameBoard)) {
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

    drawArray(gameBoard, {x:0, y:0});
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
        })
    });
}

function drawNext() {
    newShape.shapeArray.forEach(function (row, y) {
        row.forEach(function (value, x) {
            if (value !== 0) {
                nextContext.fillStyle = colors.getColor(value - 1);
                nextContext.fillRect(x + 1, y + 1, 1, 1);
            }
        })
    })
}

function update(time = 0) {
    const deltaTime = time - lastTime;

    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval) {
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

tetrisTheme.addEventListener("ended", function(){
    tetrisTheme.currentTime = 0;
    tetrisTheme.play();
});
tetrisTheme.play();

update();

