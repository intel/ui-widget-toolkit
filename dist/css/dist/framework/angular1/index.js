(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("UWTAngularJS", [], factory);
	else if(typeof exports === 'object')
		exports["UWTAngularJS"] = factory();
	else
		root["UWTAngularJS"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/framework/angular1/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/framework/angular1/index.js":
/*!*****************************************!*\
  !*** ./src/framework/angular1/index.js ***!
  \*****************************************/
/*! exports provided: initializeAngular1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"initializeAngular1\", function() { return initializeAngular1; });\nfunction initializeAngular1(angular) {\n    let angularModule = angular.module('ui-widget-toolkit', []);\n\n    angularModule.directive('uwtChart', function () {\n        return {\n            template: '<div class=\"chart-title\">{{chartTitle}}</div>' +\n                '<div id=\"chart\"></div>',\n            restrict: 'E',\n            scope: {\n                chartDef: '=',\n                chartTitle: '=?',\n                renderOptions: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('chartDef', function () {\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        UWT.Chart.finalize(scope.chartDef);\n                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watchCollection('chartDef.legends', function () {\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        UWT.Chart.finalize(scope.chartDef);\n                        scope.renderer.render(scope.chartDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        UWT.Chart.finalize(scope.chartDef);\n                        scope.renderer.render(scope.chartDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtSwimlaneChart', function () {\n        return {\n            template: '<div class=\"chart-title\">{{chartTitle}}</div>' +\n                '<uwt-chart ng-repeat=\"chartDef in chartDefs\" ng-if=\"!chartDef.hide\" ' +\n                'chart-def=\"chartDef\" render-options=\"getChartOptions($index)\" ' +\n                'color-manager=\"colorManager\" on-render=\"onRender\" renderer=\"renderer\"></uwt-chart>',\n            restrict: 'E',\n            scope: {\n                chartDefs: '=',\n                chartTitle: '=?',\n                renderOptions: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n\n                let chartOptions = [];\n                scope.getChartOptions = function (index) {\n                    if (index >= chartOptions.length) {\n                        chartOptions[index] = UWT.copy(this.renderOptions);\n                    }\n                    return chartOptions[index];\n                }\n            }\n        };\n    });\n\n    angularModule.directive('uwtPieChart', function () {\n        return {\n            template: '<div class=\"chart-title\">{{chartTitle}}</div>' +\n                '<div id=\"chart\"></div>',\n            restrict: 'E',\n            scope: {\n                chartDef: '=',\n                chartTitle: '=?',\n                renderOptions: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('chartDef', function () {\n                    scope.renderer.clearDiv(element[0].children[1]);\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.render(scope.chartDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtRadarChart', function () {\n        return {\n            template: '<div class=\"chart-title\">{{chartTitle}}</div>' +\n                '<div id=\"chart\"></div>',\n            restrict: 'E',\n            scope: {\n                chartDef: '=',\n                chartTitle: '=?',\n                renderOptions: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('chartDef', function () {\n                    scope.renderer.clearDiv(element[0].children[1]);\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.render(scope.chartDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtSunburstChart', function () {\n        return {\n            template: '<div class=\"chart-title\">{{chartTitle}}</div>' +\n                '<div id=\"chart\"></div>',\n            restrict: 'E',\n            scope: {\n                chartDef: '=',\n                chartTitle: '=?',\n                renderOptions: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('chartDef', function () {\n                    scope.renderer.clearDiv(element[0].children[1]);\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.chartDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.render(scope.chartDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtGrid', function () {\n        return {\n            template: '<div class=\"grid-title\">{{gridTitle}}</div>' +\n                '<div id=\"grid\" ng-class=\"gridClass\" ng-style=\"gridStyle\"></div>',\n            restrict: 'E',\n            scope: {\n                gridDef: '=',\n                gridStyle: '=',\n                gridClass: '=',\n                gridTitle: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.AgGridRenderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('gridDef', function () {\n                    if (scope.gridDef) {\n                        scope.renderer.setDiv(scope.gridDef, element[0].children[1]);\n                        scope.renderer.render(scope.gridDef);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtFlowDiagram', function () {\n        return {\n            template: '<div class=\"diagram-title\">{{diagramTitle}}</div>' +\n                '<div id=\"diagram\"></div>',\n            restrict: 'E',\n            scope: {\n                diagramDef: '=',\n                renderOptions: '=?',\n                diagramTitle: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                rendrerer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('diagramDef', function () {\n                    if (scope.diagramDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.invalidate(scope.diagramDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.diagramDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.render(scope.diagramDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtGraph', function () {\n        return {\n            template: '<div class=\"graph-title\">{{graphTitle}}</div>' +\n                '<div id=\"graph\"></div>',\n            restrict: 'E',\n            scope: {\n                graphDef: '=',\n                renderOptions: '=?',\n                graphTitle: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('graphDef', function () {\n                    if (scope.graphDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.invalidate(scope.graphDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.graphDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.render(scope.graphDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtHierarchyGraph', function () {\n        return {\n            template: '<div class=\"graph-title\">{{graphTitle}}</div>' +\n                '<div id=\"graph\"></div>',\n            restrict: 'E',\n            scope: {\n                graphDef: '=',\n                renderOptions: '=?',\n                graphTitle: '=?',\n                colorManager: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('graphDef', function () {\n                    if (scope.graphDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.invalidate(scope.graphDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.graphDef) {\n                        scope.renderer.setDiv(element[0].children[1]);\n                        scope.renderer.render(scope.graphDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n\n    angularModule.directive('uwtAxis', function () {\n        return {\n            template: '<div id=\"axis\"></div>',\n            restrict: 'E',\n            scope: {\n                axisDef: '=',\n                renderOptions: '=?',\n                onRender: '=?',\n                renderer: '=?'\n            },\n            link: function (scope, element, attrs) {\n                if (!scope.renderer) {\n                    scope.renderer = new UWT.D3Renderer('');\n                }\n                scope.renderer.setOnRenderCallback(scope.onRender);\n\n                scope.$watch('axisDef', function () {\n                    if (scope.axisDef) {\n                        scope.renderer.setDiv(element[0].children[0]);\n                        scope.renderer.invalidate(scope.axisDef, scope.renderOptions);\n                    }\n                });\n\n                scope.$watch('renderOptions', function () {\n                    if (scope.axisDef) {\n                        scope.renderer.setDiv(element[0].children[0]);\n                        scope.renderer.render(scope.axisDef, scope.renderOptions);\n                    }\n                });\n            }\n        };\n    });\n}\n\n\n//# sourceURL=webpack://UWTAngularJS/./src/framework/angular1/index.js?");

/***/ })

/******/ });
});