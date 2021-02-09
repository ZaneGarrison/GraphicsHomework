"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Zane Garrison  
 * Professor: Dr. Alan Shaw
 * Assignment #: Mod 6 Assignment 2 part 1
 */
var canvas;
var gl;
var program;

var numVertices = 36;

var texSize = 64;
var imgSize = 64;
var numChecks = 4;

var checkerImage = new Uint8Array(4 * imgSize * imgSize);

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var drawBlackLoc;

var imagesLoaded = 0;
var image1, image2, image3, image4, image5, image6;
var imageMap = [null, null, null, null, null, null];
var texture1, texture2, texture3, texture4, texture5, texture6;
var textureMap = [null, null, null, null, null, null];

var rotateFlag = true;
var animateFlag = true;

var imgIndex = 1;


var texCoord = [
    [ vec2(0, 0), vec2(0, 0.5), vec2(0.25, 0.5), vec2(0.25, 0) ],
    [ vec2(0, 0.5), vec2(0, 1), vec2(0.25, 1), vec2(0.25, 0.5) ],
    [ vec2(0.25, 0), vec2(0.25, 0.5), vec2(0.5, 0.5), vec2(0.5, 0) ],
    [ vec2(0.25, 0.5), vec2(0.25, 1), vec2(0.5, 1), vec2(0.5, 0.5) ],
    [ vec2(0.5, 0), vec2(0.5, 0.5), vec2(0.75, 0.5), vec2(0.75, 0) ],
    [ vec2(0.5, 0.5), vec2(0.5, 1), vec2(0.75, 1), vec2(0.75, 0.5) ]
];

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var vertexColors = [
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(1.0, 0.0, 0.0, 1.0)   // red
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];
var thetaLoc;


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    for (var i = 0; i < imgSize; i++) {
        for (var j = 0; j < imgSize; j++) {
            var patchx = Math.floor(i / (imgSize / numChecks));
            var patchy = Math.floor(j / (imgSize / numChecks));
            var c;
            c = (patchx % 2 ^ patchy % 2) ? 255 : 0;
            checkerImage[4 * i * imgSize + 4 * j] = c;
            checkerImage[4 * i * imgSize + 4 * j + 1] = c;
            checkerImage[4 * i * imgSize + 4 * j + 2] = c;
            checkerImage[4 * i * imgSize + 4 * j + 3] = 255;
        }
    }

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    

    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("ButtonX").onclick =
        function () {
            axis = xAxis;
        };

    document.getElementById("ButtonY").onclick =
        function () {
            axis = yAxis;
        };

    document.getElementById("ButtonZ").onclick =
        function () {
            axis = zAxis;
        };
		
	document.getElementById("ToggleRotation").onclick =
        function () {
            rotateFlag = !rotateFlag;
        }
	
	document.getElementById("ToggleAnimation").onclick =
        function () {
            animateFlag = !animateFlag;
        }
	
	drawBlackLoc = gl.getUniformLocation(program, "drawBlack");
    gl.uniform1i(drawBlackLoc, false);
	
	image1 = new Image();
    image1.onload = function () {
        configureTextureMap(image1, 1);
    }
    image1.src = filecharacter1sprites;

    image2 = new Image();
    image2.onload = function () {
        configureTextureMap(image2, 2);
    }
    image2.src = filecharacter2sprites;

    image3 = new Image();
    image3.onload = function () {
        configureTextureMap(image3, 3);
    }
    image3.src = filecharacter3sprites;

    image4 = new Image();
    image4.onload = function () {
        configureTextureMap(image4, 4);
    }
    image4.src = filecharacter4sprites;

    image5 = new Image();
    image5.onload = function () {
        configureTextureMap(image5, 5);
    }
    image5.src = filecharacter5sprites;

    image6 = new Image();
    image6.onload = function () {
        configureTextureMap(image6, 6);
    }
    image6.src = filecharacter6sprites;
	
	flipImage();
    render();
}

function flipImage() {
    setTimeout(function () {
        if(animateFlag){
		++imgIndex;
        if (imgIndex > 6)
            imgIndex = 1;

        gl.bindTexture(gl.TEXTURE_2D, textureMap[imgIndex-1]);
		}
        flipImage();
    }, 100);
}

function configureTextureMap(img, imgNum) {
    imageMap[imgNum - 1] = img;
    if (++imagesLoaded < 6) {
        return;
    }
    for (var i = 1; i <= 6; ++i) {
        switch (i) {
            case 1:
                texture1 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture1);
                break;
            case 2:
                texture2 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture2);
                break;
            case 3:
                texture3 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture3);
                break;
            case 4:
                texture4 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture4);
                break;
            case 5:
                texture5 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture5);
                break;
            default:
                texture6 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture6);
                break;
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            gl.RGBA, gl.UNSIGNED_BYTE, imageMap[i - 1]);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
            gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    textureMap = [texture1, texture2, texture3, texture4, texture5, texture6];
}

function configureTexture(image) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function colorCube() {
    quad(1, 0, 3, 2, 0);
    quad(2, 3, 7, 6, 1);
    quad(3, 0, 4, 7, 2);
    quad(5, 1, 2, 6, 3);
    quad(4, 5, 6, 7, 4);
    quad(5, 4, 0, 1, 5);
}

function quad(a, b, c, d, faceIndex) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][0]);

    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][1]);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][2]);

    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][0]);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][2]);

    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][3]);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(rotateFlag){
		theta[axis] += 2.0;
		gl.uniform3fv(thetaLoc, theta);
	}
    
	
	gl.uniform1i(drawBlackLoc, false);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    gl.uniform1i(drawBlackLoc, true);
    for (var i = 0; i < 6; ++i) {
        gl.drawArrays(gl.LINES, i * 6, 2);
        gl.drawArrays(gl.LINES, i * 6 + 1, 2);
        gl.drawArrays(gl.LINES, i * 6 + 4, 2);
    }
	
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame(render);
}