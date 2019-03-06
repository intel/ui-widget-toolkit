/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var AreaTest;
(function (AreaTest) {
    window.onload = function () {
        TestBase.configureButtons();
        var chart = {
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
        };
        UWT.Chart.finalize(chart);
        TestBase.addElement(chart);
        var renderer = new UWT.D3ChartRenderer('div#graphArea0');
        renderer.invalidate(chart);
        var chart2 = {
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
        };
        UWT.Chart.finalize(chart2);
        TestBase.addElement(chart2);
        var renderer2 = new UWT.D3ChartRenderer('div#graphArea1');
        renderer.invalidate(chart2);
    };
})(AreaTest || (AreaTest = {}));
;
//# sourceMappingURL=rectTest.js.map