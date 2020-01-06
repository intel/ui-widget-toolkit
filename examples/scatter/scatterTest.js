/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var ScatterTest;
(function (ScatterTest) {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        let leftAxis2 = {
            scaleType: UWT.AxisType.Linear,
            label: 'Values2',
            scalingInfo: TestData.defaultScalingInfo
        };
        let rightAxis1 = {
            scaleType: UWT.AxisType.Linear,
            label: 'Values5'
        };
        {
            let lane = {
                title: 'Ordinal Y',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Scatter,
                        css: new UWT.Css().setOpacity(.5),
                        data: [
                            { name: TestData.scatterEvents[0], values: TestData.scatterData[0] },
                            { name: TestData.scatterEvents[1], values: TestData.scatterData[1] },
                            { name: TestData.scatterEvents[2], values: TestData.scatterData[2] },
                            { name: TestData.scatterEvents[3], values: TestData.scatterData[3] },
                            { name: TestData.scatterEvents[4], values: TestData.scatterData[4] }
                        ],
                        colors: { 'data-0': '#ff0000', 'data-1': '#00ff00', 'data-2': '#0000ff', def: '#ffff00', test: '#A020F0' },
                        onClick: function (event) {
                            console.log('scatter canvas click');
                            console.log(event);
                        },
                        onHover: function (event) {
                            console.log('scatter canvas hover');
                            console.log(event);
                        }
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [{
                        axisDesc: leftAxis2,
                        alignment: UWT.Alignment.Left
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(lane);
            TestBase.addElement(lane, 'group2', 'group2', 'redrawGroup2');
        }
        {
            let lane = {
                title: 'Scatter+Line',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{ name: 'data-' + 0, values: TestData.xyDataSets[1] }],
                        yAxisIdx: 0,
                    }, {
                        renderType: UWT.RenderType.Scatter,
                        data: [
                            { name: TestData.scatterEvents[0], values: TestData.scatterData[0], },
                            { name: TestData.scatterEvents[1], values: TestData.scatterData[1] },
                            { name: TestData.scatterEvents[2], values: TestData.scatterData[2] },
                            { name: TestData.scatterEvents[3], values: TestData.scatterData[3] },
                            { name: TestData.scatterEvents[4], values: TestData.scatterData[4] }
                        ],
                        yAxisIdx: 1,
                        colors: { 'data-0': '#ff0000', 'data-1': '#00ff00', 'data-2': '#0000ff', def: '#ffff00', test: '#A020F0' }
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [{
                        axisDesc: leftAxis2,
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: rightAxis1,
                        alignment: UWT.Alignment.Right
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(lane);
            TestBase.addElement(lane, 'group2', 'group2', 'redrawGroup2');
        }
        {
            let lane = {
                title: 'Same Scatter/Line',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Line,
                        data: [{ name: 'data-0', values: TestData.xyDataSets[0] }]
                    }, {
                        renderType: UWT.RenderType.Scatter,
                        data: [
                            { name: TestData.scatterEvents[0], values: TestData.xyDataSets[0] }
                        ],
                        colors: { 'data-0': '#ff0000' }
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [{
                        axisDesc: leftAxis2,
                        alignment: UWT.Alignment.Left
                    },],
                isXContinuous: true
            };
            UWT.Chart.finalize(lane);
            TestBase.addElement(lane, 'group2', 'group2', 'redrawGroup2');
        }
        {
            let lane = {
                title: 'One Data, Many Decimators',
                type: UWT.UIType.Cartesian,
                dataSets: [
                    {
                        renderType: UWT.RenderType.Scatter,
                        data: [
                            { name: TestData.scatterEvents[0], values: TestData.xyDataSets[0] }
                        ],
                        decimator: new UWT.MinPointDecimator(),
                        colors: { 'data-0': '#ff0000' }
                    },
                    {
                        renderType: UWT.RenderType.Scatter,
                        data: [
                            { name: TestData.scatterEvents[0], values: TestData.xyDataSets[0] }
                        ],
                        decimator: new UWT.AvgPointDecimator(),
                        colors: { 'data-0': '#00ff00' }
                    },
                    {
                        renderType: UWT.RenderType.Scatter,
                        data: [
                            { name: TestData.scatterEvents[0], values: TestData.xyDataSets[0] }
                        ],
                        decimator: new UWT.MaxPointDecimator(),
                        colors: { 'data-0': '#0000ff' }
                    }
                ],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [{
                        axisDesc: leftAxis2,
                        alignment: UWT.Alignment.Left
                    },],
                isXContinuous: true
            };
            UWT.Chart.finalize(lane);
            TestBase.addElement(lane);
        }
        {
            let plot = {
                title: 'Overlapping Text',
                type: UWT.UIType.Cartesian,
                dataSets: [
                    {
                        renderType: UWT.RenderType.Scatter,
                        data: [{
                                name: 'testData',
                                values: [
                                    { x: 3, y: 3, info: { title: 'foo' } },
                                    { x: 3.1, y: 3, info: { title: 'bar' } },
                                    { x: 3, y: 4, info: { title: 'abc' } }
                                ],
                                showTitleText: true
                            }],
                    }
                ],
                axes: [{
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            range: { min: 0, max: 10 }
                        },
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            range: { min: 0, max: 10 }
                        },
                        alignment: UWT.Alignment.Bottom
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(plot);
            TestBase.addElement(plot, '', '', '', { forceSvgRenderer: true });
        }
        {
            let plot = {
                title: 'Overlapping Text2',
                type: UWT.UIType.Cartesian,
                dataSets: [
                    {
                        renderType: UWT.RenderType.Scatter,
                        data: [{
                                name: 'testData',
                                values: [
                                    { x: 3, y: 3, info: { title: 'foo' } },
                                    { x: 3.1, y: 3, info: { title: 'bar' } },
                                    { x: 3.2, y: 3, info: { title: 'abc' } },
                                    { x: 3, y: 3.1, info: { title: 'xyz' } },
                                    { x: 3, y: 3.2, info: { title: '123' } },
                                    { x: 3, y: 3.3, info: { title: '456' } }
                                ],
                                showTitleText: true
                            }],
                        onClick: function (event) {
                            console.log('scatter svg click');
                            console.log(event);
                        },
                        onHover: function (event) {
                            console.log('scatter svg hover');
                            console.log(event);
                        }
                    }
                ],
                axes: [{
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            range: { min: 0, max: 10 }
                        },
                        alignment: UWT.Alignment.Left
                    },
                    {
                        axisDesc: {
                            scaleType: UWT.AxisType.Linear,
                            range: { min: 0, max: 10 }
                        },
                        alignment: UWT.Alignment.Bottom
                    }],
                isXContinuous: true
            };
            UWT.Chart.finalize(plot);
            TestBase.addElement(plot, '', '', '', { forceSvgRenderer: true });
        }
    }
    ScatterTest.createView = createView;
})(ScatterTest || (ScatterTest = {}));
//# sourceMappingURL=scatterTest.js.map