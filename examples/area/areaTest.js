/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var AreaTest;
(function (AreaTest) {
    var leftAxis = {
        scaleType: UWT.AxisType.Linear,
        label: 'Values1',
        scalingInfo: TestData.defaultScalingInfo
    };
    var leftAxis2 = {
        scaleType: UWT.AxisType.Linear,
        label: 'Values2',
        scalingInfo: TestData.MBRateScalingInfo,
        range: { min: 0, max: 10000 }
    };
    var percentAxis = {
        scaleType: UWT.AxisType.Linear,
        label: '',
        scalingInfo: {
            baseScale: { scalar: 1, units: '%', maxRange: Number.MAX_VALUE }
        },
        range: { min: 0, max: 100 }
    };
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        {
            var lane1 = {
                title: 'Alpha Area',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area,
                        css: new UWT.Css().setOpacity(.5),
                        data: new Array(0)
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis2,
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: true
            };
            var lane2 = {
                title: 'Stacked Area',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area | UWT.RenderType.Stacked,
                        data: new Array(0)
                    }],
                legends: [{ alignment: UWT.Alignment.Right }, { alignment: UWT.Alignment.Top }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: true
            };
            var lane3 = {
                title: 'Computed Residency',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area | UWT.RenderType.Stacked,
                        data: new Array(0),
                        interpolateType: UWT.InterpolateType.StepBefore,
                        decimator: new UWT.ResidencyDecimator()
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: percentAxis,
                        alignment: UWT.Alignment.Left
                    }
                ],
                isXContinuous: true
            };
            var lane4 = {
                title: 'Stacked Summation',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area | UWT.RenderType.Stacked,
                        data: new Array(0),
                        decimator: new UWT.SummedValueMultiXYSeriesDecimator()
                    }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true
                    }
                ],
                legends: [{ alignment: UWT.Alignment.Right }],
                isXContinuous: true
            };
            for (var i = 0; i < TestData.xyDataSets.length; ++i) {
                lane1.dataSets[0].data.push({ name: 'data-' + i, values: TestData.xyDataSets[i] });
                lane2.dataSets[0].data.push({ name: 'data-' + i, values: TestData.xyDataSets[i] });
                lane3.dataSets[0].data.push({ name: 'data-' + i, values: TestData.xyDataSets[i] });
                lane4.dataSets[0].data.push({ name: 'data-' + i, values: TestData.xyDataSets[i] });
            }
            UWT.Chart.finalize(lane1);
            UWT.Chart.finalize(lane2);
            UWT.Chart.finalize(lane3);
            UWT.Chart.finalize(lane4);
            TestBase.addElement(lane1);
            TestBase.addElement(lane2);
            TestBase.addElement(lane3);
            TestBase.addElement(lane4);
        }
    }
    AreaTest.createView = createView;
})(AreaTest || (AreaTest = {}));
//# sourceMappingURL=areaTest.js.map