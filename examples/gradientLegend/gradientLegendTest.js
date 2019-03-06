/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var GradientLegendTest;
(function (GradientLegendTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        var discreteXAxis = {
            scaleType: UWT.AxisType.Ordinal,
            label: 'test data',
            keys: ['data-0', 'data-1', 'data-2']
        };
        var leftAxis = {
            scaleType: UWT.AxisType.Linear,
            label: 'Misc'
        };
        {
            var chart = {
                title: '',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                        renderType: UWT.RenderType.BoxPlot,
                        data: [
                            { x: 'abc', min: 0, max: 10, y: 3, entry: 5, exit: 1 },
                            { x: 'xyz', min: 3, max: 10, y: 4.5, entry: 4, exit: 5 },
                            { x: 'por', min: 5, max: 8, y: 7, entry: 6, exit: 7.5 }
                        ],
                    }],
                axes: [
                    {
                        axisDesc: leftAxis,
                        alignment: UWT.Alignment.Left,
                        hidden: true
                    }
                ],
                legends: [{
                        alignment: UWT.Alignment.Right,
                        definition: {
                            type: UWT.LegendType.Gradient,
                            items: [
                                { key: 0, color: 'red' },
                                { key: 20, color: 'orange' },
                                { key: 40, color: 'yellow' },
                                { key: 60, color: 'green' },
                                { key: 80, color: 'blue' },
                                { key: 100, color: 'purple' }
                            ]
                        }
                    },
                    {
                        alignment: UWT.Alignment.Left,
                        definition: {
                            type: UWT.LegendType.Gradient,
                            items: [
                                { key: 0, color: 'red' },
                                { key: 20, color: 'orange' },
                                { key: 40, color: 'yellow' },
                                { key: 60, color: 'green' },
                                { key: 80, color: 'blue' },
                                { key: 100, color: 'purple' }
                            ]
                        }
                    },
                    {
                        alignment: UWT.Alignment.Top,
                        definition: {
                            type: UWT.LegendType.Gradient,
                            items: [
                                { key: 0, color: 'red' },
                                { key: 20, color: 'orange' },
                                { key: 40, color: 'yellow' },
                                { key: 60, color: 'green' },
                                { key: 80, color: 'blue' },
                                { key: 100, color: 'purple' }
                            ]
                        }
                    },
                    {
                        alignment: UWT.Alignment.Bottom,
                        definition: {
                            type: UWT.LegendType.Gradient,
                            items: [
                                { key: 0, color: 'red' },
                                { key: 20, color: 'orange' },
                                { key: 40, color: 'yellow' },
                                { key: 60, color: 'green' },
                                { key: 80, color: 'blue' },
                                { key: 100, color: 'purple' }
                            ]
                        }
                    }],
                isXContinuous: false
            };
            TestBase.addElement(chart, undefined, 'group1', undefined, { leftMargin: 90 });
        }
    }
    GradientLegendTest.createView = createView;
})(GradientLegendTest || (GradientLegendTest = {}));
//# sourceMappingURL=gradientLegendTest.js.map