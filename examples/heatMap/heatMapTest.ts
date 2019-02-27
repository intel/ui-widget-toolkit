/// <reference path='../../dist/index.d.ts' />
/// <reference path='./data.ts' />
/// <reference path='../testBase.ts' />

module HeatMapTest {
    window.onload = () => {
        TestBase.configureButtons();
        createBasicTest();
        createView();
        TestBase.render();
    }

    export function createBasicTest() {
        let gradient = [{ key: 0, color: '#FF0000' },
        { key: 20, color: '#FFA500' },
        { key: 40, color: '#FFFF00' },
        { key: 60, color: '#00FF00' },
        { key: 80, color: '#0000FF' },
        { key: 100, color: '#7F00FF' }];
        {
            let chart = {
                title: 'Test 1',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.HeatMap,
                    data: [
                        { x: 0, x1: 1, dx: 1, y: 'foo', value: 50 },
                        { x: 0, x1: 1, dx: 1, y: 'bar', value: 23 },
                        { x: 1.5, x1: 2, dx: .5, y: 'foo', value: 99 },
                        { x: 1, x1: 1.5, dx: .5, y: 'foo', value: 0 },
                        { x: 1, x1: 2, dx: 1, y: 'bar', value: 79 }
                    ],
                    gradient: gradient
                }],
                legends: [{
                    alignment: UWT.Alignment.Right,
                    definition: {
                        type: UWT.LegendType.Gradient,
                        items: gradient
                    }
                }],
                isXContinuous: true
            }

            UWT.Chart.finalize(chart as any);
            TestBase.addElement(chart, undefined, 'group1');
        }

        {
            let chart = {
                title: 'Test 2',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.HeatMap,
                    data: [
                        {
                            name: 'HeatMapTest',
                            values: [
                                { x: 'a', y: 'foo', value: 50 },
                                { x: 'a', y: 'bar', value: 23 },
                                { x: 'b', y: 'foo', value: 99 },
                                { x: 'b', y: 'bar', value: 21 },
                                { x: 'c', y: 'foo', value: 0 },
                                { x: 'c', y: 'bar', value: 79 }]
                        }
                    ],
                    gradient: gradient
                }],
                legends: [{
                    alignment: UWT.Alignment.Right,
                    definition: {
                        type: UWT.LegendType.Gradient,
                        items: gradient
                    }
                }],
                isXContinuous: false
            }

            UWT.Chart.finalize(chart as any);
            TestBase.addElement(chart, undefined, 'group1');
        }
    }

    export function createView() {
        let data = [];
        let rows = 256;
        let columns = 256;
        let scalar = 1 / (rows * columns) * 100;
        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < columns; ++j) {
                data.push({ x: i, y: j, value: i * j * scalar })
            }
        }
        {
            let chart = {
                title: 'Test 3',
                type: UWT.UIType.Cartesian,
                dataSets: [{
                    renderType: UWT.RenderType.HeatMap,
                    data: [
                        {
                            name: 'HeatMapTest3',
                            values: data
                        }
                    ],
                    gradient: gradient2
                }],
                legends: [{
                    alignment: UWT.Alignment.Right,
                    definition: {
                        type: UWT.LegendType.Gradient,
                        items: gradient2
                    }
                }],
                isXContinuous: false
            }

            UWT.Chart.finalize(chart as any);
            TestBase.addElement(chart, undefined, 'group1', undefined, { height: 400, width: 600 });
        }
    }
}