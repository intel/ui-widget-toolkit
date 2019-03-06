/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var BarTest;
(function (BarTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        var discreteXAxis = {
            scaleType: UWT.AxisType.Ordinal,
            label: 'test data',
            keys: ['data-0', 'data-1', 'data-2']
        };
        var leftAxis = {
            scaleType: UWT.AxisType.Linear,
            label: 'Misc',
            scalingInfo: TestData.defaultScalingInfo
        };
        {
            var chart = {
                title: 'Basic Bar',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Bar,
                        data: [{
                                key: 'Summary',
                                data: { 'data-0': 10, 'data-1': 7, 'data-2': 17 }
                            }],
                        onClick: function (event) {
                            console.log('click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'BarMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }, {
                        renderType: UWT.RenderType.Line,
                        data: [{
                                name: 'Data1',
                                values: TestData.xyDiscreteData,
                                css: new UWT.Css().setColor('black')
                            }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: discreteXAxis,
                        alignment: UWT.Alignment.Bottom
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
        {
            var chart = {
                title: 'Multi Bar',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Bar,
                        data: [
                            { key: 'data-0', data: { tony: 10, jak: 15, michelle: 7 } },
                            { key: 'data-1', data: { tony: 5, jak: 21, michelle: 3 } },
                            { key: 'data-2', data: { tony: 15, jak: 4, michelle: 10 } }
                        ],
                        css: new UWT.Css().setOpacity(.5),
                        colors: { tony: 'red', jak: 'blue', michelle: 'green' },
                        onClick: function (event) {
                            console.log('click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'BarMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }, {
                        renderType: UWT.RenderType.Line,
                        data: [{
                                name: 'Data1',
                                values: TestData.xyDiscreteData,
                                css: new UWT.Css().setColor('black')
                            }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: discreteXAxis,
                        alignment: UWT.Alignment.Bottom
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
        {
            var chart = {
                title: 'Stacked Bar',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Bar | UWT.RenderType.Stacked,
                        data: [
                            { key: 'data-0', data: { tony: 10, jak: 15, michelle: 7 } },
                            { key: 'data-1', data: { tony: 5, jak: 21, michelle: 3 } },
                            { key: 'data-2', data: { tony: 15, jak: 4, michelle: 10 } }
                        ],
                        css: new UWT.Css().setOpacity(.5),
                        colors: { tony: 'red', jak: 'blue', michelle: 'green' },
                        onClick: function (event) {
                            console.log('click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'BarMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }, {
                        renderType: UWT.RenderType.Line,
                        data: [{
                                name: 'Data1',
                                values: TestData.xyDiscreteData,
                                css: new UWT.Css().setColor('black')
                            }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: discreteXAxis,
                        alignment: UWT.Alignment.Bottom
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
        {
            // invert this data to get below
            var data = [
                {
                    key: 'QRW',
                    data: [{
                            key: 'ww44',
                            data: [
                                { key: 'ABC', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 26, 'Not Yet Tested/WIP': 0 } },
                                { key: 'XYZ', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 9, 'Not Yet Tested/WIP': 1 } },
                                { key: '123', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 11, 'Not Yet Tested/WIP': 0 } },
                                { key: 'TEST', data: { 'Failing': 8, 'Workaround': 0, 'Passing': 4, 'Not Yet Tested/WIP': 24 } }
                            ]
                        }, {
                            key: 'ww47',
                            data: [
                                { key: 'ABC', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 26, 'Not Yet Tested/WIP': 0 } },
                                { key: 'XYZ', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 9, 'Not Yet Tested/WIP': 1 } },
                                { key: '123', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 19, 'Not Yet Tested/WIP': 0 } },
                                { key: 'TEST', data: { 'Failing': 8, 'Workaround': 0, 'Passing': 4, 'Not Yet Tested/WIP': 24 } }
                            ]
                        }, {
                            key: 'ww49',
                            data: [
                                { key: 'ABC', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 26, 'Not Yet Tested/WIP': 0 } },
                                { key: 'XYZ', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 7, 'Not Yet Tested/WIP': 3 } },
                                { key: '123', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 22, 'Not Yet Tested/WIP': 1 } },
                                { key: 'TEST', data: { 'Failing': 8, 'Workaround': 0, 'Passing': 4, 'Not Yet Tested/WIP': 24 } }
                            ]
                        }]
                },
                {
                    key: 'XPQ',
                    data: [{
                            key: 'ww44',
                            data: [
                                { key: 'ABC', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 26, 'Not Yet Tested/WIP': 0 } },
                                { key: 'XYZ', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 9, 'Not Yet Tested/WIP': 1 } },
                                { key: '123', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 11, 'Not Yet Tested/WIP': 0 } },
                                { key: 'TEST', data: { 'Failing': 8, 'Workaround': 0, 'Passing': 4, 'Not Yet Tested/WIP': 24 } }
                            ]
                        }, {
                            key: 'ww47',
                            data: [
                                { key: 'ABC', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 26, 'Not Yet Tested/WIP': 0 } },
                                { key: 'XYZ', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 9, 'Not Yet Tested/WIP': 1 } },
                                { key: '123', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 19, 'Not Yet Tested/WIP': 0 } },
                                { key: 'TEST', data: { 'Failing': 8, 'Workaround': 0, 'Passing': 4, 'Not Yet Tested/WIP': 24 } }
                            ]
                        }, {
                            key: 'ww49',
                            data: [
                                { key: 'ABC', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 26, 'Not Yet Tested/WIP': 0 } },
                                { key: 'XYZ', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 7, 'Not Yet Tested/WIP': 3 } },
                                { key: '123', data: { 'Failing': 0, 'Workaround': 0, 'Passing': 22, 'Not Yet Tested/WIP': 1 } },
                                { key: 'TEST', data: { 'Failing': 8, 'Workaround': 0, 'Passing': 4, 'Not Yet Tested/WIP': 24 } }
                            ]
                        }]
                }
            ];
            var chart7 = {
                title: 'Multi X Axis',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        onClick: function (event) {
                            console.log('click');
                            console.log(event);
                        },
                        onDoubleClick: function (event) {
                            console.log('double click');
                            console.log(event);
                        },
                        renderType: UWT.RenderType.Bar | UWT.RenderType.Stacked,
                        data: UWT.transposeKeys(data),
                        colors: { 'Failing': 'red', 'Workaround': 'yellow', 'Passing': 'green', 'Not Yet Tested/WIP': 'gray' },
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            label: 'Event Count',
                            scalingInfo: { baseScale: { maxRange: Number.MAX_VALUE, scalar: 1, units: 'unit' } },
                            range: { min: 0, max: 40 }
                        },
                        alignment: UWT.Alignment.Left,
                        options: { tickCount: 2 }
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart7);
            TestBase.addElement(chart7);
            var chart8 = {
                title: 'Rotated X Axis',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        onClick: function (event) {
                            console.log('click');
                            console.log(event);
                        },
                        onDoubleClick: function (event) {
                            console.log('double click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'BarMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }],
                        renderType: UWT.RenderType.Bar,
                        data: [{
                                "key": "1400EFBAC",
                                "data": {
                                    "values": 9.39114761352539
                                }
                            },
                            {
                                "key": "1400C3AA1",
                                "data": {
                                    "values": 7.648857116699219
                                }
                            },
                            {
                                "key": "14006B943",
                                "data": {
                                    "values": 7.529345512390137
                                }
                            },
                            {
                                "key": "140098079",
                                "data": {
                                    "values": 7.111394882202148
                                }
                            },
                            {
                                "key": "1400EFC02",
                                "data": {
                                    "values": 6.894670486450195
                                }
                            },
                            {
                                "key": "14006B9D8",
                                "data": {
                                    "values": 6.463128089904785
                                }
                            },
                            {
                                "key": "1400C4427",
                                "data": {
                                    "values": 5.79788064956665
                                }
                            },
                            {
                                "key": "14006A940",
                                "data": {
                                    "values": 5.598132610321045
                                }
                            },
                            {
                                "key": "14011C39E",
                                "data": {
                                    "values": 4.662887096405029
                                }
                            },
                            {
                                "key": "14006B4B6",
                                "data": {
                                    "values": 4.364014625549316
                                }
                            },
                            {
                                "key": "14011BA8F",
                                "data": {
                                    "values": 4.274649620056152
                                }
                            },
                            {
                                "key": "140069CE7",
                                "data": {
                                    "values": 4.165968894958496
                                }
                            },
                            {
                                "key": "1400C2D80",
                                "data": {
                                    "values": 4.130097389221191
                                }
                            },
                            {
                                "key": "14011CFBE",
                                "data": {
                                    "values": 3.829312562942505
                                }
                            },
                            {
                                "key": "14011CDC5",
                                "data": {
                                    "values": 3.768603563308716
                                }
                            },
                            {
                                "key": "1400D3294",
                                "data": {
                                    "values": 3.208218812942505
                                }
                            },
                            {
                                "key": "14011CCDE",
                                "data": {
                                    "values": 2.9766316413879395
                                }
                            },
                            {
                                "key": "14011CAC0",
                                "data": {
                                    "values": 2.8938472270965576
                                }
                            },
                            {
                                "key": "14011C995",
                                "data": {
                                    "values": 2.887054681777954
                                }
                            },
                            {
                                "key": "14011C8D5",
                                "data": {
                                    "values": 2.8851442337036133
                                }
                            }],
                    }],
                isXContinuous: false,
                axes: [{
                        axisDesc: { scaleType: UWT.AxisType.Ordinal, keys: [] },
                        alignment: UWT.Alignment.Bottom,
                        options: {
                            rotateText: true,
                            enableOrdinalBrushSelection: true,
                            tickMappingFunc: function (value) {
                                if (value === 'vpxdec.exe') {
                                    return 'testValue';
                                }
                                return value;
                            }
                        }
                    }]
            };
            UWT.Chart.finalize(chart8);
            TestBase.addElement(chart8);
        }
        {
            var chart = {
                title: 'Negative 2Values',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Bar,
                        data: [
                            {
                                key: 'abc',
                                data: { 'abc': -10, 'xyz': -7, 'por': 3 }
                            }
                        ],
                        colors: { abc: 'red', xyz: 'blue', por: 'green' }
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
        {
            var chart = {
                title: 'Negative Multi Group',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Bar,
                        data: [
                            { key: 'data-0', data: { tony: 10, jak: -15, michelle: 7 } },
                            { key: 'data-1', data: { tony: -5, jak: 21, michelle: 3 } },
                            { key: 'data-2', data: { tony: 15, jak: -5, michelle: -20 } }
                        ],
                        css: new UWT.Css().setOpacity(.5),
                        colors: { tony: 'red', jak: 'blue', michelle: 'green' },
                        onClick: function (event) {
                            console.log('click');
                            console.log(event);
                        },
                        contextMenuItems: [{
                                title: 'BarMenuItem',
                                action: function (elem, data, index) {
                                    console.log('index: ' + index);
                                    console.log(data);
                                    console.log(elem);
                                }
                            }]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: discreteXAxis,
                        alignment: UWT.Alignment.Bottom
                    }
                ],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
        {
            var chart = {
                title: 'Single Bar',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Bar,
                        data: [
                            { key: 'data-0', data: { 'data-0': 15 } }
                        ]
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                isXContinuous: false
            };
            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, 'group1', 'group1');
        }
    }
    BarTest.createView = createView;
})(BarTest || (BarTest = {}));
//# sourceMappingURL=barTest.js.map