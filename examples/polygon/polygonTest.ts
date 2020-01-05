/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />

module PolygonTest {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    }

    export function createView() {
        // lines
        let xAxis: UWT.IAxis = {
            axisDesc: {
                scaleType: UWT.AxisType.Linear,
                range: { min: 0, max: 100 }
            },
            alignment: UWT.Alignment.Bottom
        };
        let yAxis: UWT.IAxis = {
            axisDesc: {
                scaleType: UWT.AxisType.Linear,
                range: { min: 0, max: 100 }
            },
            alignment: UWT.Alignment.Left
        };

        {
            let chart = {
                title: 'Triangle',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.Line | UWT.RenderType.Raw,
                    data: [{
                        name: 'triangle', values: [
                            { x: 1, y: 10 },
                            { x: 40, y: 80 },
                            { x: 80, y: 10 },
                            { x: 1, y: 10 }]
                    }]
                }],
                axes: [xAxis, yAxis],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }

        {
            let chart = {
                title: 'Kite',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.Line | UWT.RenderType.Raw,
                    data: [{
                        name: 'kite', values: [
                            { x: 1, y: 25 },
                            { x: 20, y: 50 },
                            { x: 30, y: 25 },
                            { x: 20, y: 0 },
                            { x: 1, y: 25 }],

                    }, {
                        description: {
                            text: 'Test Polygon Text',
                            percentage: 10,
                            alignment: UWT.Alignment.Top
                        },
                        name: 'kite2', values: [
                            { x: 50, y: 25 },
                            { x: 60, y: 50 },
                            { x: 70, y: 25 },
                            { x: 60, y: 0 },
                            { x: 50, y: 25 }],

                    }]
                }],
                axes: [xAxis, yAxis],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }

        {
            let chart = {
                title: 'Star',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.Line | UWT.RenderType.Raw,
                    data: [{
                        name: 'star', values: [
                            { x: 10, y: 10 },
                            { x: 40, y: 60 },
                            { x: 70, y: 10 },
                            { x: 0, y: 40 },
                            { x: 80, y: 40 },
                            { x: 10, y: 10 }
                        ]
                    }]
                }],
                axes: [xAxis, yAxis],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart);
        }
    }
}