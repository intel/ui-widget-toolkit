/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />

module MinMaxValueTest {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    }

    export function createView() {
        let discreteXAxis: UWT.IAxisDescription = {
            scaleType: UWT.AxisType.Ordinal,
            label: 'test data',
            keys: ['data-0', 'data-1', 'data-2']
        };
        let leftAxis: UWT.IAxisDescription = {
            scaleType: UWT.AxisType.Linear,
            label: 'Misc'
        };
        {
            let chart = {
                title: 'Min Max Values',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.MinMaxValue,
                    data: [
                        { x: 'abc', min: 0, max: 10, y: 3 },
                        { x: 'xyz', min: 4, max: 10, y: 4 },
                        { x: 'por', min: 5, max: 8, y: 7 }
                    ],
                    onClick: function (event: UWT.IEvent) {
                        console.log('click');
                        console.log(event);
                    },
                    contextMenuItems: [{
                        title: 'MinMaxMenuItem',
                        action(elem: any, data: any, index: any) {
                            console.log('index: ' + index);
                            console.log(data);
                            console.log(elem);
                        }
                    }]
                }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    }],
                isXContinuous: false]
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, undefined, 'group1');
        }
        {
            let chart = {
                title: 'Mixed Values',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.MinMaxValue,
                    data: [
                        { x: 'abc', min: -10, max: 10, y: 3 },
                        { x: 'xyz', min: 3, max: 10, y: 4 },
                        { x: 'por', min: -10, max: -3, y: -7 }
                    ],
                }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    }],
                isXContinuous: false
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, undefined, 'group1');
        }
        {
            let chart = {
                title: 'Negative Values',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.MinMaxValue,
                    data: [
                        { x: 'abc', min: -10, max: -4, y: -7 },
                        { x: 'xyz', min: -5, max: 0, y: -5 },
                        { x: 'por', min: -6, max: -3, y: -5 }
                    ],
                }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left
                    }],
                isXContinuous: false
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, undefined, 'group1');
        }
    }
}