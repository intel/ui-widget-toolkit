/// <reference path='./data.ts' />
/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var PortDiagramTest;
(function (PortDiagramTest) {
    window.onload = function () {
        createView();
        createWebGLView();
        TestBase.render();
    };
    function createView() {
        var svg = {
            type: UWT.UIType.PortDiagram,
            nodes: pNodes,
            links: pLinks,
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
        TestBase.addElement(svg, '', 'group2', undefined, {
            height: 400, forceSvgRenderer: true, enableXYZoom: true
        });
        {
            var svgRectNodes = {
                type: UWT.UIType.PortDiagram,
                nodes: rectNodes,
                links: pLinks,
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
            TestBase.addElement(svgRectNodes, '', 'group2', undefined, {
                forceSvgRenderer: true,
                height: 400,
                enableXYZoom: true,
                fitToWindow: true
            });
        }
        {
            var dynamicLayout = {
                type: UWT.UIType.PortDiagram,
                nodes: blankNodes,
                links: pLinks,
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
            TestBase.addElement(dynamicLayout, '', 'group2', undefined, {
                forceSvgRenderer: true,
                height: 500,
                enableXYZoom: true,
                fitToWindow: true
            });
        }
    }
    PortDiagramTest.createView = createView;
    function createWebGLView() {
        var webgl = {
            type: UWT.UIType.PortDiagram,
            nodes: pNodes,
            links: pLinks,
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
        TestBase.addElement(webgl, '', 'group2', undefined, {
            height: 400,
            enableXYZoom: true
        });
        {
            var webGlRectNodes = {
                type: UWT.UIType.PortDiagram,
                nodes: rectNodes,
                links: pLinks,
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
            TestBase.addElement(webGlRectNodes, '', 'group2', undefined, {
                height: 400,
                enableXYZoom: true,
                disableBrush: true,
                fitToWindow: true
            });
        }
        {
            var wideGraph = {
                type: UWT.UIType.PortDiagram,
                nodeRenderType: UWT.NodeType.NodeRectangle,
                nodes: funcNodes,
                links: funcLinks,
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
            TestBase.addElement(wideGraph, '', 'group2', undefined, {
                height: 500,
                enableXYZoom: true,
                fitToWindow: true
            });
        }
    }
    PortDiagramTest.createWebGLView = createWebGLView;
})(PortDiagramTest || (PortDiagramTest = {}));
//# sourceMappingURL=portDiagramTest.js.map