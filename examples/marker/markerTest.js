/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var LineTest;
(function (LineTest) {
    window.onload = function () {
        TestBase.configureButtons();
        var chart1 = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                    renderType: UWT.RenderType.Marker,
                    image: './down-triangle-small.png',
                    data: [
                        {
                            key: 'foo',
                            name: '1 - some misc text',
                            x: 1
                        },
                        {
                            key: 'foo',
                            name: '2 - some misc text',
                            x: 5
                        },
                        {
                            key: 'foo',
                            name: '3 - some misc text',
                            x: 10
                        }
                    ]
                }],
            isXContinuous: true
        };
        UWT.Chart.finalize(chart1);
        {
            var renderer = new UWT.D3ChartRenderer('div#graphArea0');
            renderer.invalidate(chart1);
        }
        TestBase.render();
    };
})(LineTest || (LineTest = {}));
//# sourceMappingURL=markerTest.js.map