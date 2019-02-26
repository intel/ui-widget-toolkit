/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module PortDiagramTest {
    window.onload = () => {
        createView();
        TestBase.render();
    };

    export function createView() {
        let svg: UWT.IPortDiagram = {
            type: UWT.UIType.PortDiagram,
            nodes: [
                {
                    key: 'key0', type: ['join_node'], x: 864, y: 200,
                    ports: {
                        left: [{ key: 'input0' },],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key1', type: ['function_node'], x: 648, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [
                            { key: 'output0' },
                            { key: 'output1' }
                        ]
                    }
                },
                {
                    key: 'key2', type: ['function_node'], x: 756, y: 250,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key3', type: ['function_node'], x: 756, y: 150,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key4', type: ['function_node'], x: 972, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key5', type: ['join_node'], x: 540, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key6', type: ['source_node'], x: 432, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key7', type: ['queue_node'], x: 1087, y: 117,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                }
            ],
            links: [
                {
                    from: 'key6', to: 'key5', value: 2037.673340,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                },
                {
                    from: 'key7', to: 'key5', value: 1.000000,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Curve | UWT.LinkType.Directional
                },
                {
                    from: 'key5', to: 'key1', value: 1675.320068,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                },
                {
                    from: 'key1', to: 'key2', value: 1.000000,
                    fromPort: 'output1', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                },
                {
                    from: 'key2', to: 'key0', value: 8421.998291,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Elbow | UWT.LinkType.Directional
                },
                {
                    from: 'key1', to: 'key3', value: 1.000000,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Curve | UWT.LinkType.Directional
                },
                {
                    from: 'key3', to: 'key0', value: 4509.744141,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Curve | UWT.LinkType.Directional
                },
                {
                    from: 'key0', to: 'key4', value: 1.000000,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Bidirectional
                },
                {
                    from: 'key4', to: 'key7', value: 4553.798340,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                }
            ],
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
            legend: { alignment: UWT.Alignment.Top },
            render: function (renderer?: UWT.UIRenderer, options?: UWT.IOptions): Promise<any> {
                if (renderer) {
                    renderer.invalidate(svg, { height: 400, enableXYZoom: true, forceSvgRenderer: true });
                } else {
                    svg.renderer.invalidate(svg, { height: 400, enableXYZoom: true, forceSvgRenderer: true });
                }
                return new Promise(function (resolve, reject) {
                    resolve(true);
                });
            }
        }
        TestBase.elemManager.addElement(svg, '', 'group2');

        let webgl: UWT.IPortDiagram = {
            type: UWT.UIType.PortDiagram,
            nodes: [
                {
                    key: 'key0', type: ['join_node'], x: 864, y: 200,
                    ports: {
                        left: [{ key: 'input0' },],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key1', type: ['function_node'], x: 648, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [
                            { key: 'output0' },
                            { key: 'output1' }
                        ]
                    }
                },
                {
                    key: 'key2', type: ['function_node'], x: 756, y: 250,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key3', type: ['function_node'], x: 756, y: 150,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key4', type: ['function_node'], x: 972, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key5', type: ['join_node'], x: 540, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key6', type: ['source_node'], x: 432, y: 200,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                },
                {
                    key: 'key7', type: ['queue_node'], x: 1087, y: 117,
                    ports: {
                        left: [{ key: 'input0' }],
                        right: [{ key: 'output0' }]
                    }
                }
            ],
            links: [
                {
                    from: 'key6', to: 'key5', value: 2037.673340,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                },
                {
                    from: 'key7', to: 'key5', value: 1.000000,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Curve | UWT.LinkType.Directional
                },
                {
                    from: 'key5', to: 'key1', value: 1675.320068,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                },
                {
                    from: 'key1', to: 'key2', value: 1.000000,
                    fromPort: 'output1', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                },
                {
                    from: 'key2', to: 'key0', value: 8421.998291,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Elbow | UWT.LinkType.Directional
                },
                {
                    from: 'key1', to: 'key3', value: 1.000000,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Curve | UWT.LinkType.Directional
                },
                {
                    from: 'key3', to: 'key0', value: 4509.744141,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Curve | UWT.LinkType.Directional
                },
                {
                    from: 'key0', to: 'key4', value: 1.000000,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Bidirectional
                },
                {
                    from: 'key4', to: 'key7', value: 4553.798340,
                    fromPort: 'output0', toPort: 'input0',
                    linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
                }
            ],
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
            legend: { alignment: UWT.Alignment.Top },
            render: function (renderer?: UWT.UIRenderer, options?: UWT.IOptions): Promise<any> {
                if (renderer) {
                    renderer.invalidate(webgl, { enableXYZoom: true });
                } else {
                    webgl.renderer.invalidate(webgl, { enableXYZoom: true });
                }
                return new Promise(function (resolve, reject) {
                    resolve(true);
                });
            }
        }

        TestBase.elemManager.addElement(webgl, '', 'group2');
    }
}