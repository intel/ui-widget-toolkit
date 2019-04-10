export function initializeAngular1(angular) {
    let angularModule = angular.module('ui-widget-toolkit', []);

    angularModule.directive('uwtChart', function () {
        return {
            template: '<div class="chart-title">{{chartTitle}}</div>' +
                '<div id="chart"></div>',
            restrict: 'E',
            scope: {
                chartDef: '=',
                chartTitle: '=?',
                renderOptions: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        UWT.Chart.finalize(scope.chartDef);
                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watchCollection('chartDef.legends', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        UWT.Chart.finalize(scope.chartDef);
                        scope.renderer.render(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        UWT.Chart.finalize(scope.chartDef);
                        scope.renderer.render(scope.chartDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtSwimlaneChart', function () {
        return {
            template: '<div class="chart-title">{{chartTitle}}</div>' +
                '<uwt-chart ng-repeat="chartDef in chartDefs" ng-if="!chartDef.hide" ' +
                'chart-def="chartDef" render-options="getChartOptions($index)" ' +
                'color-manager="colorManager" on-render="onRender" renderer="renderer"></uwt-chart>',
            restrict: 'E',
            scope: {
                chartDefs: '=',
                chartTitle: '=?',
                renderOptions: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {

                let chartOptions = [];
                scope.getChartOptions = function (index) {
                    if (index >= chartOptions.length) {
                        chartOptions[index] = UWT.copy(this.renderOptions);
                    }
                    return chartOptions[index];
                }
            }
        };
    });

    angularModule.directive('uwtPieChart', function () {
        return {
            template: '<div class="chart-title">{{chartTitle}}</div>' +
                '<div id="chart"></div>',
            restrict: 'E',
            scope: {
                chartDef: '=',
                chartTitle: '=?',
                renderOptions: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
                    scope.renderer.clearDiv(element[0].children[1]);
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.render(scope.chartDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtRadarChart', function () {
        return {
            template: '<div class="chart-title">{{chartTitle}}</div>' +
                '<div id="chart"></div>',
            restrict: 'E',
            scope: {
                chartDef: '=',
                chartTitle: '=?',
                renderOptions: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
                    scope.renderer.clearDiv(element[0].children[1]);
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.render(scope.chartDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtSunburstChart', function () {
        return {
            template: '<div class="chart-title">{{chartTitle}}</div>' +
                '<div id="chart"></div>',
            restrict: 'E',
            scope: {
                chartDef: '=',
                chartTitle: '=?',
                renderOptions: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
                    scope.renderer.clearDiv(element[0].children[1]);
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.render(scope.chartDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtGrid', function () {
        return {
            template: '<div class="grid-title">{{gridTitle}}</div>' +
                '<div id="grid" ng-class="gridClass" ng-style="gridStyle"></div>',
            restrict: 'E',
            scope: {
                gridDef: '=',
                gridStyle: '=',
                gridClass: '=',
                gridTitle: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.AgGridRenderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('gridDef', function () {
                    if (scope.gridDef) {
                        scope.renderer.setDiv(scope.gridDef, element[0].children[1]);
                        scope.renderer.render(scope.gridDef);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtFlowDiagram', function () {
        return {
            template: '<div class="diagram-title">{{diagramTitle}}</div>' +
                '<div id="diagram"></div>',
            restrict: 'E',
            scope: {
                diagramDef: '=',
                renderOptions: '=?',
                diagramTitle: '=?',
                colorManager: '=?',
                onRender: '=?',
                rendrerer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('diagramDef', function () {
                    if (scope.diagramDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.invalidate(scope.diagramDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.diagramDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.render(scope.diagramDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtGraph', function () {
        return {
            template: '<div class="graph-title">{{graphTitle}}</div>' +
                '<div id="graph"></div>',
            restrict: 'E',
            scope: {
                graphDef: '=',
                renderOptions: '=?',
                graphTitle: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('graphDef', function () {
                    if (scope.graphDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.invalidate(scope.graphDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.graphDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.render(scope.graphDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtHierarchyGraph', function () {
        return {
            template: '<div class="graph-title">{{graphTitle}}</div>' +
                '<div id="graph"></div>',
            restrict: 'E',
            scope: {
                graphDef: '=',
                renderOptions: '=?',
                graphTitle: '=?',
                colorManager: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('graphDef', function () {
                    if (scope.graphDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.invalidate(scope.graphDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.graphDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        scope.renderer.render(scope.graphDef, scope.renderOptions);
                    }
                });
            }
        };
    });

    angularModule.directive('uwtAxis', function () {
        return {
            template: '<div id="axis"></div>',
            restrict: 'E',
            scope: {
                axisDef: '=',
                renderOptions: '=?',
                onRender: '=?',
                renderer: '=?'
            },
            link: function (scope, element, attrs) {
                if (!scope.renderer) {
                    scope.renderer = new UWT.D3Renderer('');
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('axisDef', function () {
                    if (scope.axisDef) {
                        scope.renderer.setDiv(element[0].children[0]);
                        scope.renderer.invalidate(scope.axisDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.axisDef) {
                        scope.renderer.setDiv(element[0].children[0]);
                        scope.renderer.render(scope.axisDef, scope.renderOptions);
                    }
                });
            }
        };
    });
}
