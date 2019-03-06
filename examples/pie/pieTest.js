/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
/// <reference path='../testData.ts' />
var PieTest;
(function (PieTest) {
    window.onload = function () {
        TestBase.configureButtons();
        createView();
        TestBase.render();
    };
    function createView() {
        {
            var pie1 = {
                title: 'Summary',
                type: UWT.UIType.Pie,
                data: { 'data@-0': 10, 'data-\%1': 7, 'data-2': 17 },
                onClick: function (event) {
                    console.log('pie click');
                    console.log(event);
                },
                onDoubleClick: function (event) {
                    console.log('pie double click');
                    console.log(event);
                },
                contextMenuItems: {
                    title: 'PieMenuItem',
                    action: function (elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                },
                legend: { alignment: UWT.Alignment.Right }
            };
            TestBase.addElement(pie1, 'group2', 'group2');
        }
        {
            var pie1 = {
                title: 'Summary',
                type: UWT.UIType.Pie,
                data: { 'data@-0': 10, 'data-\%1': 7, 'data-2': 17 },
                onClick: function (event) {
                    console.log('pie click');
                    console.log(event);
                },
                onDoubleClick: function (event) {
                    console.log('pie double click');
                    console.log(event);
                },
                contextMenuItems: {
                    title: 'PieMenuItem',
                    action: function (elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                },
                legend: { alignment: UWT.Alignment.Bottom },
                innerRadius: .5
            };
            TestBase.addElement(pie1, 'group2', 'group2');
        }
    }
    PieTest.createView = createView;
})(PieTest || (PieTest = {}));
//# sourceMappingURL=pieTest.js.map