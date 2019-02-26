import { merge } from '../utilities';
import { IXYValue } from '../../interface/chart/series-data';
import {
    Alignment, IEvent, UIElement, IOptions, UIType, UIRenderer
} from '../../interface/ui-base';
import {
    IConnectedGraph, IPortDiagram, IPortDiagramLink, IPortDiagramNode
} from '../../interface/graph';
import { UIElementRenderer, D3Renderer } from '../renderer';
import { addClickHelper } from '../svg-helper';

import * as d3 from 'd3';
import * as PIXI from 'pixi.js';

import {
    IRenderedDiagramLink,
    D3ConnectedGraphSVG,
    D3ConnectedGraphPixi,
    DiagramHelper
} from './base';
import {
    PIXIHelper, GraphicsManager
} from '../pixi-helper';

export class D3PortDiagram extends UIElementRenderer {
    _rendererManager: UIRenderer;
    _renderer: any;
    _parent: any;
    _nodes: any;

    /** get the xy position of the start of the link */
    getLinkStartXY: (link: IRenderedDiagramLink) => IXYValue;
    /** get the xy position of the end of the link */
    getLinkEndXY: (link: IRenderedDiagramLink) => IXYValue;

    /** cache stuff for later, portMap allows links to find the right
     * port to attached to by to/from.  The ports array is just for rendering quickly
     */
    public _nodePortInfo: {
        [index: string]: {
            [index: string]: {
                key: any, index: number, alignment: Alignment, x: number, y: number
            }
        }

    } = {};
    protected _options: IOptions = {};

    constructor(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {

        super();

        this._element = element as IPortDiagram;
        this._rendererManager = renderer;
        this._parent = parent;
        this._nodes = {};

        let self = this;

        this.getLinkStartXY = function (link: IRenderedDiagramLink): IXYValue {
            let nodeDef = self._nodes[link.def.from as string] as IPortDiagramNode;
            let linkDef = link.def as IPortDiagramLink;
            let offset = self._nodePortInfo[nodeDef.key][linkDef.fromPort as string];
            return { x: nodeDef.x + offset.x, y: nodeDef.y + offset.y };
        }

        this.getLinkEndXY = function (link: IRenderedDiagramLink): IXYValue {
            let nodeDef = self._nodes[link.def.to as string] as IPortDiagramNode;
            let linkDef = link.def as IPortDiagramLink;
            let offset = self._nodePortInfo[nodeDef.key][linkDef.toPort as string];
            return { x: nodeDef.x + offset.x, y: nodeDef.y + offset.y };
        }
    }

    /**
     * hover event
     *
     * @param event the event to pass to the renderer
     */
    public hover(event: IEvent): void {
        this._renderer.hover(event);
    }

    public cursorChange(event: IEvent): void {

    }

    /**
     * brush event
     *
     * @param event the event to pass to the renderer
     */
    public brush(event: IEvent): void {
        this._renderer.brush(event);
    }

    private addNodePorts(portList: any, nodeKey: string, alignment: Alignment) {
        let self = this;
        if (portList) {
            if (!self._nodePortInfo[nodeKey]) {
                self._nodePortInfo[nodeKey] = {};
            }

            let nodeHeight = 50;
            let verticalPortBase = -nodeHeight * .5;  // where node start relative to the node center
            let verticalPortSize = nodeHeight / portList.length;  // amount of space the port can take
            let verticalPortOffset = verticalPortSize * .5;

            let nodeWidth = 50;
            let horizontalPortBase = -nodeWidth * .5;  // where node start relative to the node center
            let horizontalPortSize = nodeWidth / portList.length;  // amount of space the port can take
            let horizontallPortOffset = horizontalPortSize * .5;

            let nodePortMap = self._nodePortInfo[nodeKey];
            switch (alignment) {
                case Alignment.Top:
                    portList.forEach(function (port: any, index: number) {
                        let x = horizontallPortOffset + horizontalPortSize * index + horizontalPortBase;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: x, y: verticalPortBase };
                    });
                    break;
                case Alignment.Bottom:
                    portList.forEach(function (port: any, index: number) {
                        let x = horizontallPortOffset + horizontalPortSize * index + horizontalPortBase;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: x, y: -verticalPortBase };
                    });
                    break;
                case Alignment.Left:
                    portList.forEach(function (port: any, index: number) {
                        let y = verticalPortOffset + verticalPortSize * index + verticalPortBase;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: horizontalPortBase, y: y };
                    });
                    break;
                case Alignment.Right:
                    portList.forEach(function (port: any, index: number) {
                        let y = verticalPortOffset + verticalPortSize * index + verticalPortBase;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: -horizontalPortBase, y: y };
                    });
                    break;
            }
        }
    }

    public addPorts(node: IPortDiagramNode) {
        this.addNodePorts(node.ports.left, node.key, Alignment.Left);
        this.addNodePorts(node.ports.right, node.key, Alignment.Right);
        this.addNodePorts(node.ports.top, node.key, Alignment.Top);
        this.addNodePorts(node.ports.bottom, node.key, Alignment.Bottom);
    }

    public getColor(node: IPortDiagramNode) {
        let colorMgr = this._rendererManager.getColorManager();
        let color;
        if (colorMgr.hasColor(node.key)) {
            color = colorMgr.getColor(node.key);
        } else if (node.type) {
            color = colorMgr.getColor(node.type[0]);
        } else {
            color = colorMgr.getColor(node.key);
        }
        return color;
    }

    public getClasses(node: IPortDiagramNode) {
        let ret = node.key;
        node.type.forEach(function (type) {
            ret += ' ' + type;
        });
        return ret;
    }

    public addNode(d: any) {
        this._nodes[d.key] = d;
    }

    public createRenderedLinks() {
        let graph = this._element as IPortDiagram;
        let links: IPortDiagramLink[] = graph.links;

        let renderedLinks: IRenderedDiagramLink[] = [];

        let self = this;
        links.forEach(function (link) {
            let sourceNode = self._nodes[link.from as string];
            let targetNode = self._nodes[link.to as string];

            if (!sourceNode || !targetNode) {
                return;
            }
            let sourcePort = self._nodePortInfo[sourceNode.key][link.fromPort];
            let targetPort = self._nodePortInfo[targetNode.key][link.toPort];

            let renderedLink: IRenderedDiagramLink = {
                def: link,
                source: {
                    node: sourceNode,
                    alignment: sourcePort.alignment
                },
                target: {
                    node: targetNode,
                    alignment: targetPort.alignment
                },
            };
            renderedLinks.push(renderedLink);
        });
        return renderedLinks;
    }

    public render(options: IOptions) {
        merge(this._options, options);

        if (!this._renderer) {
            if (this._options.forceSvgRenderer) {
                this._renderer = new D3PortDiagramSVG(this._element,
                    this._rendererManager, this._parent, this);
            } else {
                this._renderer = new D3PortDiagramPixi(this._element,
                    this._rendererManager, this._parent, this);
            }
            this._renderer.setColorManager(this._colorMgr);
        }
        this._renderer.render(options);
    }

    public invalidate: any = this.render;
}

export class D3PortDiagramSVG extends D3ConnectedGraphSVG {
    protected _portDiagram: D3PortDiagram;

    constructor(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>,
        portDiagram: D3PortDiagram) {
        super(element, renderer, parent);

        this._graphHelper = new DiagramHelper();
        this._graphHelper.initializeCallbacks(this._renderer,
            this._element as IPortDiagram, this);

        this._portDiagram = portDiagram;

        this.getLinkStartXY = portDiagram.getLinkStartXY;
        this.getLinkEndXY = portDiagram.getLinkEndXY;
    }

    private createAndRenderLinks(graphArea: d3.Selection<any, any, d3.BaseType, any>) {
        let renderedLinks = this._portDiagram.createRenderedLinks();
        this.renderLinkHelper(graphArea, renderedLinks);
    }

    public render(options: IOptions) {
        let self = this;

        let graphArea = self.initializeGraphArea(options);

        self.initializeLinkLayer(graphArea);
        self.renderNodes(graphArea);
        self.createAndRenderLinks(graphArea);

        // TODO MERGE WITH SIMPLE.TS CODE WHEN WE NEED TO LIMIT PANNING
        let height = -Number.MAX_VALUE;

        let graph = self._element as IConnectedGraph;
        graph.nodes.forEach(function (node: any) {
            if (node.y) {
                height = Math.max(height, node.y);
            }
        });

        height = this.renderLegend(height);
        self.configureViewSizeAndBrush(height, self._options.width);
    }

    private renderNodes(graphArea: d3.Selection<any, any, d3.BaseType, any>) {
        let self = this;
        let graph = self._element as IPortDiagram;

        // the function for moving the nodes
        function dragmove(node: any) {
            self._dataTooltip.hideTooltip();
            d3.select(this)
                .attr('cx', d3.event.x)
                .attr('cy', d3.event.y);
            node.x = d3.event.x;
            node.y = d3.event.y;

            graphArea
                .selectAll('.port.' + node.key)
                .attr('cx', function (d: any) {
                    return node.x + d.port.x;
                })
                .attr('cy', function (d: any) {
                    return node.y + d.port.y;
                })

            let linksToUpdate = [];
            graphArea.selectAll('.link.' + node.key)
                .each(function (link: any) {
                    linksToUpdate.push(link);
                });
            self.renderLinkHelper(graphArea, linksToUpdate, true);
        }

        self._portDiagram._nodePortInfo = {};

        graph.nodes.forEach(function (node) {
            if (graph.decimator && !graph.decimator(node)) {
                return;
            }
            (node as any).height = RADIUS * 2;
            (node as any).width = RADIUS * 2;
            self._portDiagram.addNode(node);
            self._portDiagram.addPorts(node);
        });

        let nodes = graphArea.append('g')
            .classed('nodes', true)
            .selectAll('circle')
            .data(graph.nodes)
            .enter().append('circle')
            .attr('r', 25)
            .attr('cx', function (d: any) { return d.x; })
            .attr('cy', function (d: any) { return d.y; })
            .attr('fill', function (d: any) {
                return self._portDiagram.getColor(d);
            })
            .attr('class', function (d: any) {
                return self._portDiagram.getClasses(d);
            })
            .classed('node', true)
            .on('mouseenter', self.nodeHoverStart)
            .on('mouseleave', self.hoverEnd)
            .call((<any>d3).drag()
                .on('drag', dragmove));

        addClickHelper(nodes, graph.onClick, graph.onDoubleClick, graph.contextMenuItems,
            self._dataTooltip, graph);
        self._dataTooltip.setTarget(nodes);

        // we do this here instead of using the renderPorts helper
        // function because it's expensive to call selectAll multiple
        // times (aka once for each node if we call that helper)
        if (!(this._element as IPortDiagram).disablePortRendering) {
            // gather all the ports for rendering
            let portDefs = [];
            for (let key in self._portDiagram._nodePortInfo) {
                let nodePorts = this._portDiagram._nodePortInfo[key];
                for (let portKey in nodePorts) {
                    portDefs.push({ node: self._portDiagram._nodes[key], port: nodePorts[portKey] });
                }
            }

            let ports = graphArea
                .selectAll('.ports')
                .data(portDefs)
                .enter().append('circle')
                .attr('cx', function (d: any) { return d.node.x + d.port.x; })
                .attr('cy', function (d: any) { return d.node.y + d.port.y; })
                .attr('r', 3)
                .attr('fill', 'white')
                .attr('stroke', function (d: any) {
                    return self._portDiagram.getColor(d.node);
                })
                .attr('class', function (d: any) {
                    return self._portDiagram.getClasses(d.node) + ' ' + d.port.key;
                })
                .classed('port', true);

            addClickHelper(ports, graph.onClick, graph.onDoubleClick, graph.contextMenuItems,
                this._dataTooltip, graph);
            this._dataTooltip.setTarget(ports);
        }
    }
}

D3Renderer.register(UIType.PortDiagram, D3PortDiagram);

let RADIUS = 25;
let PORT_RADIUS = 3;
// WEBGL STUFF
export class D3PortDiagramPixi extends D3ConnectedGraphPixi {
    protected _portDiagram: D3PortDiagram;
    protected _renderedLinks: IRenderedDiagramLink[];

    protected _nodeGraphics: GraphicsManager;
    protected _portGraphics: GraphicsManager;

    constructor(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>,
        portDiagram: D3PortDiagram) {
        super(element, renderer, parent);

        this._graphHelper = new DiagramHelper();
        this._graphHelper.initializeCallbacks(this._renderer,
            this._element as IPortDiagram, this);

        this._portDiagram = portDiagram;

        this.getLinkStartXY = portDiagram.getLinkStartXY;
        this.getLinkEndXY = portDiagram.getLinkEndXY;
    }

    private renderNodes(stage: any) {
        let self = this;
        let graph = self._element as IPortDiagram;

        function dragstart(event) {
            // store a reference to the data
            // the reason for this is because of multitouch
            // we want to track the movement of this particular touch
            this.data = event.data;
            this.dragging = true;

            // itemDragging is a workaround to have d3 and pixi coexist for events
            stage.itemDragging = true;
            event.stopPropagation();
        }

        function dragend() {
            this.dragging = false;

            // itemDragging is a workaround to have d3 and pixi coexist for events
            stage.itemDragging = false;
            // set the interaction data to null
            this.data = null;
        }
        // the function for moving the nodes
        function dragmove(event) {
            if (this.dragging) {
                let node = this.__data__;
                self._dataTooltip.hideTooltip();
                let pos = this.data.getLocalPosition(this.parent);

                this.x = pos.x - RADIUS;
                this.y = pos.y - RADIUS;

                node.x = pos.x;
                node.y = pos.y;

                self.renderLinkHelper(stage, self._renderedLinks);
                self._pixiHelper.render();

                event.stopPropagation();
            }
        }

        graph.nodes.forEach(function (node: IPortDiagramNode) {
            let color = parseInt(self._portDiagram.getColor(node).substring(1), 16);

            let nodeGraphic = self._nodeGraphics.add(node.type[0], node.key, function () {
                let ret = new PIXI.Graphics();
                ret.beginFill(0xFFFFFF);
                ret.drawCircle(0, 0, RADIUS); // drawCircle(x, y, radius)
                ret.beginFill(color);
                ret.drawCircle(0, 0, RADIUS - 1); // drawCircle(x, y, radius)
                ret.endFill();
                return ret;
            });

            nodeGraphic.x = node.x - RADIUS;
            nodeGraphic.y = node.y - RADIUS;
            nodeGraphic.__data__ = node;
            nodeGraphic
                .on('mousedown', dragstart)
                .on('touchstart', dragstart)
                // events for drag end
                .on('mouseup', dragend)
                .on('mouseupoutside', dragend)
                .on('touchend', dragend)
                .on('touchendoutside', dragend)
                // events for drag move
                .on('mousemove', dragmove)
                .on('touchmove', dragmove);

            stage.addChild(nodeGraphic);

            // add item lets us do selection
            self._pixiHelper.addSelection(node.key, nodeGraphic);

            self._pixiHelper.addInteractionHelper(nodeGraphic, graph.onClick, graph.onDoubleClick,
                graph.contextMenuItems, self.nodeHoverStart, self.hoverEnd,
                self._dataTooltip, graph, node);

            // we do this here instead of using the renderPorts helper
            // function because it's expensive to call selectAll multiple
            // times (aka once for each node if we call that helper)
            if (!(self._element as IPortDiagram).disablePortRendering) {
                // gather all the ports for rendering
                let nodePorts = self._portDiagram._nodePortInfo[node.key];
                for (let portKey in nodePorts) {
                    let port = nodePorts[portKey];

                    let portGraphic = self._portGraphics.add(node.type[0], node.key, function () {
                        let ret = new PIXI.Graphics();
                        ret.beginFill(color); // white
                        ret.drawCircle(0, 0, PORT_RADIUS); // drawCircle(x, y, radius)
                        ret.beginFill(0xFFFFFF); // white
                        ret.drawCircle(0, 0, PORT_RADIUS - 1); // drawCircle(x, y, radius)
                        ret.endFill();
                        return ret;
                    });

                    // put port relatively in the right place for the container
                    portGraphic.x = port.x + RADIUS - PORT_RADIUS;
                    portGraphic.y = port.y + RADIUS - PORT_RADIUS;

                    nodeGraphic.addChild(portGraphic);
                    self._pixiHelper.addSelection(node.key, portGraphic);
                    self._pixiHelper.addSelection(node.key + port.key, portGraphic);

                    self._pixiHelper.addInteractionHelper(portGraphic, graph.onClick, graph.onDoubleClick,
                        graph.contextMenuItems, self.nodeHoverStart, self.hoverEnd,
                        self._dataTooltip, graph, { key: node.key + port.key, node: node, port: port });
                }
            }
        });
    }

    // cache the basic graphic structures so we can clone them
    // vs recreating them
    public render(options: IOptions) {
        merge(this._options, options);

        let self = this;
        let graph = self._element as IPortDiagram;

        let first = this._pixiHelper === undefined;
        if (!first && (options.height || options.width)) {
            this._pixi.resize(self._options.width, self._options.height);
            this._pixiHelper.render();
            return;
        }

        self._portDiagram._nodePortInfo = {};

        let xExtent: number[] = [Number.MAX_VALUE, -Number.MAX_VALUE];
        let yExtent: number[] = [Number.MAX_VALUE, -Number.MAX_VALUE];
        // initialize node info
        graph.nodes.forEach(function (node) {
            if (graph.decimator && !graph.decimator(node)) {
                return;
            }

            (node as any).height = RADIUS * 2;
            (node as any).width = RADIUS * 2;
            self._portDiagram.addNode(node);
            self._portDiagram.addPorts(node);

            xExtent[0] = Math.min(xExtent[0], node.x);
            xExtent[1] = Math.max(xExtent[1], node.x);
            yExtent[0] = Math.min(yExtent[0], node.y);
            yExtent[1] = Math.max(yExtent[1], node.y);
        });

        // initialize link info
        let stage = self.initializeGraphArea(options, xExtent, yExtent);

        if (!this._nodeGraphics) {
            this._nodeGraphics = this._pixiHelper.createGraphicsManager();
            this._portGraphics = this._pixiHelper.createGraphicsManager();
        }
        this._renderedLinks = self._portDiagram.createRenderedLinks();

        // create graphics managers for caching
        self._nodeGraphics = new GraphicsManager(self._pixi);
        if (!(self._element as IPortDiagram).disablePortRendering) {
            self._portGraphics = new GraphicsManager(self._pixi);
        }
        self.renderLinkHelper(stage, this._renderedLinks);
        self.renderNodes(stage);

        //Render the stage
        self._pixiHelper.render(stage);
    }
}
D3Renderer.register(UIType.PortDiagram, D3PortDiagram);