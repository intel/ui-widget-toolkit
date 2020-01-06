/// <reference path='../../dist/index.d.ts' />
var AxisTest;
(function (AxisTest) {
    let xAxis = {
        scaleType: UWT.AxisType.Linear,
        label: 'Time',
        scalingInfo: TestData.secScalingInfo,
        range: { min: 0, max: 10000 }
    };
    let xAxis2 = {
        scaleType: UWT.AxisType.Linear,
        scalingInfo: TestData.secScalingInfo,
        range: { min: 0, max: 10000 }
    };
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        let axis1 = {
            type: UWT.UIType.Axis,
            axisDesc: xAxis2,
            alignment: UWT.Alignment.Top
        };
        let axis2 = {
            type: UWT.UIType.Axis,
            axisDesc: xAxis,
            alignment: UWT.Alignment.Bottom
        };
        let axis3 = {
            type: UWT.UIType.Axis,
            axisDesc: xAxis2,
            alignment: UWT.Alignment.Top
        };
        TestBase.addElement(axis1, '', 'axis1', 'axis1');
        TestBase.addElement(axis2, '', 'axis1', 'axis1');
        TestBase.addElement(axis3);
    }
    AxisTest.createView = createView;
})(AxisTest || (AxisTest = {}));
//# sourceMappingURL=axisTest.js.map