/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var RectTest;
(function (RectTest) {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        let chart = {
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
        let chart2 = {
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
        let chart3 = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                    renderType: UWT.RenderType.Line,
                    data: [{
                            name: 'testName',
                            rects: [{ x: 0, x1: 1, y: 0, y1: 1 }],
                            css: new UWT.Css().setColor('red').setOpacity(.5),
                            description: {
                                text: 'Right',
                                alignment: UWT.Alignment.Right
                            }
                        }]
                },
                {
                    renderType: UWT.RenderType.Line,
                    data: [{
                            name: 'testName2',
                            rects: [{ x: 3, x1: 4, y: 0, y1: 1 }],
                            css: new UWT.Css().setColor('red').setOpacity(.5),
                            description: {
                                text: 'Top',
                                alignment: UWT.Alignment.Top
                            }
                        }],
                }],
            axes: [
                {
                    axisDesc: {
                        scaleType: UWT.AxisType.Linear,
                        range: { min: 0, max: 2 }
                    },
                    alignment: UWT.Alignment.Left
                }
            ],
            isXContinuous: true
        };
        UWT.Chart.finalize(chart3);
        TestBase.addElement(chart3);
        let chart4 = {
            type: UWT.UIType.Cartesian,
            dataSets: [{
                    renderType: UWT.RenderType.Line,
                    data: [{
                            name: 'testName',
                            rects: [{ x: 0, x1: 1, y: 0, y1: 1 }],
                            css: new UWT.Css().setColor('red').setOpacity(.5),
                            description: {
                                text: 'Bottom',
                                alignment: UWT.Alignment.Bottom
                            }
                        }]
                },
                {
                    renderType: UWT.RenderType.Line,
                    data: [{
                            name: 'testName2',
                            rects: [{ x: 3, x1: 4, y: 0, y1: 1 }],
                            css: new UWT.Css().setColor('red').setOpacity(.5),
                            description: {
                                text: 'Left',
                                alignment: UWT.Alignment.Left
                            }
                        }]
                }],
            axes: [
                {
                    axisDesc: {
                        scaleType: UWT.AxisType.Linear,
                        range: { min: 0, max: 2 }
                    },
                    alignment: UWT.Alignment.Left
                }
            ],
            isXContinuous: true
        };
        UWT.Chart.finalize(chart4);
        TestBase.addElement(chart4);
    }
    RectTest.createView = createView;
})(RectTest || (RectTest = {}));
;
//# sourceMappingURL=rectTest.js.map