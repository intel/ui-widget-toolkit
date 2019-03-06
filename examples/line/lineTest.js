/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var LineTest;
(function (LineTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        {
            // lines
            var bottomAxis = {
                scaleType: UWT.AxisType.Linear,
                label: 'Time',
                scalingInfo: TestData.secScalingInfo
            };
            var left = {
                scaleType: UWT.AxisType.Linear,
                label: 'Time',
                scalingInfo: TestData.secScalingInfo
            };
            var chart = {
                title: 'Step Graph',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        interpolateType: UWT.InterpolateType.StepBefore,
                        data: [{ name: 'data-' + 0, values: TestData.xyDataSets[0] }],
                        xAxisIdx: 0,
                        yAxisIdx: 1
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: bottomAxis,
                        alignment: UWT.Alignment.Bottom
                    },
                    {
                        axisDesc: left,
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }
        {
            var chart = {
                title: 'Sync Data',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{
                                name: 'data-' + 0, values: [
                                    { x: 1, y: 123 },
                                    { x: 2, y: 1 },
                                    { x: 3, y: 200 }
                                ]
                            }]
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }
        {
            var chart = {
                title: 'Stacked Line',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line | UWT.RenderType.Stacked,
                        data: new Array(0)
                    }],
                legends: [{ alignment: UWT.Alignment.Top }, { alignment: UWT.Alignment.Right }],
                isXContinuous: true
            };
            for (var i = 0; i < TestData.xyDataSets.length; ++i) {
                chart.dataSets[0].data.push({ name: 'data-' + i, values: TestData.xyDataSets[i] });
            }
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }
        {
            // lines
            var chart = {
                title: 'Logarithmic Y',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{ name: 'data-' + 0, values: TestData.xyDataSets[0] }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Logarithmic,
                            label: 'Values4',
                            scalingInfo: TestData.defaultScalingInfo
                        },
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group3', 'group3');
        }
        {
            // lines
            var chart = {
                title: 'Y',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{ name: 'data-' + 0, values: TestData.xyDataSets[0] }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            label: 'Time',
                            scalingInfo: TestData.secScalingInfo
                        },
                        alignment: UWT.Alignment.Bottom
                    },
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            label: 'Values 2',
                            scalingInfo: TestData.defaultScalingInfo
                        },
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group3', 'group3');
        }
        {
            // lines
            var chart = {
                title: 'Ordinal X',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{
                                description: 'Test Description Along a Line',
                                name: 'Data1',
                                values: TestData.xyDiscreteData
                            }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Ordinal,
                            keys: ['data-0', 'data-1', 'data-2']
                        },
                        alignment: UWT.Alignment.Bottom
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
        {
            var chart1 = {
                title: 'Text',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                description: 'Test Description Along a Line',
                                descriptionPosition: {
                                    percentage: 10,
                                    alignment: UWT.Alignment.Bottom
                                },
                                name: 'data1',
                                values: [
                                    { x: 1, y: 123 },
                                    { x: 2, y: 1 },
                                    { x: 2, y: 200 },
                                    { x: 3, y: 200 }
                                ]
                            }
                        ]
                    }],
                contextMenuItems: [
                    {
                        title: 'Test',
                        submenu: [{
                                title: 'Test4',
                                action: function (elem, data, index) {
                                    console.log(data);
                                }
                            }, {
                                title: 'Test5',
                                action: function (elem, data, index) {
                                    console.log(data);
                                }
                            }]
                    }, {
                        title: 'Test2',
                        action: function (elem, data, index) {
                            console.log(data);
                        }
                    }
                ],
                brushContextMenuItems: [{
                        title: 'Test',
                        action: function (elem, data, index) {
                            console.log(data);
                        }
                    }, {
                        title: 'Test2',
                        action: function (elem, data, index) {
                            console.log(data);
                        }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart1);
            var chart2 = {
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data2',
                                values: [
                                    { x: 1, y: 100 },
                                    { x: 2, y: 200 },
                                    { x: 3, y: 50 }
                                ]
                            }
                        ]
                    }],
                axes: [{
                        alignment: UWT.Alignment.Bottom,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }, {
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart2);
            var merged = UWT.Chart.mergeCharts('testCategory', 'merged', chart1, chart2);
            TestBase.addElement(chart1);
            TestBase.addElement(chart2);
            TestBase.addElement(merged);
            var chart3 = {
                title: 'Function Graph',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data4',
                                functionMap: {
                                    y: function (x) { return x * x; },
                                    xMin: 0,
                                    xMax: 10,
                                    yMin: 0,
                                    yMax: 100
                                }
                            }
                        ]
                    }],
                axes: [{
                        alignment: UWT.Alignment.Bottom,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }, {
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart3);
            TestBase.addElement(chart3);
            var chart4 = {
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data2',
                                values: [
                                    { x: 1, y: 100 },
                                    { x: 2, y: 90 },
                                    { x: 10, y: 50 }
                                ]
                            }
                        ]
                    },
                    {
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data4',
                                functionMap: {
                                    y: function (x) { return x * x; }
                                }
                            }
                        ]
                    }],
                axes: [{
                        alignment: UWT.Alignment.Bottom,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }, {
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart4);
            TestBase.addElement(chart4);
            var chart5 = {
                title: 'Multiple Axes',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data2',
                                values: [
                                    { x: 1, y: 100 },
                                    { x: 2, y: 200 },
                                    { x: 3, y: 50 }
                                ]
                            }
                        ],
                        yAxisIdx: 1,
                        xAxisIdx: 0
                    },
                    {
                        xAxisIdx: 0,
                        yAxisIdx: 2,
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data',
                                values: [
                                    { x: 1, y: 18 },
                                    { x: 2, y: 30 },
                                    { x: 3, y: 50 }
                                ]
                            }
                        ]
                    }, {
                        xAxisIdx: 0,
                        yAxisIdx: 3,
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data3',
                                values: [
                                    { x: 1, y: 1 },
                                    { x: 2, y: 2 },
                                    { x: 3, y: 3 }
                                ]
                            }
                        ]
                    }, {
                        xAxisIdx: 0,
                        yAxisIdx: 4,
                        renderType: UWT.RenderType.Line,
                        data: [
                            {
                                name: 'data4',
                                values: [
                                    { x: 1, y: 100 },
                                    { x: 2, y: 80 },
                                    { x: 3, y: 1 }
                                ]
                            }
                        ]
                    }],
                axes: [{
                        alignment: UWT.Alignment.Bottom,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }, {
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }, {
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    },
                    {
                        alignment: UWT.Alignment.Right,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }, {
                        alignment: UWT.Alignment.Right,
                        enableDynamicRange: true,
                        axisDesc: { scaleType: UWT.AxisType.Linear }
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart5);
            TestBase.addElement(chart5);
        }
        {
            var chart = {
                title: 'Logarithmic X',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{
                                name: 'data-' + 0, values: [
                                    { x: .001, y: 1 },
                                    { x: 10, y: 100 },
                                    { x: 100, y: 250 },
                                    { x: 1000000, y: 200 }
                                ]
                            }],
                    }],
                axes: [
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Logarithmic,
                            label: 'Log X'
                        },
                        alignment: UWT.Alignment.Bottom
                    }
                ],
                isXContinuous: true
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }
    }
    LineTest.createView = createView;
})(LineTest || (LineTest = {}));
//# sourceMappingURL=lineTest.js.map