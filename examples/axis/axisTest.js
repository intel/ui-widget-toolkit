/// <reference path='../../dist/index.d.ts' />
var AxisTest;
(function (AxisTest) {
    var xAxis = {
        type: UWT.UIType.Axis,
        scaleType: UWT.AxisType.Linear,
        label: 'Time',
        scalingInfo: TestData.secScalingInfo,
        range: { min: 0, max: 10000 }
    };
    var xAxis2 = {
        type: UWT.UIType.Axis,
        scaleType: UWT.AxisType.Linear,
        scalingInfo: TestData.secScalingInfo,
        range: { min: 0, max: 10000 }
    };
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        TestBase.addElement({
            type: UWT.UIType.Axis,
            axisDesc: xAxis2,
            alignment: UWT.Alignment.Top
        }, '', 'axis1', 'axis1');
        TestBase.addElement({
            type: UWT.UIType.Axis,
            axisDesc: xAxis,
            alignment: UWT.Alignment.Bottom,
            onZoom: function (event) {
                console.log(event);
            }
        }, '', 'axis1', 'axis1');
        TestBase.addElement({
            type: UWT.UIType.Axis,
            axisDesc: xAxis2,
            alignment: UWT.Alignment.Top
        });
    }
    AxisTest.createView = createView;
})(AxisTest || (AxisTest = {}));
//# sourceMappingURL=axisTest.js.map