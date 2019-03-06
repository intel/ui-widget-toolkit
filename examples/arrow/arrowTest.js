/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var ArrowTest;
(function (ArrowTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        var chart = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                    renderType: UWT.RenderType.DirectionalArrow,
                    data: [{
                            name: 'data-' + 0, values: [
                                { x: 1, y: 123 },
                                { x: 2, y: 1 },
                                { x: 3, y: 200 }
                            ]
                        }]
                }],
            isXContinuous: true
        };
        UWT.Chart.finalize(chart);
        TestBase.addElement(chart);
        var chart2 = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                    renderType: UWT.RenderType.DirectionalArrow,
                    data: [{
                            name: 'data-' + 0, values: [
                                { x: 1, y: 123 },
                                { x: 2, y: 1 },
                                { x: 3, y: 200 },
                                { x: 4, y: 50 }
                            ]
                        }]
                }],
            isXContinuous: true
        };
        UWT.Chart.finalize(chart2);
        TestBase.addElement(chart2, undefined, undefined, undefined, { enableSaveAsImage: true });
    }
    ArrowTest.createView = createView;
})(ArrowTest || (ArrowTest = {}));
;
//# sourceMappingURL=arrowTest.js.map