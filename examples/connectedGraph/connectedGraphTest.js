/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var ConnectedGraphTest;
(function (ConnectedGraphTest) {
    window.onload = function () {
        createView();
        TestBase.render();
    };
    function createView() {
        var flow = {
            type: UWT.UIType.FlowDiagram,
            nodes: [
                { key: 'data-0', type: ['group1'] },
                { key: 'data-1', type: ['group1'] }
            ],
            links: [
                { from: 'data-0', to: 'data-2', value: 1 },
                { from: 'data-1', to: 'data-2', value: 1 },
                { from: 'data-1', to: 'data-3', value: 1 },
                { from: 'data-0', to: 'data-4', value: 1 },
                { from: 'data-2', to: 'data-3', value: 1 },
                { from: 'data-2', to: 'data-4', value: 1 },
                { from: 'data-3', to: 'data-4', value: 3 }
            ],
            onClick: function (event) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                    title: 'GraphMenuItem',
                    action: function (elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
            legend: { alignment: UWT.Alignment.Top }
        };
        TestBase.addElement(flow, 'group', 'group2');
        var forceGraph = {
            type: UWT.UIType.ForceDirectedGraph,
            links: [
                { from: 'data-0', to: 'data-2', value: 1 },
                { from: 'data-1', to: 'data-2', value: 1 },
                { from: 'data-1', to: 'data-3', value: 1 },
                { from: 'data-0', to: 'data-4', value: 1 },
                { from: 'data-2', to: 'data-3', value: 1 },
                { from: 'data-2', to: 'data-4', value: 1 },
                { from: 'data-3', to: 'data-4', value: 3 }
            ],
            onClick: function (event) {
                console.log('graph click');
                console.log(event.data);
            },
            onDoubleClick: function (event) {
                console.log('graph double click');
                console.log(event.data);
            },
            legend: { alignment: UWT.Alignment.Right }
        };
        TestBase.addElement(forceGraph, 'group2', 'group2');
        var nodes = [
            { key: 'data-0', type: ['group1'], x: 10, y: 10 },
            { key: 'data-1', type: ['group1'], x: 20, y: 20 },
            { key: 'data-2', type: ['group2'], x: 564, y: 43 },
            { key: 'data-3', type: ['group2'], x: 455, y: 162 },
            { key: 'data-4', type: ['group2'], x: 87, y: 241 },
            { key: 'data-5', type: ['group2'], x: 65, y: 61 }
        ];
        var preproc = {
            type: UWT.UIType.SimpleGraph,
            nodes: nodes,
            links: [
                { from: nodes[0], to: nodes[1], value: 1 },
                { from: nodes[1], to: nodes[3], value: 1 },
                { from: nodes[2], to: nodes[4], value: 1 },
                { from: nodes[3], to: nodes[1], value: 1 },
                { from: nodes[4], to: nodes[5], value: 1 },
                { from: nodes[1], to: nodes[4], value: 1 },
                { from: nodes[3], to: nodes[5], value: 1 }
            ],
            onClick: function (event) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action: function (elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
            legend: { alignment: UWT.Alignment.Top }
        };
        TestBase.addElement(preproc, '', 'group2');
        var preproc2 = {
            type: UWT.UIType.SimpleGraph,
            nodes: nodes,
            links: [
                { from: nodes[0], to: nodes[1], value: 1 },
                { from: nodes[1], to: nodes[3], value: 1 },
                { from: nodes[2], to: nodes[4], value: 1 },
                { from: nodes[3], to: nodes[1], value: 1 },
                { from: nodes[4], to: nodes[5], value: 1 },
                { from: nodes[1], to: nodes[4], value: 1 },
                { from: nodes[3], to: nodes[5], value: 1 }
            ],
            onClick: function (event) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event) {
                console.log('diagram double click');
                console.log(event.data);
            },
            onBrush: function (event) {
                console.log('onBrush');
                console.log(event);
            },
            onZoom: function (event) {
                console.log('onZoom');
                console.log(event);
            },
            brushContextMenuItems: [{
                    title: 'I did a brush',
                    action: function (elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
            contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action: function (elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
            legend: { alignment: UWT.Alignment.Top }
        };
        TestBase.addElement(preproc2, '', 'group2');
    }
    ConnectedGraphTest.createView = createView;
})(ConnectedGraphTest || (ConnectedGraphTest = {}));
//# sourceMappingURL=connectedGraphTest.js.map