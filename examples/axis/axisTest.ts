/// <reference path='../../dist/index.d.ts' />

module AxisTest {

    let xAxis: UWT.IAxisDescription = {
        type: UWT.UIType.Axis,
        scaleType: UWT.AxisType.Linear,
        label: 'Time',
        scalingInfo: TestData.secScalingInfo,
        range: { min: 0, max: 10000 }
    };
    let xAxis2: UWT.IAxisDescription = {
        type: UWT.UIType.Axis,
        scaleType: UWT.AxisType.Linear,
        scalingInfo: TestData.secScalingInfo,
        range: { min: 0, max: 10000 }
    };

    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };

    export function createView() {

        TestBase.addElement({
            type: UWT.UIType.Axis,
            axisDesc: xAxis2,
            alignment: UWT.Alignment.Top
        }, '', 'axis1', 'axis1');

        TestBase.addElement({
            type: UWT.UIType.Axis,
            axisDesc: xAxis,
            alignment: UWT.Alignment.Bottom
        }, '', 'axis1', 'axis1');

        TestBase.addElement({
            type: UWT.UIType.Axis,
            axisDesc: xAxis2,
            alignment: UWT.Alignment.Top
        });
    }
}