/// <reference path='./data.ts' />
/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module PortDiagramTest {
    window.onload = () => {
        createView();
        createWebGLView();
        TestBase.render();
    };

    export function createView() {
        let svg: UWT.IPortDiagram = {
            type: UWT.UIType.PortDiagram,
            nodes: pNodes,
            links: pLinks,
            onClick: function (event: UWT.IEvent) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event: UWT.IEvent) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                title: 'Edit me to do something!',
                action(elem: any, data: any, index: any) {
                    console.log('index: ' + index);
                    console.log(data);
                    console.log(elem);
                }
            }],
            legend: { alignment: UWT.Alignment.Top }
        }
        TestBase.addElement(svg, '', 'group2', undefined, {
            height: 400, forceSvgRenderer: true, enableXYZoom: true
        });

        {
            let svgRectNodes: UWT.IPortDiagram = {
                type: UWT.UIType.PortDiagram,
                nodes: rectNodes,
                links: pLinks,
                onClick: function (event: UWT.IEvent) {
                    console.log('diagram click');
                    console.log(event.data);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('diagram double click');
                    console.log(event.data);
                },
                contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Top }
            }

            TestBase.addElement(svgRectNodes, '', 'group2', undefined, {
                forceSvgRenderer: true,
                height: 400,
                enableXYZoom: true,
                fitToWindow: true
            });
        }
        {
            let dynamicLayout: UWT.IPortDiagram = {
                type: UWT.UIType.PortDiagram,
                nodes: blankNodes,
                links: pLinks,
                onClick: function (event: UWT.IEvent) {
                    console.log('diagram click');
                    console.log(event.data);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('diagram double click');
                    console.log(event.data);
                },
                contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Top }
            }

            TestBase.addElement(dynamicLayout, '', 'group2', undefined, {
                forceSvgRenderer: true,
                height: 500,
                enableXYZoom: true,
                fitToWindow: true
            });
        }
    }
    export function createWebGLView() {
        let webgl: UWT.IPortDiagram = {
            type: UWT.UIType.PortDiagram,
            nodes: pNodes,
            links: pLinks,
            onClick: function (event: UWT.IEvent) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event: UWT.IEvent) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                title: 'Edit me to do something!',
                action(elem: any, data: any, index: any) {
                    console.log('index: ' + index);
                    console.log(data);
                    console.log(elem);
                }
            }],
            legend: { alignment: UWT.Alignment.Top }
        }

        TestBase.addElement(webgl, '', 'group2', undefined, {
            height: 400,
            enableXYZoom: true
        });
        {
            let webGlRectNodes: UWT.IPortDiagram = {
                type: UWT.UIType.PortDiagram,
                nodes: rectNodes,
                links: pLinks,
                onClick: function (event: UWT.IEvent) {
                    console.log('diagram click');
                    console.log(event.data);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('diagram double click');
                    console.log(event.data);
                },
                contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Top }
            }

            TestBase.addElement(webGlRectNodes, '', 'group2', undefined, {
                height: 400,
                enableXYZoom: true,
                disableBrush: true,
                fitToWindow: true
            });
        }

        {
            let wideGraph: UWT.IPortDiagram = {
                type: UWT.UIType.PortDiagram,
                nodeRenderType: UWT.NodeType.NodeRectangle,
                nodes: funcNodes,
                links: funcLinks,
                onClick: function (event: UWT.IEvent) {
                    console.log('diagram click');
                    console.log(event.data);
                },
                onDoubleClick: function (event: UWT.IEvent) {
                    console.log('diagram double click');
                    console.log(event.data);
                },
                contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action(elem: any, data: any, index: any) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }],
                legend: { alignment: UWT.Alignment.Top }
            }

            TestBase.addElement(wideGraph, '', 'group2', undefined, {
                height: 500,
                enableXYZoom: true,
                fitToWindow: true
            });
        }
    }
}