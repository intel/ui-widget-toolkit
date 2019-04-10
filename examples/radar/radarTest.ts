/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />

module RadarTest {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };

    export function createView() {
        {
            let radar1 = {
                title: 'Product1',
                type: UWT.UIType.Radar,
                data: [{
                    key: 'group1', data: [
                        { key: 'Sales', data: 42 },
                        { key: 'Marketing', data: 60 },
                        { key: 'Development', data: 32 },
                        { key: 'IT', data: 65 },
                        { key: 'Administration', data: 90 }
                    ]
                },
                {
                    key: 'group2', data: [
                        { key: 'Sales', data: 86 },
                        { key: 'Marketing', data: 34 },
                        { key: 'Development', data: 67 },
                        { key: 'IT', data: 56 },
                        { key: 'Administration', data: 90 }
                    ]
                }],
                onClick: function (event: UWT.IEvent) {
                    console.log('on click');
                    console.log(event);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('on double click');
                    console.log(event);
                },
                contextMenuItems: [{
                    title: 'RadarMenuItem',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Right }
            }

            TestBase.addElement(radar1, 'group2', 'group2', 'group2', {
                topMargin: 50, leftMargin: 50, rightMargin: 50
            });
        }

        {
            let radar1 = {
                title: 'Product2',
                type: UWT.UIType.Radar,
                data: [{
                    key: 'group1', data: [
                        { key: 'Sales', data: 42, units: 'units' },
                        { key: 'Marketing', data: 60, units: 'widgets' },
                        { key: 'Development', data: 32, units: '%' },
                        { key: 'IT', data: 65, units: 'tests' },
                        { key: 'Administration', data: 90, units: 'reports' },
                        { key: 'Misc', data: 65, units: 'count' },
                    ]
                },
                {
                    key: 'group2', data: [
                        { key: 'Sales', data: 86 },
                        { key: 'Marketing', data: 34 },
                        { key: 'Development', data: 67 },
                        { key: 'IT', data: 56 },
                        { key: 'Administration', data: 90 },
                        { key: 'Misc', data: 80 },
                    ],
                    units: '%'
                }],
                onClick: function (event: UWT.IEvent) {
                    console.log('on click');
                    console.log(event);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('on double click');
                    console.log(event);
                },
                contextMenuItems: [{
                    title: 'RadarMenuItem',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Bottom }
            }

            TestBase.addElement(radar1, undefined, undefined, undefined, {
                topMargin: 50, leftMargin: 50, rightMargin: 50
            });
        }

        {
            let radar1 = {
                title: 'Product2',
                type: UWT.UIType.Radar,
                data: [{
                    key: 'group1', data: [
                        { key: 'Sales', data: 42, units: 'units' },
                        { key: 'Marketing', data: 60, units: 'widgets' },
                        { key: 'Development', data: 32, units: '%' },
                        { key: 'IT', data: 65, units: 'tests' },
                        { key: 'Administration', data: 90, units: 'reports' },
                        { key: 'Misc', data: 65, units: 'count' },
                    ]
                },
                {
                    key: 'group2', data: [
                        { key: 'Sales', data: 86 },
                        { key: 'Marketing', data: 34 },
                        { key: 'Development', data: 67 },
                        { key: 'IT', data: 56 },
                        { key: 'Administration', data: 90 },
                        { key: 'Misc', data: 80 },
                    ],
                    units: '%'
                }],
                onClick: function (event: UWT.IEvent) {
                    console.log('on click');
                    console.log(event);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('on double click');
                    console.log(event);
                },
                contextMenuItems: [{
                    title: 'RadarMenuItem',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Right }
            }

            TestBase.addElement(radar1, undefined, undefined, undefined, {
                topMargin: 50, leftMargin: 50, rightMargin: 50,
                disableBackground: true
            });
        }
    }
}