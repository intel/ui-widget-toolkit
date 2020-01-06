/// <reference path='./data.ts' />
/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var FlameSunburstTest;
(function (FlameSunburstTest) {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        createWebGLView();
        TestBase.render();
    };
    function createView() {
        {
            let rectLimitDecimator = new UWT.FlameChartRectLimitDecimator();
            rectLimitDecimator.setRectLimit(10);
            let chart = {
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
                        onDoubleClick: (event) => {
                            console.log('flame chart double click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'FlameMenuItem',
                                action(elem, data, index) {
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
            let chart = {
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
            let chart = {
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
                                action(elem, data, index) {
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
            let chart = {
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
            let chart = {
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
            let chart = {
                title: 'Trace Sparse',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.FlameChart,
                        data: trace2,
                        onClick: (event) => {
                            console.log(event);
                        },
                        onDoubleClick: (event) => {
                            console.log(event);
                        }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'trace2');
        }
        {
            let chart = {
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
            let chart = {
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
            let chart = {
                title: 'Flame Chart',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.FlameChart,
                        data: calltrace,
                        onClick: function (event) {
                            console.log('flame chart click');
                            console.log(event);
                        },
                        onDoubleClick: (event) => {
                            console.log('flame chart double click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'FlameMenuItem',
                                action(elem, data, index) {
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
        {
            let chart = {
                title: 'Direct Stack Load',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.FlameChart,
                        data: trace3,
                        contextMenuItems: [{
                                title: 'FlameMenuItem',
                                action(elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', '', '', {});
        }
    }
    FlameSunburstTest.createWebGLView = createWebGLView;
})(FlameSunburstTest || (FlameSunburstTest = {}));
//# sourceMappingURL=flameSunburstTest.js.map