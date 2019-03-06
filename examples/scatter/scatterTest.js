/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var ScatterTest;
(function (ScatterTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        var leftAxis2 = {
            scaleType: UWT.AxisType.Linear,
            label: 'Values2',
            scalingInfo: TestData.defaultScalingInfo
        };
        var rightAxis1 = {
            scaleType: UWT.AxisType.Linear,
            label: 'Values5'
        };
        {
            var lane = {
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
                        colors: { 'data-0': '#ff0000', 'data-1': '#00ff00', 'data-2': '#0000ff', def: '#ffff00', test: '#A020F0' }
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
            var lane = {
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
            var lane = {
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
            var lane = {
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
    }
    ScatterTest.createView = createView;
})(ScatterTest || (ScatterTest = {}));
//# sourceMappingURL=scatterTest.js.map