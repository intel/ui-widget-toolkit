/// <reference path='../../dist/index.d.ts' />
var pLinks = [{
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
    }];
var pNodes = [
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
];
var rectNodes = [
    {
        key: 'key0', type: ['join_node'], x: 864, y: 200,
        ports: {
            left: [{ key: 'input0' },],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key1', type: ['function_node'], x: 648, y: 200,
        ports: {
            left: [{ key: 'input0' }],
            right: [
                { key: 'output0' },
                { key: 'output1' }
            ]
        },
        renderType: UWT.NodeType.NodeRectangle
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
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key4', type: ['function_node'], x: 972, y: 200,
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key5', type: ['join_node'], x: 540, y: 200,
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key6', type: ['source_node'], x: 432, y: 200,
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key7', type: ['queue_node'], x: 1087, y: 117,
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    }
];
var blankNodes = [
    {
        key: 'key0',
        type: ['join_node'],
        ports: {
            left: [{ key: 'input0' },],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key1',
        type: ['function_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [
                { key: 'output0' },
                { key: 'output1' }
            ]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key2',
        type: ['function_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        }
    },
    {
        key: 'key3',
        type: ['function_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key4',
        type: ['function_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key5',
        type: ['join_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key6',
        type: ['source_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    },
    {
        key: 'key7',
        type: ['queue_node'],
        ports: {
            left: [{ key: 'input0' }],
            right: [{ key: 'output0' }]
        },
        renderType: UWT.NodeType.NodeRectangle
    }
];
var funcLayout = [
    {
        "nodes": [
            {
                "key": "key0",
                "type": ["source_node"],
                "x": 35,
                "y": 119,
                "ports": {
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key1",
                "type": ["buffer_node"],
                "x": 35,
                "y": 281,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key2",
                "type": ["join_node"],
                "x": 178,
                "y": 174,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key3",
                "type": ["function_node"],
                "x": 321,
                "y": 174,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key4",
                "type": ["function_node"],
                "x": 464,
                "y": 119,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key5",
                "type": ["function_node"],
                "x": 464,
                "y": 281,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key6",
                "type": ["join_node"],
                "x": 607,
                "y": 200,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key7",
                "type": ["function_node"],
                "x": 750,
                "y": 200,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            }
        ],
        "links": [
            {
                "from": "key1",
                "to": "key2",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key2",
                "to": "key3",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key6",
                "to": "key7",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key3",
                "to": "key4",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key3",
                "to": "key5",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key4",
                "to": "key6",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key5",
                "to": "key6",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key7",
                "to": "key1",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key0",
                "to": "key2",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            }
        ]
    },
    {
        "nodes": [
            {
                "key": "key18",
                "type": ["source_node"],
                "x": 1177,
                "y": 55,
                "ports": {
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key19",
                "type": ["buffer_node"],
                "x": 2035,
                "y": 55,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key20",
                "type": ["join_node"],
                "x": 1320,
                "y": 55,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key21",
                "type": ["function_node"],
                "x": 1463,
                "y": 55,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key22",
                "type": ["function_node"],
                "x": 1606,
                "y": 55,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key23",
                "type": ["function_node"],
                "x": 1749,
                "y": 55,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key24",
                "type": ["function_node"],
                "x": 1892,
                "y": 55,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            }
        ],
        "links": [
            {
                "from": "key20",
                "to": "key21",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key21",
                "to": "key22",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key22",
                "to": "key23",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key23",
                "to": "key24",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key24",
                "to": "key19",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key18",
                "to": "key20",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key19",
                "to": "key20",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            }
        ]
    },
    {
        "nodes": [
            {
                "key": "key33",
                "type": ["function_node"],
                "x": 2590,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key34",
                "type": ["function_node"],
                "x": 2733,
                "y": 0,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key35",
                "type": ["function_node"],
                "x": 2733,
                "y": 119,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key36",
                "type": ["join_node"],
                "x": 2876,
                "y": 21,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key37",
                "type": ["function_node"],
                "x": 3019,
                "y": 21,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            }
        ],
        "links": [
            {
                "from": "key36",
                "to": "key37",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key34",
                "to": "key36",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key35",
                "to": "key36",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key33",
                "to": "key34",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key33",
                "to": "key35",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            }
        ]
    },
    {
        "nodes": [
            {
                "key": "key44",
                "type": ["queue_node"],
                "x": 3297,
                "y": 38,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key45",
                "type": ["buffer_node"],
                "x": 3297,
                "y": 157,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key46",
                "type": ["join_node"],
                "x": 3440,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key47",
                "type": ["function_node"],
                "x": 3583,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key48",
                "type": ["function_node"],
                "x": 3726,
                "y": 0,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key49",
                "type": ["function_node"],
                "x": 3726,
                "y": 119,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key50",
                "type": ["join_node"],
                "x": 3869,
                "y": 98,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key51",
                "type": ["function_node"],
                "x": 4012,
                "y": 98,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            }
        ],
        "links": [
            {
                "from": "key46",
                "to": "key47",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key50",
                "to": "key51",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key47",
                "to": "key48",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key47",
                "to": "key49",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key48",
                "to": "key50",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key49",
                "to": "key50",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key44",
                "to": "key46",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key45",
                "to": "key46",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            }
        ]
    },
    {
        "nodes": [
            {
                "key": "key69",
                "type": ["buffer_node"],
                "x": 5332,
                "y": 118,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key61",
                "type": ["queue_node"],
                "x": 4474,
                "y": 0,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key62",
                "type": ["buffer_node"],
                "x": 4474,
                "y": 119,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key63",
                "type": ["join_node"],
                "x": 4617,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key64",
                "type": ["function_node"],
                "x": 4760,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key65",
                "type": ["function_node"],
                "x": 4903,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key66",
                "type": ["function_node"],
                "x": 4903,
                "y": 178,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key67",
                "type": ["join_node"],
                "x": 5046,
                "y": 118,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key68",
                "type": ["function_node"],
                "x": 5189,
                "y": 118,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            }
        ],
        "links": [
            {
                "from": "key62",
                "to": "key63",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key63",
                "to": "key64",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key67",
                "to": "key68",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key64",
                "to": "key65",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key64",
                "to": "key66",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key65",
                "to": "key67",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key66",
                "to": "key67",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key68",
                "to": "key69",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key61",
                "to": "key63",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            }
        ]
    },
    {
        "nodes": [
            {
                "key": "key80",
                "type": ["function_node"],
                "x": 5887,
                "y": 0,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key81",
                "type": ["function_node"],
                "x": 6030,
                "y": 0,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key82",
                "type": ["function_node"],
                "x": 6030,
                "y": 119,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key83",
                "type": ["join_node"],
                "x": 6173,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        },
                        {
                            "key": "input1"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key84",
                "type": ["function_node"],
                "x": 6316,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            },
            {
                "key": "key85",
                "type": ["buffer_node"],
                "x": 6459,
                "y": 59,
                "ports": {
                    "left": [
                        {
                            "key": "input0"
                        }
                    ],
                    "right": [
                        {
                            "key": "output0"
                        }
                    ]
                }
            }
        ],
        "links": [
            {
                "from": "key83",
                "to": "key84",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key81",
                "to": "key83",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key82",
                "to": "key83",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input1"
            },
            {
                "from": "key84",
                "to": "key85",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key80",
                "to": "key81",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            },
            {
                "from": "key80",
                "to": "key82",
                "value": 1.000000,
                "fromPort": "output0",
                "toPort": "input0"
            }
        ]
    }
];
var funcNodes = [];
var funcLinks = [];
funcLayout.forEach(function (graph) {
    funcNodes = funcNodes.concat(graph.nodes);
    funcLinks = funcLinks.concat(graph.links);
});
funcLinks.forEach(function (link) {
    link.linkType = UWT.LinkType.Curve | UWT.LinkType.Directional;
});
//# sourceMappingURL=data.js.map