document.write('<script async src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1\"></' + 'script>'); /*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Algos/a_star/main.js":
/*!**********************************!*\
  !*** ./src/Algos/a_star/main.js ***!
  \**********************************/
/***/ (() => {

eval("\n\n//# sourceURL=webpack:///./src/Algos/a_star/main.js?");

/***/ }),

/***/ "./src/Algos/ant/main.js":
/*!*******************************!*\
  !*** ./src/Algos/ant/main.js ***!
  \*******************************/
/***/ (() => {

eval("\n\n//# sourceURL=webpack:///./src/Algos/ant/main.js?");

/***/ }),

/***/ "./src/Algos/claster/main.js":
/*!***********************************!*\
  !*** ./src/Algos/claster/main.js ***!
  \***********************************/
/***/ (() => {

eval("\n\n//# sourceURL=webpack:///./src/Algos/claster/main.js?");

/***/ }),

/***/ "./src/Algos/genetics/main.js":
/*!************************************!*\
  !*** ./src/Algos/genetics/main.js ***!
  \************************************/
/***/ (() => {

eval("\n\n//# sourceURL=webpack:///./src/Algos/genetics/main.js?");

/***/ }),

/***/ "./src/Algos/nn/main.js":
/*!******************************!*\
  !*** ./src/Algos/nn/main.js ***!
  \******************************/
/***/ (() => {

eval("\n\n//# sourceURL=webpack:///./src/Algos/nn/main.js?");

/***/ }),

/***/ "./src/Algos/tree_solution/main.js":
/*!*****************************************!*\
  !*** ./src/Algos/tree_solution/main.js ***!
  \*****************************************/
/***/ (() => {

eval("\n\n//# sourceURL=webpack:///./src/Algos/tree_solution/main.js?");

/***/ }),

/***/ "./src/Render.js":
/*!***********************!*\
  !*** ./src/Render.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"CanvasRender\": () => (/* binding */ CanvasRender)\n/* harmony export */ });\nclass CanvasRender{\r\n\tconstructor(ctx, width = null, height = null){\r\n\t\tconst { width: ctxWidth, height: ctxHeight } = ctx.canvas.getBoundingClientRect();\r\n\t\t\r\n\t\tthis.onresize = null;\r\n\t\tthis.ondraw = 1;\r\n\t\t\r\n\t\tthis.ctx = ctx;\r\n\t\t\r\n\t\tthis._fixed = { width: width, height: height };\r\n\t\t\r\n\t\tthis.width = ctxWidth;\r\n\t\tthis.height = ctxHeight;\r\n\t\t\r\n\t\tctx.canvas.width = ctxWidth;\r\n\t\tctx.canvas.height = ctxHeight;\r\n\t\t\r\n\t\t$(window).on('resize', this.resize.bind(this));\r\n\t\trequestAnimationFrame(this.draw.bind(this));\r\n\t}\r\n\t\r\n\thello(){\r\n\t\tlet imgHello = $('<img/>');\r\n\t\tthis.imgHello = imgHello;\r\n\t\t\r\n\t\timgHello[0].src = 'img/5.png';\r\n\t\t\r\n\t\tlet helloDraw = function(render, a1, a2, a3){\r\n\t\t\tlet ctx = render.ctx;\r\n\t\t\tlet ctxWidth = render.width;\r\n\t\t\tlet ctxHeight = render.height;\r\n\t\t\t\r\n\t\t\tctx.fillStyle = 'black';\r\n\t\t\tctx.fillRect(0, 0, ctxWidth, ctxHeight);\r\n\t\t\t\r\n\t\t\tlet aspect = this.naturalWidth / this.naturalHeight;\r\n\t\t\tlet multiplier = ctxWidth / this.naturalWidth;\r\n\t\t\t\r\n\t\t\tlet height = this.naturalWidth / aspect * multiplier;\r\n\t\t\tlet width = this.naturalWidth * multiplier;\r\n\t\t\t\r\n\t\t\tif(height > ctxHeight){\r\n\t\t\t\tmultiplier = ctxHeight / this.naturalHeight;\r\n\t\t\t\t\r\n\t\t\t\theight = this.naturalHeight * multiplier;\r\n\t\t\t\twidth = this.naturalHeight * aspect * multiplier;\r\n\t\t\t}\r\n\t\t\t\r\n\t\t\tlet sX = (ctxWidth - width) / 2;\r\n\t\t\tlet sY = (ctxHeight - height) / 2;\r\n\t\t\t\r\n\t\t\tctx.drawImage(this, sX, sY, width, height);\r\n\t\t}.bind(imgHello[0], this);\r\n\t\t\r\n\t\timgHello.on('load', helloDraw);\r\n\t\tthis.onresize = helloDraw;\r\n\t}\r\n\t\r\n\tdraw(){\r\n\t\tif(this.ondraw instanceof Function)\r\n\t\t\tthis.ondraw.bind(this)();\r\n\t\t\r\n\t\trequestAnimationFrame(() => { this.draw(); });\r\n\t}\r\n\t\r\n\tresize(){\r\n\t\tif(this._fixed.height && this._fixed.width) return;\r\n\t\t\r\n\t\tif(this._fixed.height) this.ctx.canvas.height = this._fixed.height; else this.ctx.canvas.height = this.ctx.canvas.clientHeight;\r\n\t\tif(this._fixed.width)  this.ctx.canvas.width  = this._fixed.width;  else this.ctx.canvas.width  = this.ctx.canvas.clientWidth;\r\n\t\t\r\n\t\tthis.height = this.ctx.canvas.height;\r\n\t\tthis.width = this.ctx.canvas.width;\r\n\t\t\r\n\t\tif(this.onresize instanceof Function)\r\n\t\t\tthis.onresize.bind(this)();\r\n\t}\r\n};\n\n//# sourceURL=webpack:///./src/Render.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Render_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Render.js */ \"./src/Render.js\");\n\r\n\r\n$(function(){\r\n\tlet canvas = $('#canvas_demo_algo');\r\n\tlet ctx = canvas[0].getContext('2d');\r\n\t\r\n\tlet render = new _Render_js__WEBPACK_IMPORTED_MODULE_0__.CanvasRender(ctx);\r\n\trender.hello();\r\n});\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	__webpack_require__("./src/main.js");
/******/ 	__webpack_require__("./src/Render.js");
/******/ 	__webpack_require__("./src/Algos/ant/main.js");
/******/ 	__webpack_require__("./src/Algos/a_star/main.js");
/******/ 	__webpack_require__("./src/Algos/claster/main.js");
/******/ 	__webpack_require__("./src/Algos/genetics/main.js");
/******/ 	__webpack_require__("./src/Algos/nn/main.js");
/******/ 	var __webpack_exports__ = __webpack_require__("./src/Algos/tree_solution/main.js");
/******/ 	
/******/ })()
;