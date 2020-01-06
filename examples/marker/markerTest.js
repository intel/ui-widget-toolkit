/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var MarkerTest;
(function (MarkerTest) {
    window.onload = () => {
        TestBase.configureButtons();
        let chart1 = {
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
        TestBase.addElement(chart1);
        TestBase.render();
    };
})(MarkerTest || (MarkerTest = {}));
//# sourceMappingURL=markerTest.js.map