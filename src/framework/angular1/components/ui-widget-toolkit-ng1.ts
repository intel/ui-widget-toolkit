import { ILegend, IOptions } from '../../../interface/ui-base';
import { IChart } from '../../../interface/chart/chart';
import { Chart, ChartGroup } from '../../../core/cartesian/chart';
import { D3Renderer } from '../../../core/renderer';
import { AgGridRenderer } from '../../../core/ag-grid/ag-grid-renderer';

export function initializeAngular1(angular: any) {
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        Chart.finalize(scope.chartDef);
                        scope.renderer.invalidate(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watchCollection('chartDef.legends', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        Chart.finalize(scope.chartDef);
                        scope.renderer.render(scope.chartDef, scope.renderOptions);
                    }
                });

                scope.$watch('renderOptions', function () {
                    if (scope.chartDef) {
                        scope.renderer.setDiv(element[0].children[1]);
                        Chart.finalize(scope.chartDef);
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
            link: function (scope: any, element: any, attrs: any) {

                let chartOptions: IOptions[] = [];
                scope.getChartOptions = function (index: number) {
                    if (index < chartOptions.length) {
                        return chartOptions[index];
                    }
                    return scope.renderOptions;
                }
                scope.$watchCollection('chartDefs', function (newList: any, oldList: any) {
                    let chartMap: Map<IChart, boolean> = new Map<IChart, boolean>();
                    if (newList) {
                        for (let i = 0; i < newList.length; ++i) {
                            chartMap.set(newList[i], true);
                        }
                    }
                    let legends: ILegend[] = [];
                    if (oldList) {
                        for (let i = 0; i < oldList.length; ++i) {
                            var oldChart = oldList[i];
                            if (!chartMap.has(oldChart)) {
                                ChartGroup.handleRemoveChart(oldChart);
                            }
                            if (oldChart.legends) {
                                legends = legends.concat(oldChart.legends);
                            }
                        }
                    } else {
                        if (scope.chartDefs !== undefined) {
                            for (let i = 0; i < scope.chartDefs.length; ++i) {
                                if (scope.chartDefs[i].legends) {
                                    legends = legends.concat(scope.chartDefs[i].legends);
                                }
                            }
                        }
                    }

                    if (scope.chartDefs) {
                        ChartGroup.handleChartUpdate(scope.chartDefs,
                            chartOptions, scope, legends);
                    }
                });
                scope.$watch('renderOptions', function () {
                    ChartGroup.handleRenderOptionsUpdate(scope, scope.renderOptions,
                        chartOptions);
                });
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new D3Renderer('', scope.colorManager);
                }
                scope.renderer.setOnRenderCallback(scope.onRender);

                scope.$watch('chartDef', function () {
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new AgGridRenderer('', scope.colorManager);
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new D3Renderer('', scope.colorManager);
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new D3Renderer('', scope.colorManager);
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
            link: function (scope: any, element: any, attrs: any) {
                if (!scope.renderer) {
                    scope.renderer = new D3Renderer('', scope.colorManager);
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
}
