/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module AreaTest {
    window.onload = () => {
        TestBase.configureButtons();

        let chart: UWT.ICartesianChart = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                renderType: UWT.RenderType.Area,
                data: [{
                    name: 'testName',
                    rects: [{ x: 0, x1: 1, y: 0, y1: 1 },
                    { x: 3, x1: 4, y: 0, y1: 1 }],
                    css: new UWT.Css().setColor('red').setOpacity(.5)
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
                renderType: UWT.RenderType.Line,
                data: [{
                    name: 'testName',
                    rects: [{ x: 0, x1: 1, y: 0, y1: 1 },
                    { x: 3, x1: 4, y: 0, y1: 1 }],
                    css: new UWT.Css().setColor('red')
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
