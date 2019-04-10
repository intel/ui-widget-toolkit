/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />

module PieTest {
    window.onload = () => {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };

    export function createView() {
        {
            let pie1 = {
                title: 'Summary',
                type: UWT.UIType.Pie,
                data: { 'data@-0': 10, 'data-\%1': 7, 'data-2': 17 },
                onClick: function (event: UWT.IEvent) {
                    console.log('pie click');
                    console.log(event);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('pie double click');
                    console.log(event);
                },
                contextMenuItems: [{
                    title: 'PieMenuItem',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Right }
            }

            TestBase.addElement(pie1, 'group2', 'group2');
        }

        {
            let pie1 = {
                title: 'Summary',
                type: UWT.UIType.Pie,
                data: { 'data@-0': 10, 'data-\%1': 7, 'data-2': 17 },
                onClick: function (event: UWT.IEvent) {
                    console.log('pie click');
                    console.log(event);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('pie double click');
                    console.log(event);
                },
                contextMenuItems: [{
                    title: 'PieMenuItem',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Bottom },
                innerRadius: .5
            }

            TestBase.addElement(pie1, 'group2', 'group2');
        }
    }
}