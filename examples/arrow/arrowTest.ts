/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module ArrowTest {
    window.onload = () => {
        TestBase.configureButtons();

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
        TestBase.elemManager.addElement(chart);

        let renderer = new UWT.D3ChartRenderer('div#graphArea0');
        renderer.invalidate(chart);

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
        TestBase.elemManager.addElement(chart2);

        let renderer2 = new UWT.D3ChartRenderer('div#graphArea1');
        renderer.invalidate(chart2);
    }
};
