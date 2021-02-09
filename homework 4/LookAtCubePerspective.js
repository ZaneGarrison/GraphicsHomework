"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Zane Garrison  
 * Professor: Dr. Alan Shaw
 * Assignment #: Mod 5 Assignment Extra Credit 
 */
var canvas;
var gl;

var points = [];
var colors = [];

var modelViewMatrix;
var modelViewMatrixLoc;

var projectionMatrix;
var projectionMatrixLoc;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var near = 0.1; //usually + .1 from the camera for perspective
var far = 4.0; //arbitrary
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var fovy = 120.0;
var isPerspective = true;

var xAngle = 0.7;
var yValue = 1.0;

var radius = 1.0;
var theta = 0;
var phi = 0;

var isOrtho = true;  

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL is not available"); }

    // viewport = rectangular area of display window
    gl.viewport(0, 0, canvas.width, canvas.height);
    // clear area of display for rendering at each frame
    gl.clearColor( 0.1, 0.1, 0.1, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    colorCube();

    // --------------- Load shaders and initialize attribute buffers

    // Create a buffer object, initialise it, and associate it 
    // with the associated attribute variable in our vertex shader

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffer    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Cube colour; set attributes 
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Cube create points buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Cube create position
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    projectionMatrix = perspective(fovy, 1.0, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	
	document.getElementById("perspective").onclick =
      function () {
        isPerspective = true;
		projectionMatrix = perspective(fovy, 1.0, near, far);
		gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		
		document.getElementById("perspective").style.background = "lightgrey";
		document.getElementById("orthographic").style.background = "white";
      };
	  
	document.getElementById("orthographic").onclick =
      function () {
        isPerspective = false;
		projectionMatrix = ortho(left, right, bottom, ytop, near ,far);
		gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		
		document.getElementById("perspective").style.background = "white";
		document.getElementById("orthographic").style.background = "lightgrey";
      };
	
	document.getElementById("fovyval").onchange =
      function (event) {
          fovy = event.target.value;
		  if (isPerspective){
			projectionMatrix = perspective(fovy, 1.0, near, far);
			gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		  }
          
      };
	
	document.getElementById("nearval").onchange =
      function (event) {
          near = event.target.value;
		  
      };

	document.getElementById("farval").onchange =
      function (event) {
          far = event.target.value;
		  
      };

	document.getElementById("lrval").onchange =
      function (event) {
          left = -event.target.value;
		  right = event.target.value;
		  
      };

	document.getElementById("tbval").onchange =
      function (event) {
          ytop = event.target.value;
		  bottom = -event.target.value;
		  
      };

	
	
	document.getElementById("radiusval").onchange =
      function (event) {
          radius = event.target.value;
		  
      };
	
	document.getElementById("decreaseTheta").onclick =
      function () {
          theta -= 0.1;
      };
	  
	document.getElementById("increaseTheta").onclick =
      function () {
          theta += 0.1;
      };
		
	document.getElementById("decreasePhi").onclick =
      function () {
          phi -= 0.1;
      };
	  
	document.getElementById("increasePhi").onclick =
      function () {
          phi += 0.1;
      };
	
	 document.addEventListener("keydown",
      function (event) {
	if (event.keyCode == 37) {   // Left Arrow
	theta -= 0.1;
          }
    if (event.keyCode == 39) {   // Right Arrow
	theta += 0.1;
          }
    if (event.keyCode == 38) {   // Up Arrow
	phi -= 0.1;
          }
    if (event.keyCode == 40) {   // Down Arrow
	phi += 0.1;
          }
		  
	if (event.keyCode == 34) {   // Up Arrow
	radius -= 0.1;
          }
    if (event.keyCode == 33) {   // Down Arrow
	radius += 0.1;
          }

	 if (event.keyCode == 80) {   // Down Arrow
		isPerspective = true;
		projectionMatrix = perspective(fovy, 1.0, near, far);
		gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		
		document.getElementById("perspective").style.background = "lightgrey";
		document.getElementById("orthographic").style.background = "white";
          }
	if (event.keyCode == 79) {   // Down Arrow
		isPerspective = false;
		projectionMatrix = ortho(left, right, bottom, ytop, near ,far);
		gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		
		document.getElementById("perspective").style.background = "white";
		document.getElementById("orthographic").style.background = "lightgrey";
          }
	
	
	  },false);
	/*document.getElementById("ycameraval").onchange =
      function (event) {
           yValue = event.target.value;
          
      };*/
	  

    render();
}

// -------------------------------------------------------------------


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var eye = vec3(radius * Math.cos(theta) * Math.cos(phi),
                    radius * Math.sin(phi),
                    radius * Math.sin(theta) * Math.cos(phi));
	if (theta > 2 * Math.PI)
        theta -= 2 * Math.PI;
    if (theta < 0)
        theta += 2 * Math.PI;

    if (phi > 2 * Math.PI)
        phi -= 2 * Math.PI;
    if (phi < 0)
        phi += 2 * Math.PI;
	
	if (phi > Math.PI / 2 && phi < 3 * Math.PI/2){
		up = vec3(0.0, -1.0, 0.0);
	}
	else{
		up = vec3(0.0, 1.0, 0.0);
	}

    modelViewMatrix = lookAt(eye, at, up);
	if(isOrtho){
		projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	}
	else{
		projectionMatrix = perspective(fovy, 1.0, near, far);
	}

	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    // Render cube
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimationFrame(render);
}

// DEFINE CUBE

function colorCube() {
    square(1, 0, 3, 2);
    square(2, 3, 7, 6);
    square(3, 0, 4, 7);
    square(5, 1, 2, 6);
    square(4, 5, 6, 7);
    square(5, 4, 0, 1);
}

function square(a, b, c, d) {
    var verticesC = [
        vec3(-0.25, -0.25, 0.25),
        vec3(-0.25, 0.25, 0.25),
        vec3(0.25, 0.25, 0.25),
        vec3(0.25, -0.25, 0.25),
        vec3(-0.25, -0.25, -0.25),
        vec3(-0.25, 0.25, -0.25),
        vec3(0.25, 0.25, -0.25),
        vec3(0.25, -0.25, -0.25)
    ];

    var vertexColors = [
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [0.0, 0.0, 0.0, 1.0],  // black
        [0.0, 0.0, 1.0, 1.0],  // blue
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [1.0, 1.0, 1.0, 1.0],  // white
        [0.0, 1.0, 0.0, 1.0],  // green
        [1.0, 0.0, 0.0, 1.0]   // red
    ];

    // Partion the square into two triangles in order for
    // WebGL to be able to render it.      
    // Vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(verticesC[indices[i]]);
        //colorsC.push( vertexColors[indices[i]] );

        //for solid colored faces use 
        colors.push(vertexColors[c]);
    }
}