/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module ArrowTest {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    }
    export function createView() {
        let chart: UWT.ICartesianChart = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                renderType: UWT.RenderType.DirectionalArrow,
                data: [{
                    name: 'data-' + 0, values: [
                        { x: 1, y: 123 },
                        { x: 2, y: 1 },
                        { x: 3, y: 200 }]
                }]
            }],
            isXContinuous: true
        }
        UWT.Chart.finalize(chart);
        TestBase.addElement(chart);

        let chart2: UWT.ICartesianChart = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                renderType: UWT.RenderType.DirectionalArrow,
                data: [{
                    name: 'data-' + 0, values: [
                        { x: 1, y: 123 },
                        { x: 2, y: 1 },
                        { x: 3, y: 200 },
                        { x: 4, y: 50 }]
                }]
            }],
            isXContinuous: true
        }
        UWT.Chart.finalize(chart2);
        TestBase.addElement(chart2, undefined, undefined, undefined, { enableSaveAsImage: true });
    }
};
