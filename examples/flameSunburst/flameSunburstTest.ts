/// <reference path='./data.ts' />
/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module FlameSunburstTest {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        createWebGLView();
        TestBase.render();
    }
    export function createView() {
        {
            let chart = {
                title: 'Flame Chart',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.FlameChart,
                    data: calltrace,
                    onClick: function (event: UWT.IEvent) {
                        console.log('flame chart click');
                        console.log(event);
                    },
                    contextMenuItems: [{
                        title: 'FlameMenuItem',
                        action(elem: any, data: any, index: any) {
                            console.log('index: ' + index);
                            console.log(data);
                            console.log(elem);
                        }
                    }]
                }],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', '', '', { forceSvgRenderer: true });
            TestBase.elemManager.addToHighlightGroup(chart, 'trace');
        }


        {
            let chart = {
                title: 'Sample Data',
                type: UWT.UIType.Sunburst,
                data: UWT.convertTraceToTrees(calltrace),
                onClick: function (event: UWT.IEvent) {
                    console.log('sunburst click');
                    console.log(event);
                }
            }

            TestBase.addElement(chart);
            TestBase.elemManager.addToHighlightGroup(chart, 'trace');
        }

        {
            let chart = {
                title: 'Trace Data',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.FlameChart,
                    data: trace,
                    onClick: function (event: UWT.IEvent) {
                        console.log('dl click');
                        console.log(event);
                    },
                    contextMenuItems: [{
                        title: 'Trace Menu Item',
                        action(elem: any, data: any, index: any) {
                            console.log('index: ' + index);
                            console.log(data);
                            console.log(elem);
                        }
                    }]
                }],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'group', '', { height: 30, forceSvgRenderer: true });
        }

        {
            let chart = {
                title: 'Trace Residency',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    disableWebWorkers: true,
                    renderType: UWT.RenderType.Area |
                        UWT.RenderType.Stacked,
                    data: trace
                }],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'group');
        }

        {
            let chart = {
                title: 'Trace State',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    disableWebWorkers: true,
                    renderType: UWT.RenderType.Line,
                    data: trace
                }],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', 'group');
        }
    }
    export function createWebGLView() {

        {
            let chart = {
                title: 'Flame Chart',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.FlameChart,
                    data: calltrace,
                    onClick: function (event: UWT.IEvent) {
                        console.log('flame chart click');
                        console.log(event);
                    },
                    contextMenuItems: [{
                        title: 'FlameMenuItem',
                        action(elem: any, data: any, index: any) {
                            console.log('index: ' + index);
                            console.log(data);
                            console.log(elem);
                        }
                    }]
                }],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart);
            TestBase.addElement(chart, '', '', '', { forceWebGLRenderer: true });
            TestBase.elemManager.addToHighlightGroup(chart, 'trace');
        }
    }
}
