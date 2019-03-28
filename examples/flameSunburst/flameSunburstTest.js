/// <reference path='./data.ts' />
/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var FlameSunburstTest;
(function (FlameSunburstTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        createWebGLView();
        TestBase.render();
    };
    function createView() {
        {
            var rectLimitDecimator = new UWT.FlameChartRectLimitDecimator();
            rectLimitDecimator.setRectLimit(10);
            var chart = {
                title: 'Flame Chart',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        decimator: rectLimitDecimator,
                        enableBackground: true,
                        renderType: UWT.RenderType.FlameChart,
                        data: calltrace,
                        onClick: function (event) {
                            console.log('flame chart click');
                            console.log(event);
                        },
                        onDoubleClick: function (event) {
                            console.log('flame chart double click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'FlameMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', '', '', { forceSvgRenderer: true });
            TestBase.elemManager.addToHighlightGroup(chart, 'trace');
        }
        {
            var chart = {
                title: 'Sample Data',
                type: UWT.UIType.Sunburst,
                data: UWT.convertTraceToTrees(calltrace),
                onClick: function (event) {
                    console.log('sunburst click');
                    console.log(event);
                }
            };
            TestBase.addElement(chart);
            TestBase.elemManager.addToHighlightGroup(chart, 'trace');
        }
        {
            var chart = {
                title: 'Trace Data',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.FlameChart,
                        data: trace,
                        onClick: function (event) {
                            console.log('dl click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'Trace Menu Item',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'group', '', { forceSvgRenderer: true });
        }
        {
            var chart = {
                title: 'Trace Residency',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area |
                            UWT.RenderType.Stacked,
                        data: trace
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'group');
        }
        {
            var chart = {
                title: 'Trace State',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: trace
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'group');
        }
        {
            var chart = {
                title: 'Trace Sparse',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.FlameChart,
                        data: trace2,
                        onClick: function (event) {
                            console.log(event);
                        },
                        onDoubleClick: function (event) {
                            console.log(event);
                        }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'trace2');
        }
        {
            var chart = {
                title: 'Trace Sparse Line',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: trace2
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'trace2');
        }
        {
            var chart = {
                title: 'Trace Sparse Area',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area,
                        data: trace2
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'trace2');
        }
    }
    FlameSunburstTest.createView = createView;
    function createWebGLView() {
        {
            var chart = {
                title: 'Flame Chart',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.FlameChart,
                        data: calltrace,
                        onClick: function (event) {
                            console.log('flame chart click');
                            console.log(event);
                        },
                        onDoubleClick: function (event) {
                            console.log('flame chart double click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'FlameMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', '', '', { forceWebGLRenderer: true });
            TestBase.elemManager.addToHighlightGroup(chart, 'trace');
        }
    }
    FlameSunburstTest.createWebGLView = createWebGLView;
})(FlameSunburstTest || (FlameSunburstTest = {}));
//# sourceMappingURL=flameSunburstTest.js.map