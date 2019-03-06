/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var CounterAreaGraphTest;
(function (CounterAreaGraphTest) {
    var leftAxis = {
        scaleType: UWT.AxisType.Linear
    };
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        {
            var lane1 = {
                title: 'Summed Counter Values',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.Area,
                        data: new Array(0),
                        decimator: new UWT.SummedValueXYSeriesDecimator()
                    }],
                legends: [{ alignment: UWT.Alignment.Right }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left,
                        enableDynamicRange: true
                    }
                ],
                isXContinuous: true
            };
            lane1.dataSets[0].data.push({ name: 'data-0', values: TestData.xyDataSets[0] });
            UWT.Chart.finalize(lane1);
            TestBase.addElement(lane1);
        }
    }
    CounterAreaGraphTest.createView = createView;
})(CounterAreaGraphTest || (CounterAreaGraphTest = {}));
//# sourceMappingURL=counterAreaGraphTest.js.map