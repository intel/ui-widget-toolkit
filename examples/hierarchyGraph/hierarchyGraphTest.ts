/// <reference path='../../dist/index.d.ts' />

module HierarchyGraphTest {
    window.onload = () => {
        let root: UWT.IHierarchyNode = {
            key: 'root',
            hideBorder: true,
            top: [{
                key: 'Node0',
                disableHover: true,
                center: [
                    {
                        key: 'Socket 0',
                        label: 'Socket 0',
                        image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                        type: ['socket', 'foobar'],
                        hideTooltip: true
                    }],
                top: [
                    {
                        key: 'node0mem0',
                        center: [{
                            key: '3',
                            label: 'IMC 0',
                            hideImageLabel: true,
                        }],
                        top: [
                            {
                                key: 'DIMM-Parent4',
                                left: [
                                    {
                                        key: 'Rank-5',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-6',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            },
                            {
                                key: 'DIMM-Parent7',
                                left: [
                                    {
                                        key: 'Rank-8',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-9',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            },
                            {
                                key: 'DIMM-Parent10',
                                left: [
                                    {
                                        key: 'Rank-11',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-12',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            }]
                    },
                    {
                        key: 'node0mem1',
                        center: [{
                            key: '13',
                            label: 'IMC 1'
                        }],
                        top: [
                            {
                                key: 'DIMM-Parent14',
                                left: [
                                    {
                                        key: 'Rank-15',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-16',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                ]
                            },
                            {
                                key: 'DIMM-Parent17',
                                left: [
                                    {
                                        key: 'Rank-18',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-19',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                ]
                            },
                            {
                                key: 'DIMM-Parent20',
                                left: [
                                    {
                                        key: 'Rank-21',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-22',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                ]
                            }]
                    }
                ],
                left: [
                    {
                        key: 'Device-Parent1',
                        left: [
                            {
                                key: '172',
                                label: 'enp51s0',
                                image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/ethernet.png',
                                type: ['device']
                            },
                            {
                                key: '170',
                                label: 'sda',
                                image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/disk.png',
                                type: ['device']
                            },
                            {
                                key: '168',
                                label: 'sr0',
                                image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/disk.png',
                                type: ['device']
                            }
                        ]
                    }
                ]
            },
            {
                key: 'Node1',
                center: [
                    {
                        key: 'Socket 1',
                        label: 'Socket 1',
                        image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                        type: ['socket']
                    }],
                top: [
                    {
                        key: 'node1mem0',
                        center: [{
                            key: '175',
                            label: 'IMC 0'
                        }],
                        top: [
                            {
                                key: 'DIMM-Parent176',
                                left: [
                                    {
                                        key: 'Rank-177',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-178',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            },
                            {
                                key: 'DIMM-Parent179',
                                left: [
                                    {
                                        key: 'Rank-180',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-181',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            },
                            {
                                key: 'DIMM-Parent182',
                                left: [
                                    {
                                        key: 'Rank-183',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-184',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            }
                        ],
                    },
                    {
                        key: 'node1mem1',
                        center: [{
                            key: '185',
                            label: 'IMC 1',
                        }],
                        top: [{
                            key: 'DIMM-Parent186',
                            left: [
                                {
                                    key: 'Rank-187',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                },
                                {
                                    key: 'Rank-188',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                }
                            ]
                        },
                        {
                            key: 'DIMM-Parent189',
                            left: [
                                {
                                    key: 'Rank-190',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                },
                                {
                                    key: 'Rank-191',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                }
                            ]
                        },
                        {
                            key: 'DIMM-Parent192',
                            left: [
                                {
                                    key: 'Rank-193',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                },
                                {
                                    key: 'Rank-194',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                }
                            ]
                        }]
                    }]
            }],
            bottom: [
                {
                    key: 'Node2',
                    center: [
                        {
                            key: 'Socket 2',
                            label: 'Socket 2',
                            image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                            type: ['socket']
                        }],
                    bottom: [{
                        key: 'node2mem0',
                        center: [{
                            key: '342',
                            label: 'IMC 0',
                        }],
                        bottom: [
                            {
                                key: 'DIMM-Parent343',
                                left: [
                                    {
                                        key: 'Rank-344',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-345',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]

                            },
                            {
                                key: 'DIMM-Parent346',
                                left: [
                                    {
                                        key: 'Rank-347',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-348',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            },
                            {
                                key: 'DIMM-Parent349',
                                left: [
                                    {
                                        key: 'Rank-350',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    },
                                    {
                                        key: 'Rank-351',
                                        image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                        type: ['dimm']
                                    }
                                ]
                            }],
                    },
                    {
                        key: 'node2mem1',
                        center: [{
                            key: '352',
                            label: 'IMC 1'
                        }],
                        bottom: [{
                            key: 'DIMM-Parent353',
                            left: [
                                {
                                    key: 'Rank-354',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                },
                                {
                                    key: 'Rank-355',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                }
                            ]
                        },
                        {
                            key: 'DIMM-Parent356',
                            left: [
                                {
                                    key: 'Rank-357',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                },
                                {
                                    key: 'Rank-358',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                }
                            ]
                        },
                        {
                            key: 'DIMM-Parent359',
                            left: [
                                {
                                    key: 'Rank-360',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                },
                                {
                                    key: 'Rank-361',
                                    image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                    type: ['dimm']
                                }
                            ]
                        }]
                    }]
                },
                {
                    key: 'Node3',
                    center: [
                        {
                            key: 'Socket 3',
                            label: 'Socket 3',
                            image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                            type: ['socket'],
                        }],
                    bottom: [
                        {
                            key: 'node3mem0',
                            center: [{
                                key: '508',
                                label: 'IMC 0'
                            }],
                            bottom: [
                                {
                                    key: 'DIMM-Parent509',
                                    left: [
                                        {
                                            key: 'Rank-510',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-511',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent512',
                                    left: [
                                        {
                                            key: 'Rank-513',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-514',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent515',
                                    left: [
                                        {
                                            key: 'Rank-516',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-517',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                }]
                        },
                        {
                            key: 'node3mem1',
                            center: [{
                                key: '518',
                                label: 'IMC 1'
                            }],
                            bottom: [
                                {
                                    key: 'DIMM-Parent519',
                                    left: [
                                        {
                                            key: 'Rank-520',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-521',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent522',
                                    left: [
                                        {
                                            key: 'Rank-523',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-524',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent525',
                                    left: [
                                        {
                                            key: 'Rank-526',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-527',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                }]
                        }]
                }]
        };

        let links = [
            {
                from: 'Socket 0',
                to: 'Socket 1',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear | UWT.LinkType.Bidirectional
            },
            {
                from: 'Socket 0',
                to: 'Socket 1',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear | UWT.LinkType.Directional
            },
            {
                from: 'Socket 0',
                to: 'Socket 3',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear,
                toConnectionPoint: 'socketChannel0'
            },
            {
                from: 'Socket 0',
                to: 'Socket 2',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear,
                color: 'blue',
                width: 10
            },
            {
                from: 'Socket 1',
                to: 'Socket 2',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear
            },
            {
                from: 'Socket 2',
                to: 'Socket 3',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear
            },
            {
                from: 'Socket 3',
                to: 'Socket 1',
                type: ['socket-interconnect'],
                linkType: UWT.LinkType.Linear,
                fromConnectionPoint: 'socketChannel0'
            },
            {
                from: 'Socket 0',
                to: 'Device-Parent1',
                type: ['pcie']
            },
            {
                from: '3',
                to: 'DIMM-Parent4',
                type: ['memchannel'],
                fromConnectionPoint: 'memRail0'
            },
            {
                from: '3',
                to: 'DIMM-Parent7',
                type: ['memchannel'],
                fromConnectionPoint: 'memRail0'
            },
            {
                from: '3',
                to: 'DIMM-Parent10',
                type: ['memchannel'],
                fromConnectionPoint: 'memRail0'
            },
            {
                from: '13',
                to: 'DIMM-Parent14',
                type: ['memchannel']
            },
            {
                from: '13',
                to: 'DIMM-Parent17',
                type: ['memchannel']
            },
            {

                from: '13',
                to: 'DIMM-Parent20',
                type: ['memchannel']
            },
            {
                from: '175',
                to: 'DIMM-Parent176',
                type: ['memchannel']
            },
            {

                from: '175',
                to: 'DIMM-Parent179',
                type: ['memchannel']
            },
            {
                from: '175',
                to: 'DIMM-Parent182',
                type: ['memchannel']
            },
            {
                from: '185',
                to: 'DIMM-Parent186',
                type: ['memchannel']
            },
            {
                from: '185',
                to: 'DIMM-Parent189',
                type: ['memchannel']
            },
            {
                from: '185',
                to: 'DIMM-Parent192',
                type: ['memchannel']
            },
            {
                from: '342',
                to: 'DIMM-Parent343',
                type: ['memchannel']
            },
            {
                from: '342',
                to: 'DIMM-Parent346',
                type: ['memchannel']
            },
            {
                from: '342',
                to: 'DIMM-Parent349',
                type: ['memchannel']
            },
            {
                from: '352',
                to: 'DIMM-Parent353',
                type: ['memchannel']
            },
            {
                from: '352',
                to: 'DIMM-Parent356',
                type: ['memchannel']
            },
            {
                from: '352',
                to: 'DIMM-Parent359',
                type: ['memchannel']
            },
            {
                from: '508',
                to: 'DIMM-Parent509',
                type: ['memchannel']
            },
            {
                from: '508',
                to: 'DIMM-Parent512',
                type: ['memchannel']
            },
            {
                from: '508',
                to: 'DIMM-Parent515',
                type: ['memchannel']
            },
            {
                from: '518',
                to: 'DIMM-Parent519',
                type: ['memchannel']
            },
            {
                from: '518',
                to: 'DIMM-Parent522',
                type: ['memchannel']
            },
            {
                from: '518',
                to: 'DIMM-Parent525',
                type: ['memchannel']
            }
        ]

        TestBase.colorManager.setColor('pcie', 'red');
        TestBase.colorManager.setColor('socket-interconnect', 'purple');
        TestBase.colorManager.setColor('memchannel', 'green');
        TestBase.colorManager.setColor('Node0', 'rgb(192, 192, 192)');
        TestBase.colorManager.setColor('Node1', 'rgb(192, 0, 192)');
        TestBase.colorManager.setColor('Node2', 'rgb(0, 192, 192)');
        TestBase.colorManager.setColor('Node3', 'rgb(192,192, 0)');

        let graph: UWT.IHierarchyGraph = {
            links: links,
            nodes: root,
            type: UWT.UIType.HierarchyGraph,
            onClick: function (event: UWT.IEvent) {
                console.log('hierarchy click');
                console.log(event.data);
                let isNode = event.data.key != undefined;
                if (isNode && event.data !== root) {
                    graph.nodes = event.data;
                    graph.renderer.render(graph);
                }
            },
            onDoubleClick: function (event: UWT.IEvent) {
                console.log('hierarchy double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                title: 'GraphMenuItem',
                action(elem: any, data: any, index: any) {
                    console.log('index: ' + index);
                    console.log(data);
                    console.log(elem);
                }
            }],
            onTooltip: function (event: UWT.IEvent): any {
                let tooltip: UWT.CustomDivTooltip = event.data.tooltip;
                let data = event.data.data;

                tooltip.clearTooltip();
                if (data.key) {
                    tooltip.getTooltipDiv().append(data.key);
                }
                if (data.from) {
                    tooltip.getTooltipDiv().append(data.from + ' ↔ ' + data.to + '\n');
                }
            }
        }

        let graph2: UWT.IHierarchyGraph = {
            links: links,
            nodes: root,
            type: UWT.UIType.HierarchyGraph,
            onClick: function (event: UWT.IEvent) {
                console.log('hierarchy click');
                console.log(event.data && event.data.key);
                let isNode = event.data.key != undefined;
                if (isNode && event.data !== root2) {
                    graph2.nodes = event.data;
                    graph2.renderer.render(graph2);
                }
            },
            decimator: {
                isVisible: function (node: UWT.IHierarchyNode) {
                    let depth = 0;
                    let parent = node;
                    while (parent) {
                        parent = parent.parent;
                        ++depth;
                    }
                    return depth < 3;
                }
            },
            onTooltip: function (event: UWT.IEvent): any {
                let tooltip: UWT.CustomDivTooltip = event.data.tooltip;
                let data = event.data.data;

                //using the MetricListTooltip setData call
                tooltip.setData('My Title', [{
                    source: undefined, group: 'foo',
                    metrics: {
                        key1: 'data1',
                        key2: 'data2'
                    }
                }]);
            }
        }

        let graph3: UWT.IHierarchyGraph = {
            links: links,
            nodes: root,
            type: UWT.UIType.HierarchyGraph,
            onClick: function (event: UWT.IEvent) {
                console.log('hierarchy click');
                console.log(event.data);
                let isNode = event.data.key != undefined;
                if (isNode && event.data !== root) {
                    graph3.nodes = event.data;
                    graph3.renderer.render(graph3);
                }
            },
            decimator: {
                isVisible: function (node: UWT.IHierarchyNode) {
                    let depth = 0;
                    let parent = node;
                    while (parent) {
                        parent = parent.parent;
                        ++depth;
                    }
                    return depth < 4;
                }
            }
        }

        let root2: UWT.IHierarchyNode = {
            key: 'root',
            hideBorder: true,
            top: [{
                key: 'Node0',
                center: [
                    {
                        key: 'Socket 0',
                        label: 'Socket 0',
                        image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                        type: ['socket']
                    }],
                left: [
                    {
                        key: 'Device-Parent1',
                        left: [
                            {
                                key: '172',
                                label: 'enp51s0',
                                image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/ethernet.png',
                                type: ['device']
                            },
                            {
                                key: '170',
                                label: 'sda',
                                image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/disk.png',
                                type: ['device']
                            },
                            {
                                key: '168',
                                label: 'sr0',
                                image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/disk.png',
                                type: ['device']
                            }
                        ]
                    }
                ]
            },
            {
                key: 'Node1',
                center: [
                    {
                        key: 'Socket 1',
                        label: 'Socket 1',
                        image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                        type: ['socket']
                    }],
            }],
            bottom: [
                {
                    key: 'Node2',
                    center: [
                        {
                            key: 'Socket 2',
                            label: 'Socket 2',
                            image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                            type: ['socket']
                        }],
                },
                {
                    key: 'Node3',
                    center: [
                        {
                            key: 'Socket 3',
                            label: 'Socket 3',
                            image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                            type: ['socket'],
                        }],
                }]
        };
        let graph4: UWT.IHierarchyGraph = {
            links: links,
            nodes: root2,
            type: UWT.UIType.HierarchyGraph,
            onClick: function (event: UWT.IEvent) {
                console.log('hierarchy click');
                console.log(event.data);
                let isNode = event.data.key != undefined;
                if (isNode && event.data !== root2) {
                    graph4.nodes = event.data;
                    graph4.renderer.render(graph4);
                }
            }
        }

        let root3: UWT.IHierarchyNode = {
            key: 'root',
            top: [
                {
                    key: 'Node0',
                    center: [
                        {
                            key: 'soc0',
                            top: [
                                {
                                    key: 'DIMM-Parent4',
                                    left: [
                                        {
                                            key: 'Rank-5',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-6',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent7',
                                    left: [
                                        {
                                            key: 'Rank-8',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-9',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent10',
                                    left: [
                                        {
                                            key: 'Rank-11',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-12',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                }, {
                                    key: 'DIMM-Parent14',
                                    left: [
                                        {
                                            key: 'Rank-15',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-16',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent17',
                                    left: [
                                        {
                                            key: 'Rank-18',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-19',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent20',
                                    left: [
                                        {
                                            key: 'Rank-21',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-22',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                    ]
                                }],
                            center: [
                                {
                                    top: [
                                        {
                                            key: '3',
                                            label: 'Memory Controller 0'
                                        },
                                        {
                                            key: '13',
                                            label: 'Memory Controller 1'
                                        }
                                    ],
                                    key: 'Socket 0',
                                    label: 'Socket 0',
                                    image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                                    type: ['socket']
                                }]
                        }],
                    left: [
                        {
                            key: 'Device-Parent1',
                            left: [
                                {
                                    key: '172',
                                    label: 'enp51s0',
                                    image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/ethernet.png',
                                    type: ['device']
                                },
                                {
                                    key: '170',
                                    label: 'sda',
                                    image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/disk.png',
                                    type: ['device']
                                },
                                {
                                    key: '168',
                                    label: 'sr0',
                                    image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/disk.png',
                                    type: ['device']
                                }
                            ]
                        }
                    ]
                },
                {
                    key: 'Node1',
                    right: [
                        {
                            key: 'Device-Parent2',
                            left: [
                                {
                                    key: '999',
                                    label: 'enp51s0',
                                    image: 'http://bshankar-desk1.sc.intel.com:6543/apps/ppe/img/ethernet.png',
                                    type: ['device']
                                }
                            ]
                        }
                    ],
                    center: [
                        {
                            key: 'soc1',
                            top: [
                                {
                                    key: 'DIMM-Parent176',
                                    left: [
                                        {
                                            key: 'Rank-177',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-178',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent179',
                                    left: [
                                        {
                                            key: 'Rank-180',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-181',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent182',
                                    left: [
                                        {
                                            key: 'Rank-183',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-184',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent186',
                                    left: [
                                        {
                                            key: 'Rank-187',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-188',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent189',
                                    left: [
                                        {
                                            key: 'Rank-190',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-191',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                },
                                {
                                    key: 'DIMM-Parent192',
                                    left: [
                                        {
                                            key: 'Rank-193',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        },
                                        {
                                            key: 'Rank-194',
                                            image: 'https://42xtjqm0qj0382ac91ye9exr-wpengine.netdna-ssl.com/wp-content/uploads/2016/08/ddr4-rdimm-and-lrdimm-chipset.jpg',
                                            type: ['dimm']
                                        }
                                    ]
                                }
                            ],
                            center: [{
                                top: [
                                    {
                                        key: '175',
                                        label: 'Memory Controller 0'
                                    },
                                    {
                                        key: '185',
                                        label: 'Memory Controller 1'
                                    }
                                ],

                                key: 'Socket 1',
                                label: 'Socket 1',
                                image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                                type: ['socket']
                            }],
                        }]
                }],
            bottom: [
                {
                    key: 'Node2',
                    center: [
                        {
                            key: 'Socket 2',
                            label: 'Socket 2',
                            image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                            type: ['socket']
                        }],
                },
                {
                    key: 'Node3',
                    center: [
                        {
                            key: 'Socket 3',
                            label: 'Socket 3',
                            image: 'http://lanpartypathfinder.com/images/a00302_technology03_core2xe_quad_400x400.jpg',
                            type: ['socket'],
                        }],
                }]
        };
        let graph5: UWT.IHierarchyGraph = {
            links: links,
            nodes: root3,
            type: UWT.UIType.HierarchyGraph,
            onClick: function (event: UWT.IEvent) {
                console.log('hierarchy click');
                console.log(event.data);
                let isNode = event.data.key != undefined;
                if (isNode && event.data !== root3) {
                    graph5.nodes = event.data;
                    graph5.renderer.render(graph5);
                }
            }
        }

        let graph6: UWT.IHierarchyGraph = {
            links: [],
            nodes: {
                "key": "Socket 0Core 0",
                "label": "Core 0",
                "type": ["core"],
                "right": [{
                    "key": "Thread0",
                    "label": "HT# 0",
                    "type": ["thread_core"]
                }, {
                    "key": "Thread36",
                    "label": "HT# 36",
                    "type": ["thread_core"]
                }]
            },
            type: UWT.UIType.HierarchyGraph
        }

        TestBase.elemManager.addElement(graph);
        TestBase.elemManager.addElement(graph2);
        TestBase.elemManager.addElement(graph3);
        TestBase.elemManager.addElement(graph4);
        TestBase.elemManager.addElement(graph5);
        TestBase.elemManager.addElement(graph6);

        function goToRoot() {
            graph.nodes = root;
            graph2.nodes = root;
            graph3.nodes = root;
            graph4.nodes = root2;
            graph5.nodes = root3;

            graph.render();
            graph2.render();
            graph3.render();
            graph4.render();
            graph5.render();
        }

        document.getElementById('goToRoot').addEventListener(
            'click', goToRoot, false);

        TestBase.configureButtons();
        TestBase.render();
    };
}