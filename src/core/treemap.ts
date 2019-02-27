
import {
    IEvent, IOptions, EventType, UIElement, UIType, IContextMenuItem
} from '../interface/ui-base';

import { showContextMenu } from './context-menu';
import { CustomDivTooltip } from './tooltip';
import { SVGRenderer } from './svg-helper';
import { D3Renderer, getTextWidth } from './renderer';
import { ITreeMap, ITreeMapNode } from '../interface/treemap';

import * as d3 from 'd3';
import { ColorManager } from './color-manager';

function getColor(colorMgr: ColorManager, node: any) {
    if (node.data.color) {
        return node.data.color;
    }
    if (colorMgr) {
        if (colorMgr.hasColor(node.data.id)) {
            return colorMgr.getColor(node.data.id);
        }

        if (colorMgr.hasColor(node.data.type)) {
            return colorMgr.getColor(node.data.type);
        }
    }
    return 'gray';
}


function updateNodeText(renderedNode: d3.Selection<any, any, d3.BaseType, any>) {
    let node = renderedNode.data()[0];
    let textWidth = getTextWidth(node.data.name,
        renderedNode.node().style['font-family'],
        renderedNode.node().style['font-size']);

    if ((node.y1 - node.y0) > 15 &&
        textWidth < (node.x1 - node.x0)) {
        renderedNode
            .append('text')
            .attr('class', 'label')
            .attr('y', 14)
            .text(node.data.name);
    }
}

export class TreeMap extends SVGRenderer {
    protected _radius: number;
    protected _hoverItem: any;
    protected _graphArea: d3.Selection<any, any, d3.BaseType, any>;
    protected _onHoverChanged: (event?: IEvent) => void;
    protected _hoverStart: (event?: IEvent) => void;
    protected _hoverEnd: (event?: IEvent) => void;

    protected _currentRoot: any;
    protected _treemap: any;
    protected _xScale: any;
    protected _yScale: any;
    protected _navBarHeight: number;
    protected _navBarText: string;
    protected _navBarSvg: d3.Selection<any, any, d3.BaseType, any>;
    protected _childMap: any;

    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        super();

        let self = this;
        self.DEFAULT_GRAPH_HEIGHT = 250;
        self.MIN_MARGIN = { TOP: 10, BOTTOM: 10, LEFT: 10, RIGHT: 10 };
        self._options.height = self.DEFAULT_GRAPH_HEIGHT;

        self.initialize(element, renderer, parent);
        this._options.animateDuration = 1000;

        function showTooltip(d: any): boolean {
            let data: any = {
                tooltip: self._dataTooltip,
                data: d
            }
            let output: string;
            let cb = self._element.onTooltip;
            if (cb) {
                cb({ caller: self._element, data: data });
            } else {
                self._dataTooltip.setData(d.id, []);
            }

            return true;
        }

        self._dataTooltip = new CustomDivTooltip(self._tooltipId, 'tooltip-t');
        self._dataTooltip
            .setAnalyticsName(self._tooltipAnalyticsName)
            .setEnterCallback(showTooltip)
            .setMoveCallback(showTooltip)
            .setPlaceTooltipLeftRight()
            .alwaysRecalcWidth(true)
            .setDelay(0);


        let myPrevHover: any; // used in callbacks
        self._onHoverChanged = function (event?: IEvent) {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }
            let hoverCallback = self._element.onHover;
            if (hoverCallback) {
                hoverCallback(event);
            } else {
                self._renderer.hover(self._element, event);
            }
            return true;
        }
        self._hoverStart = function () {
            let selection = this.__data__.data.id;
            myPrevHover = selection;
            return self._onHoverChanged({
                caller: self._element,
                event: EventType.HoverStart,
                selection: selection
            });
        }    // onHoverEnter

        self._hoverEnd = function () {
            let ret = self._onHoverChanged({
                caller: self._element,
                event: EventType.HoverEnd,
                selection: myPrevHover
            });

            myPrevHover = undefined;
            return ret;
        }   // onHoverLeave

    }


    // check if this tree map node has children
    protected _showChildMap(target: any, node: any) {
        let self = this;
        let tooltipData: string;

        self._graphArea.selectAll('.childmap').remove();

        let childMap = self._graphArea
            .append('g')
            .attr('class', 'childmap')
            .on('mousemove', function (e) {
                self._dataTooltip.onMouseMove(tooltipData);
            })
            .on('mouseleave', function (e) {
                childMap.remove();
                self._dataTooltip.onMouseLeave(tooltipData);
            })
            .on('click', function (d: any) {
                target.node().dispatchEvent(new MouseEvent("click"));
            });

        let newNodes = childMap
            .selectAll('.tnodes')
            .data([node].concat(node.children))
            .enter()
            .each(function (node) {
                if (!node.data.id) {
                    node.data.id = node.data.name;
                }
            })
            .append('g')
            .attr('class', 'tnode')
            .attr('transform', function (d: any) {
                return 'translate(' + d.x0 + ',' + (d.y0 + self._navBarHeight) + ')';
            })
            .on('mouseenter', function (node) {
                tooltipData = node.data;
                self._dataTooltip.onMouseEnter(tooltipData);
                self._dataTooltip.onMouseMove(tooltipData, node.evt);

                self._hoverStart.call(this);
            })
            .on('mouseleave', function (e) {
                self._hoverEnd.call(this);
            });

        // for new nodes create the rect and text
        newNodes
            .append('rect')
            .attr('class', function (node: any) {
                return 'trect level-' + node.depth + ' ' + node.data.id;
            })
            .attr('title', function (node: any) { return node.data.name; })
            .style('stroke', 'white')
            .style('fill', function (node) {
                return getColor(self._colorMgr, node);
            })
            .style('width', function (node: any) {
                return (node.x1 - node.x0) + 'px';
            })
            .style('height', function (node: any) {
                return (node.y1 - node.y0) + 'px';
            })

        newNodes.each(function () {
            updateNodeText(d3.select(this));
        })

        return childMap;
    }

    protected _hasChildMap(node: any) {
        return (this._element as any).showChildrenOnHover &&
            node !== this._currentRoot && node.children
    }

    protected _addInteractionHelper(target: any,
        onClick: (event: IEvent) => void, onDoubleClick: (event: IEvent) => void,
        contextMenuItems: IContextMenuItem[]) {

        let self = this;
        let wait: any;

        target.on('click', function (e: any) {
            if (onDoubleClick) {
                wait = setTimeout(function () {
                    if (wait) {
                        if (e !== self._currentRoot && e.children) {
                            if (self._childMap) {
                                self._childMap.remove();
                            }
                            self._hoverEnd(e);
                            self._navBarText += '.' + e.data.name;
                            self._renderTreeMap(self._currentRoot, e);
                        }
                        if (onClick) {
                            onClick({
                                caller: self._element, event: EventType.Click,
                                data: e.data
                            });
                            wait = null;
                        }
                    }
                }, 300);
            } else {
                if (e !== self._currentRoot && e.children) {
                    if (self._childMap) {
                        self._childMap.remove();
                    }
                    self._hoverEnd(e);
                    self._navBarText += '.' + e.data.name;
                    self._renderTreeMap(self._currentRoot, e);
                }
                if (onClick) {
                    onClick({
                        caller: self._element, event: EventType.Click,
                        data: e.data
                    });
                }
            }
        });
        if (onDoubleClick) {
            target.on('dblclick', function (e: any) {
                window.clearTimeout(wait);
                wait = null;
                onDoubleClick({
                    caller: self._element, event: EventType.DoubleClick,
                    data: e.data
                });
            });
        }
        if (contextMenuItems && contextMenuItems.length) {
            target.on('contextmenu', function (d: any) {
                self._dataTooltip.onMouseLeave(d3.event);
                showContextMenu(d3.event, d.data, contextMenuItems);
            });
        }

        target
            .on('mouseenter', function (node: any) {
                if (self._hasChildMap(node)) {
                    self._childMap = self._showChildMap(target, node);
                } else {
                    self._hoverStart.call(this);
                    self._dataTooltip.onMouseEnter(node.data);
                    self._dataTooltip.onMouseMove(node.data, node.evt);
                }
            })
            .on('mousemove', function (node: any) {
                self._dataTooltip.onMouseMove(node.data, node.evt);
            })
            .on('mouseleave', function (node: any) {
                if (!self._hasChildMap(node)) {
                    self._hoverEnd.call(this);
                    self._dataTooltip.onMouseLeave(node.data);
                }
            });
    }

    protected _renderTreeMap(oldRoot: any, newRoot: any) {
        let self = this;
        let mapDef = self._element as ITreeMap;

        function resizeNodes(nodes: any, onEnd: (node: any) => void) {
            if (self.getAnimateDuration()) {
                nodes
                    .transition()
                    .duration(self.getAnimateDuration())
                    .on('end', function () {
                        onEnd(d3.select(this));
                    })
                    .attr('transform', function (d: any) {
                        return 'translate(' + d.x0 + ',' + (d.y0 + self._navBarHeight) + ')';
                    });

                nodes
                    .each(function (data: any) {
                        d3.select(this)
                            .selectAll('rect')
                            .transition()
                            .duration(self.getAnimateDuration())
                            .style('width', function (d: any) {
                                return (data.x1 - data.x0) + 'px';
                            })
                            .style('height', function (d: any) {
                                return (data.y1 - data.y0) + 'px';
                            })
                    });
            } else {
                nodes
                    .attr('transform', function (d: any) {
                        return 'translate(' + d.x0 + ',' + (d.y0 + self._navBarHeight) + ')';
                    })
                    .each(function (data: any) {
                        let node = d3.select(this);
                        node.selectAll('rect')
                            .style('width', function (d: any) {
                                return (data.x1 - data.x0) + 'px';
                            })
                            .style('height', function (d: any) {
                                return (data.y1 - data.y0) + 'px';
                            })
                        onEnd(node);
                    });
            }
        }
        // get all of the existing nodes as we may want to use
        // them to do a pretty transitino
        let oldMap: any = self._graphArea
            .selectAll('.treemap');

        let newMap: any;
        let isZoom = oldRoot === newRoot.parent;
        if (isZoom) {
            // zooming in so put new nodes in front of existing nodes
            // as they have higher detail
            newMap = self._graphArea
                .append('g');
        } else {
            // zooming out then we need to put new nodes behind the
            // existing nodes as the zoomed out nodes are lower detail
            newMap = self._graphArea
                .insert('g', ':first-child');
        }

        // this renderers new node in the old position or at the top level
        let newNodes = newMap
            .attr('class', 'treemap')
            .selectAll('.tnode')
            .data([newRoot].concat(newRoot.children))
            .enter()
            .each(function (node: any) {
                if (!node.data.id) {
                    node.data.id = node.data.name;
                }
            })
            .append('g')
            .attr('class', 'tnode')
            .attr('transform', function (d: any) {
                return 'translate(' + d.x0 + ',' + (d.y0 + self._navBarHeight) + ')';
            });

        // for new nodes create the rect and text
        newNodes
            .append('rect')
            .attr('class', function (node: any) {
                return 'trect level-' + node.depth + ' ' + node.data.id;
            })
            .attr('title', function (node: any) { return node.data.name; })
            .style('stroke', 'white')
            .style('fill', function (node: any) {
                return getColor(self._colorMgr, node);
            })
            .style('width', function (d: any) {
                return d.x1 - d.x0 + 'px';
            })
            .style('height', function (d: any) {
                return d.y1 - d.y0 + 'px';
            });

        if (isZoom) {
            let func = (d: ITreeMapNode) => { return d.value; };
            // resize will move the zoomed in view to the size of the parent
            let updatedRoot = d3.hierarchy(newRoot.data)
                .sum(func as any);

            self._treemap(updatedRoot);
            resizeNodes(newMap.selectAll('.tnode').data([updatedRoot].concat(updatedRoot.children)),
                function (nodeSelect: any) {
                    updateNodeText(nodeSelect);
                    self._addInteractionHelper(nodeSelect, mapDef.onClick, mapDef.onDoubleClick,
                        mapDef.contextMenuItems);
                    oldMap.remove();
                });

            self._currentRoot = updatedRoot;
        } else {
            // find the child tree map info in the new parent to resize
            // the it into its box
            if (oldRoot) {
                let oldNodeInNewTree;
                for (let i = 0; i < newRoot.children.length; ++i) {
                    if (newRoot.children[i].data === oldRoot.data) {
                        oldNodeInNewTree = newRoot.children[i];
                        break;
                    }
                }

                resizeNodes(oldMap.selectAll('.tnode').data([oldNodeInNewTree].concat(oldNodeInNewTree.children)),
                    function () {
                        oldMap.remove();
                    });
            }

            // the parent is rendered so we need to move the current view
            // into the right child of the current root
            resizeNodes(newMap.selectAll('.tnode'),
                function (nodeSelect: any) {
                    updateNodeText(nodeSelect);
                    self._addInteractionHelper(nodeSelect, mapDef.onClick, mapDef.onDoubleClick,
                        mapDef.contextMenuItems);
                });

            self._currentRoot = newRoot;
        }

        self._navBarSvg.text(self._navBarText);
    }

    public createLayout() {
        let self = this;
        self._svg.selectAll('*').remove();
        self._graphArea = self._svg.append('g')
            .attr('class', 'graphArea')
    }

    /**
     * Render the given element
     *
     * @param the options to render
     */
    public render(options: IOptions) {
        let self = this;
        let mapDef = (self._element as ITreeMap);

        this.loadOptions(options);

        self._navBarHeight = 20;
        let width = self._svgRect.width = self._options.width ? self._options.width : 400;
        let viewHeight = self._svgRect.height = self._options.height ? self._options.height : 400;
        let height = viewHeight - self._navBarHeight;

        self._navBarText = mapDef.root.name;

        function tagParents(node: any) {
            if (node.children) {
                node.children.forEach(function (child: any) {
                    child.parent = node;
                    tagParents(child);
                })
            }
        }
        tagParents(mapDef.root);

        if (!self._currentRoot) {
            self._currentRoot = d3.hierarchy(mapDef.root)
                .sum(function (d: ITreeMapNode) { return d.value; })
                .sort(function (a, b) { return b.height - a.height || b.value - a.value; })
        }

        // maybe we shouldn't redo this each rerender, but it's just
        // algorithm setup
        self._treemap = d3.treemap()
            .paddingInner(1)
            .round(true)
            .tile(d3.treemapResquarify)
            .size([width, height]);

        self._treemap(self._currentRoot);

        let navBar = self._graphArea
            .append('g');

        function moveUp() {
            if (self._currentRoot.data.parent) {
                self._navBarText = self._navBarText.substring(0,
                    self._navBarText.lastIndexOf('.'));

                let parentNode = d3.hierarchy(self._currentRoot.data.parent)
                    .sum(function (d: ITreeMapNode) { return d.value; })
                    .sort(function (a, b) { return b.height - a.height || b.value - a.value; })

                self._treemap(parentNode);
                self._renderTreeMap(self._currentRoot, parentNode);
            }
        }
        navBar.append('rect')
            .style('width', width)
            .style('height', self._navBarHeight)
            .style('fill', 'orange')
            .on('mousedown touchstart', function () {
                moveUp();
            });
        self._navBarSvg = navBar
            .append('text')
            .attr('class', 'header')
            .attr('y', 14)
            .text(self._navBarText)
            .on('mousedown touchstart', function () {
                moveUp();
            });

        self._renderTreeMap(undefined, self._currentRoot);

        // RENDER THE CHART
        self._svg
            .attr('width', self._svgRect.width)
            .attr('height', self._svgRect.height);

        self._options.rightMargin = self._svgRect.width -
            (self._graphRect.x + self._graphRect.width);
        self.updateHandles();
    }
}
D3Renderer.register(UIType.TreeMap, TreeMap);