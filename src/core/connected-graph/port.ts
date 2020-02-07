import { merge } from '../utilities';
import { IXYValue } from '../../interface/chart/series-data';
import {
    Alignment, IEvent, UIElement, IOptions, UIType, UIRenderer, Rect, IRect
} from '../../interface/ui-base';
import {
    IPortDiagram, IPortDiagramLink, IPortDiagramNode, NodeType
} from '../../interface/graph';
import { UIElementRenderer, D3Renderer } from '../renderer';
import { addClickHelper, getTextRect } from '../svg-helper';

import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import * as dagre from 'dagre';

import {
    IRenderedDiagramLink,
    D3ConnectedGraphSVG,
    D3ConnectedGraphPixi,
    DiagramBase
} from './base';
import {
    GraphicsManager, PIXIHelper
} from '../pixi-helper';
import { tsvParse } from 'd3';

export interface IPortDiagramNodeRenderer {
    def?: IPortDiagramNode;
    renderer?: INodeRenderer;
}

export interface INodeRenderer extends IPortDiagramNodeRenderer {
    updatePosition: (pos: { dx: number, dy: number }) => void;
    getNode?: () => any;
    renderNode: (options?: any) => any;
    renderPort: (port: any, options?: any) => any;
    configureNode: () => void;
    getPortAreaRect: () => IRect;
}

/********************************************
 * NODE RENDER HELPERS
*********************************************/

class SVGNode {
    public def: IPortDiagramNode;
    protected _nodeContainer: d3.Selection<any, any, d3.BaseType, any>;
    protected _portDiagram: D3PortDiagram;

    public updatePosition(pos: { dx: number, dy: number }): void {
        this.def.x += pos.dx;
        this.def.y += pos.dy;

        this._nodeContainer
            .attr('transform', `translate(${this.def.x}, ${this.def.y})`);
    }

    public renderPort(portDef: any, options?: any): d3.Selection<any, any, d3.BaseType, any> {
        let port = this._nodeContainer
            .append('circle')
            .attr('class', this._portDiagram.getClasses(this.def) + ' ' + portDef.key)
            .classed('port', true)
            .attr('cx', portDef.x)
            .attr('cy', portDef.y)
            .attr('r', PORT_RADIUS)
            .attr('fill', 'white')
            .attr('stroke-width', 1)
            .attr('stroke', this._portDiagram.getColor(this.def));
        return port;
    }
}

class PIXINode {
    public def: IPortDiagramNode;
    protected _nodeContainer: PIXI.Container;

    public initializeNode() {
        this._nodeContainer = new PIXI.Container();
    }
    public getNode(): PIXI.Container {
        return this._nodeContainer;
    }

    public updatePosition(pos: { dx: number, dy: number }): void {
        this.def.x += pos.dx;
        this.def.y += pos.dy;

        this._nodeContainer.x = this.def.x;
        this._nodeContainer.y = this.def.y;

    }

    public renderPort(port: any, options?: any): PIXI.Container {
        let portGraphic = options.manager.add(this.def.type[0],
            this.def.key, PIXI.SCALE_MODES.LINEAR, 1,
            function () {
                let ret = new PIXI.Graphics();
                ret.beginFill(options.color); // white
                ret.drawCircle(0, 0, PORT_RADIUS); // drawCircle(x, y, radius)
                ret.beginFill(0xFFFFFF); // white
                ret.drawCircle(0, 0, PORT_RADIUS - 1); // drawCircle(x, y, radius)
                ret.endFill();
                return ret;
            });

        // put port relatively in the right place for the container
        portGraphic.x = port.x - PORT_RADIUS;
        portGraphic.y = port.y - PORT_RADIUS;
        portGraphic.renderer = this;

        this._nodeContainer.addChild(portGraphic);
        return portGraphic;
    }

    private _selectTempItems = {};
    public select(selection: string, elem: PIXI.Sprite, index: number,
        graphicsMgr: GraphicsManager) {
        let createSelectionBorder = function (circle: PIXI.Sprite) {
            let circleRadius = circle.width / 2;
            let radius = circleRadius + STROKE_WIDTH;
            let border = graphicsMgr.add(selection + radius,
                selection + radius, PIXI.SCALE_MODES.LINEAR, 1,
                function () {
                    let pixiCircle = new PIXI.Graphics();
                    pixiCircle.beginFill(0xFFFFFF);
                    pixiCircle.drawCircle(0, 0, radius); // drawCircle(x, y, radius)
                    pixiCircle.endFill();
                    return pixiCircle;
                });

            border.x = circle.x + circleRadius - radius;
            border.y = circle.y + circleRadius - radius;
            border.tint = SELECTION_COLOR;
            border.__data__ = (circle as any).__data__;

            return border;
        }

        let border = createSelectionBorder(elem);
        this._selectTempItems[`${selection}Select${index}`] = border;
        elem.parent.addChildAt(border, 0);
    }

    public unselect(selection: string, elem: PIXI.Sprite, index: number) {
        let border = this._selectTempItems[`${selection}Select${index}`];
        border.parent.removeChild(border);
        delete this._selectTempItems[`${selection}Select`];
    }
}

/********************************************
 * NODE CONFIGURATION HELPERS
 *********************************************/
let RADIUS = 25;
let PORT_RADIUS = 3;
let STROKE_WIDTH = 3;
let SELECTION_COLOR = 15921737;
let PADDING = 3;
let simplePortArea = { x: -RADIUS, y: -RADIUS, height: RADIUS * 2, width: RADIUS * 2 };
class SimpleNode implements IPortDiagramNodeRenderer {
    public def: IPortDiagramNode;
    protected _selectTempItems = {}

    constructor(node: IPortDiagramNode) {
        this.def = node;
    }
    public configureNode(): void {
        this.def.height = 50;
        this.def.width = 50;
    }
    public getPortAreaRect(): IRect {
        return simplePortArea;
    }
}

class RectangleNode implements IPortDiagramNodeRenderer {
    protected _portRect: IRect;

    public def: IPortDiagramNode;
    public renderer: INodeRenderer;

    constructor(node: IPortDiagramNode) {
        this.def = node;
    }

    protected getXYOffset() {
        return { x: -this.def.width * .5, y: -this.def.height * .5 };
    }
    protected getTitle() {
        return this.def.type.length > 0 ? this.def.type[0] : 'None';
    }

    protected getTitleTextRect(): IRect {
        throw "Error please implement this function";
    }

    public configureNode(): void {
        let node = this.def;
        let topPorts = node.ports.top ? node.ports.top.length : 0;
        let bottomPorts = node.ports.bottom ? node.ports.bottom.length : 0;
        let leftPorts = node.ports.left ? node.ports.left.length : 0;
        let rightPorts = node.ports.right ? node.ports.right.length : 0;

        let portSize = 15;

        let titleTextRect = this.getTitleTextRect();

        let titleHeight = titleTextRect.height + PADDING * 2;
        let minHeight = titleHeight + PADDING * 2 + 50;
        let minWidth = titleTextRect.width + PADDING * 2;

        let xOffset = -minWidth * .5;
        let yOffset = -minHeight * .5;

        this._portRect = new Rect(xOffset, titleHeight + yOffset,
            Math.max(Math.max(topPorts, bottomPorts) * portSize, minWidth),
            Math.max(Math.max(leftPorts, rightPorts) * portSize, minHeight));

        this.def.height = titleHeight + this._portRect.height;
        this.def.width = this._portRect.width;
    }
    public getPortAreaRect() {
        return this._portRect;
    }
}


/********************************************
 * NODE IMPLEMENTATIONS
 *********************************************/
class SVGSimpleNode extends SimpleNode implements INodeRenderer {
    protected _nodeContainer: d3.Selection<any, any, d3.BaseType, any>;
    protected _portDiagram: D3PortDiagram;

    public updatePosition: (pos: { dx: number, dy: number }) => void;
    public renderPort: (portDef: any, options?: any) => d3.Selection<any, any, d3.BaseType, any>;

    constructor(node: IPortDiagramNode,
        portDiagram: D3PortDiagram) {

        super(node);
        this._portDiagram = portDiagram;

        this.updatePosition = SVGNode.prototype.updatePosition.bind(this);
        this.renderPort = SVGNode.prototype.renderPort.bind(this);
    }

    public renderNode(options?: any): d3.Selection<any, any, d3.BaseType, any> {
        this._nodeContainer = options.group.append('g');
        this._nodeContainer
            .append('circle')
            .attr('class', this._portDiagram.getClasses(this.def))
            .classed('node', true)
            .attr('r', RADIUS)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', this._portDiagram.getColor(this.def));

        if (this.def.x !== undefined) {
            this.updatePosition({ dx: 0, dy: 0 });
        }
        return this._nodeContainer;
    }
}

class PIXISimpleNode extends SimpleNode implements INodeRenderer {
    private _nodeContainer: PIXI.Container;

    public updatePosition: (pos: { dx: number, dy: number }) => void;
    public renderPort: (portDef: any, options?: any) => PIXI.Container;
    public initializeNode: () => PIXI.Container;
    public getNode: () => PIXI.Container;

    constructor(node: IPortDiagramNode) {
        super(node);

        this.initializeNode = PIXINode.prototype.initializeNode.bind(this);
        this.getNode = PIXINode.prototype.getNode.bind(this);
        this.updatePosition = PIXINode.prototype.updatePosition.bind(this);
        this.renderPort = PIXINode.prototype.renderPort.bind(this);
    }

    public renderNode(options?: any): PIXI.Container {
        this.initializeNode();
        let node = options.manager.add(this.def.type[0],
            this.def.key, PIXI.SCALE_MODES.LINEAR, 4,
            function () {
                let ret = new PIXI.Graphics();
                ret.beginFill(0xFFFFFF);
                ret.drawCircle(-RADIUS, -RADIUS, RADIUS); // drawCircle(x, y, radius)
                ret.beginFill(options.color);
                ret.drawCircle(-RADIUS, -RADIUS, RADIUS - 1); // drawCircle(x, y, radius)
                ret.endFill();
                return ret;
            });
        node.x = -RADIUS;
        node.y = -RADIUS;
        this._nodeContainer.addChild(node);

        if (this.def.x !== undefined) {
            this.updatePosition({ dx: 0, dy: 0 });
        }
        return node;
    }


    public select(selection: string, elem: PIXI.Sprite, index: number,
        graphicsMgr: GraphicsManager) {
        console.log('need node select')

        let createSelectionBorder = function (circle: PIXI.Sprite) {
            let circleRadius = circle.width / 2;
            let radius = circleRadius + STROKE_WIDTH;
            let border = graphicsMgr.add(selection + radius,
                selection + radius, PIXI.SCALE_MODES.LINEAR, 1,
                function () {
                    let pixiCircle = new PIXI.Graphics();
                    pixiCircle.beginFill(0xFFFFFF);
                    pixiCircle.drawCircle(0, 0, radius); // drawCircle(x, y, radius)
                    pixiCircle.endFill();
                    return pixiCircle;
                });

            border.x = circle.x + circleRadius - radius;
            border.y = circle.y + circleRadius - radius;
            border.tint = SELECTION_COLOR;
            border.__data__ = (circle as any).__data__;

            return border;
        }

        let border = createSelectionBorder(elem);
        this._selectTempItems[`${selection}Select${index}`] = border;
        elem.parent.addChildAt(border, 0);
    }

    public unselect(selection: string, elem: PIXI.Sprite, index: number) {
        let border = this._selectTempItems[`${selection}Select${index}`];
        border.parent.removeChild(border);
        delete this._selectTempItems[`${selection}Select${index}`];
    }
}

class SVGRectangleNode extends RectangleNode implements INodeRenderer {
    protected _portDiagram: D3PortDiagram;
    protected _nodeContainer: d3.Selection<any, any, d3.BaseType, any>;
    protected _svg: d3.Selection<any, any, d3.BaseType, any>;

    public updatePosition: (pos: { dx: number, dy: number }) => void;
    public renderPort: (portDef: any, options?: any) => d3.Selection<any, any, d3.BaseType, any>;

    constructor(node: IPortDiagramNode,
        portDiagram: D3PortDiagram,
        svg: d3.Selection<any, any, d3.BaseType, any>) {

        super(node);
        this._portDiagram = portDiagram;
        this._svg = svg;

        this.updatePosition = SVGNode.prototype.updatePosition.bind(this);
        this.renderPort = SVGNode.prototype.renderPort.bind(this);
    }

    protected getTitleTextRect(): IRect {
        return getTextRect(this._svg, this.getTitle());
    }

    public renderNode(options?: any): d3.Selection<any, any, d3.BaseType, any> {
        this._nodeContainer = options.group.append('g');
        let nodeBox = this._nodeContainer.append('rect');
        let titleBox = this._nodeContainer.append('rect');
        let textRenderer = this._nodeContainer.append('text');

        let nodeOffset = this.getXYOffset();
        let xOffset = nodeOffset.x;
        let yOffset = nodeOffset.y;
        let text = this.getTitle();
        textRenderer
            .text(text)
            .attr('fill', 'white')
            .attr('stroke', 'white')
            .attr('alignment-baseline', 'hanging')
            .attr('x', xOffset + PADDING)
            .attr('y', yOffset + PADDING);

        nodeBox
            .attr('class', this._portDiagram.getClasses(this.def))
            .classed('node', true)
            .classed('border', true)
            .attr('fill', '#FFFFFF')
            .attr('stroke', '#000000')
            .attr('stroke-width', 1)
            .attr('x', xOffset)
            .attr('y', yOffset)
            .attr('width', this.def.width)
            .attr('height', this.def.height)
            .attr('rx', 3)
            .attr('ry', 3);

        titleBox
            .attr('class', this._portDiagram.getClasses(this.def))
            .classed('node', true)
            .classed('title-box', true)
            .attr('fill', this._portDiagram.getColor(this.def))
            .attr('x', xOffset)
            .attr('y', yOffset)
            .attr('width', this.def.width)
            .attr('height', 20)
            .attr('rx', 3)
            .attr('ry', 3);

        if (this.def.x !== undefined) {
            this.updatePosition({ dx: 0, dy: 0 });
        }
        return this._nodeContainer;
    }
}

class PIXIRectangleNode extends RectangleNode implements INodeRenderer {
    private _nodeContainer: PIXI.Container;
    private _pixiHelper: PIXIHelper;
    private _titleText: PIXI.Text;
    private _selectTempItems = {}

    public updatePosition: (pos: { dx: number, dy: number }) => void;
    public renderPort: (portDef: any, options?: any) => PIXI.Container;
    public initializeNode: () => void;
    public getNode: () => PIXI.Container;

    constructor(node: IPortDiagramNode, pixiHelper: PIXIHelper) {
        super(node);
        this._pixiHelper = pixiHelper;

        this.initializeNode = PIXINode.prototype.initializeNode.bind(this);
        this.getNode = PIXINode.prototype.getNode.bind(this);
        this.updatePosition = PIXINode.prototype.updatePosition.bind(this);
        this.renderPort = PIXINode.prototype.renderPort.bind(this);
    }

    protected getTitleTextRect(): IRect {
        let text = this.getTitle();
        return this._pixiHelper.renderText(text,
            d3.select(this._pixiHelper.getRenderer().view.parentNode), 0xFFFFFF);
    }

    public renderNode(options?: any): PIXI.Container {
        this.initializeNode();

        let id = `${this.def.type[0]}H${this.def.height}W${this.def.width}`;
        id += this.def.ports.top ? `T${this.def.ports.top.length}` : '';
        id += this.def.ports.left ? `L${this.def.ports.left.length}` : '';
        id += this.def.ports.right ? `R${this.def.ports.right.length}` : '';
        id += this.def.ports.bottom ? `B${this.def.ports.bottom.length}` : '';
        let node = options.manager.add(id, this.def.key,
            PIXI.SCALE_MODES.LINEAR, 1, () => {

                // adjust the text to the right spot
                let text = this.getTitle();
                this._titleText = this._pixiHelper.renderText(text,
                    d3.select(this._pixiHelper.getRenderer().view.parentNode), 0xFFFFFF);

                this._titleText.x = PADDING;
                this._titleText.y = PADDING;

                // outline node
                let graphic = new PIXI.Graphics();
                graphic.beginFill(0xFFFFFF, 1);
                graphic.lineStyle(1, 0x000000, .7);
                graphic.drawRoundedRect(0, 0, this._portRect.width, this.def.height, 3);

                // draw title box
                graphic.beginFill(options.color, 1);
                graphic.drawRoundedRect(0, 0, this._portRect.width,
                    this._titleText.height + PADDING * 2, 3);

                graphic.addChild(this._titleText);

                return graphic;
            });

        let nodeOffset = this.getXYOffset();
        node.x = nodeOffset.x;
        node.y = nodeOffset.y;

        this._nodeContainer.addChild(node);

        if (this.def.x !== undefined) {
            this.updatePosition({ dx: 0, dy: 0 });
        }
        return node;
    }

    public select(selection: string, elem: PIXI.Sprite, index: number,
        graphicsMgr: GraphicsManager) {
        // outline node
        let border = new PIXI.Graphics();
        border.lineStyle(STROKE_WIDTH * 2, SELECTION_COLOR);
        border.drawRoundedRect(0, 0, this._portRect.width,
            this.def.height, 3);

        let nodeOffset = this.getXYOffset();
        border.x = nodeOffset.x;
        border.y = nodeOffset.y;

        this._nodeContainer.addChildAt(border, 0);
        this._selectTempItems[`${selection}Select${index}`] = border;
        elem.parent.addChildAt(border, 0);
    }

    public unselect(selection: string, elem: PIXI.Sprite, index: number) {
        let border = this._selectTempItems[`${selection}Select${index}`];
        border.parent.removeChild(border);
        delete this._selectTempItems[`${selection}Select${index}`];
    }
}

export class D3PortDiagram extends UIElementRenderer {
    _rendererManager: UIRenderer;
    _renderer: any;
    _parent: any;
    _nodes: any;
    _requiresLayout: boolean;
    _renderedNodes: INodeRenderer[];

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
        this._requiresLayout = false;
        this._renderedNodes = [];

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
     * @deprecated ('Deprecated since 1.14.0 in favor of focus.  Will be removed in 2.x')
     * hover event
     *
     * @param event the event to pass to the renderer
     */
    public hover(event: IEvent): void {
        this.focus(event);
    }

    /**
     * bring an item into focus
     *
     * @param event the event to focus on
     */
    public focus(event: IEvent): void {
        this._renderer.focus(event);
    }

    /**
     * select an item
     *
     * @param event the event to focus on
     */
    public select(event: IEvent): void {
        this._renderer.select(event);
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

    private addNodePorts(portList: any, node: INodeRenderer, alignment: Alignment) {
        let self = this;
        if (portList) {
            let nodeKey = node.def.key;
            if (!self._nodePortInfo[nodeKey]) {
                self._nodePortInfo[nodeKey] = {};
            }

            let portArea: IRect = node.getPortAreaRect();

            let verticalPortSize = portArea.height / portList.length;  // amount of space the port can take
            let verticalPortOffset = verticalPortSize * .5;

            let horizontalPortSize = portArea.width / portList.length;  // amount of space the port can take
            let horizontallPortOffset = horizontalPortSize * .5;

            let nodePortMap = self._nodePortInfo[nodeKey];
            switch (alignment) {
                case Alignment.Top:
                    portList.forEach(function (port: any, index: number) {
                        let x = portArea.x + horizontallPortOffset + horizontalPortSize * index;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: x, y: 0 };
                    });
                    break;
                case Alignment.Bottom:
                    portList.forEach(function (port: any, index: number) {
                        let x = portArea.x + horizontallPortOffset + horizontalPortSize * index;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: x, y: node.def.height };
                    });
                    break;
                case Alignment.Left:
                    portList.forEach(function (port: any, index: number) {
                        let y = verticalPortOffset + verticalPortSize * index + portArea.y;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: portArea.x, y: y };
                    });
                    break;
                case Alignment.Right:
                    portList.forEach(function (port: any, index: number) {
                        let y = verticalPortOffset + verticalPortSize * index + portArea.y;
                        nodePortMap[port.key] =
                            { key: port.key, index: index, alignment: alignment, x: portArea.x + node.def.width, y: y };
                    });
                    break;
            }
        }
    }

    public addPorts(node: INodeRenderer) {
        this.addNodePorts(node.def.ports.left, node, Alignment.Left);
        this.addNodePorts(node.def.ports.right, node, Alignment.Right);
        this.addNodePorts(node.def.ports.top, node, Alignment.Top);
        this.addNodePorts(node.def.ports.bottom, node, Alignment.Bottom);
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

    public addNode(node: INodeRenderer) {
        node.configureNode();
        this._nodes[node.def.key] = node.def;
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

    public layout(nodes: INodeRenderer[], links: IRenderedDiagramLink[]) {
        let graph = this._element as IPortDiagram;
        let requiresLayout = graph.nodes && graph.nodes.length > 0 &&
            graph.nodes[0].x === undefined;

        if (requiresLayout) {
            var g = new dagre.graphlib.Graph();
            g.setGraph({ rankdir: 'LR' });
            g.setDefaultEdgeLabel(function () { return {}; });
            nodes.forEach((node: INodeRenderer) => {
                (node.def as any)['label'] = node.def.key;
                g.setNode(node.def.key, node.def);
            });
            links.forEach((link: IRenderedDiagramLink) => {
                g.setEdge(link.def.from as string, link.def.to as string);
            });
            dagre.layout(g);

            nodes.forEach((node: INodeRenderer) => {
                node.updatePosition({ dx: 0, dy: 0 });
            });
        }
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
        this._renderer.render(this._options);
    }

    public invalidate: any = this.render;
}

export class D3PortDiagramSVG extends D3ConnectedGraphSVG {
    protected _portDiagram: D3PortDiagram;

    constructor(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>,
        portDiagram: D3PortDiagram) {
        super(element, renderer, parent);

        DiagramBase.prototype.bind.call(this, this._renderer, this._element);

        this._portDiagram = portDiagram;

        this.getLinkStartXY = portDiagram.getLinkStartXY;
        this.getLinkEndXY = portDiagram.getLinkEndXY;
    }

    public render(options: IOptions) {
        let self = this;

        this.getHeightWidth(options);

        let graphArea = self.initializeGraphArea(options);

        self.initializeLinkLayer(graphArea);
        let nodeRenderers = self.renderNodes(graphArea);
        let renderedLinks = this._portDiagram.createRenderedLinks();

        self._portDiagram.layout(nodeRenderers, renderedLinks);

        this.renderLinkHelper(graphArea, renderedLinks);

        self.configureView();
    }

    private renderNodes(graphArea: d3.Selection<any, any, d3.BaseType, any>): INodeRenderer[] {
        let self = this;
        let graph = self._element as IPortDiagram;

        self._portDiagram._nodePortInfo = {};

        let nodeRenderers: INodeRenderer[] = [];

        let nodeGroup = graphArea.append('g')
            .attr('class', 'nodes');
        graph.nodes.forEach((nodeDef) => {
            if (graph.decimator && !graph.decimator(nodeDef)) {
                return;
            }
            // has to happen before addNode/addPorts
            let node: INodeRenderer;

            // has to happen before addNode/addPorts
            if (graph.nodeRenderType === NodeType.NodeRectangle ||
                nodeDef.renderType === NodeType.NodeRectangle) {
                node = new SVGRectangleNode(nodeDef, self._portDiagram, self._svg);
            } else {
                node = new SVGSimpleNode(nodeDef, self._portDiagram);
            }

            self._portDiagram.addNode(node);
            self._portDiagram.addPorts(node);
            nodeRenderers.push(node);

            // the function for moving the nodes
            function dragMove(nodeDef: IPortDiagramNode) {
                self._dataTooltip.hideTooltip();

                node.updatePosition(d3.event);

                let linksToUpdate: any[] = [];
                graphArea.selectAll('.link.' + nodeDef.key)
                    .each(function (link: any) {
                        linksToUpdate.push(link);
                    });
                self.renderLinkHelper(graphArea, linksToUpdate, true);
            }

            let renderedNode = node.renderNode({ group: nodeGroup })
                .on('mouseenter', self.nodeHoverStart)
                .on('mouseleave', self.hoverEnd)
                .call((<any>d3).drag()
                    .on('drag', dragMove));

            (renderedNode as any).node()['__data__'] = node.def;
            addClickHelper(renderedNode, self.getOptions(), graph.onClick,
                graph.onDoubleClick, graph.contextMenuItems,
                self._dataTooltip, graph, node.def, node.def.key);
            self._dataTooltip.setTarget(renderedNode);

            // we do this here instead of using the renderPorts helper
            // function because it's expensive to call selectAll multiple
            // times (aka once for each node if we call that helper)
            if (!(self._element as IPortDiagram).disablePortRendering) {
                // gather all the ports for rendering
                let nodePorts = this._portDiagram._nodePortInfo[node.def.key];
                for (let portKey in nodePorts) {
                    let port = nodePorts[portKey];
                    let renderedPort = node.renderPort(port);

                    (renderedPort.node() as any)['__data__'] = port;
                    addClickHelper(renderedPort, self.getOptions(), graph.onClick,
                        graph.onDoubleClick, graph.contextMenuItems,
                        this._dataTooltip, graph, port);
                    this._dataTooltip.setTarget(renderedPort);
                }
            }
        });
        return nodeRenderers;
    }
}
D3Renderer.register(UIType.PortDiagram, D3PortDiagram);

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

        this._portDiagram = portDiagram;

        this.getLinkStartXY = portDiagram.getLinkStartXY;
        this.getLinkEndXY = portDiagram.getLinkEndXY;
    }

    private renderNodes(stage: any): INodeRenderer[] {
        let self = this;
        let graph = self._element as IPortDiagram;

        // create graphics managers for caching
        self._nodeGraphics = new GraphicsManager(self._pixi);
        if (!(self._element as IPortDiagram).disablePortRendering) {
            self._portGraphics = new GraphicsManager(self._pixi);
        }

        let nodeRenderers: INodeRenderer[] = [];
        graph.nodes.forEach(function (node: IPortDiagramNode) {
            // initialize node info
            let nodeRenderer: INodeRenderer;
            // has to happen before addNode/addPorts
            if (graph.nodeRenderType === NodeType.NodeRectangle ||
                node.renderType === NodeType.NodeRectangle) {
                nodeRenderer = new PIXIRectangleNode(node, self._pixiHelper);
            } else {
                nodeRenderer = new PIXISimpleNode(node);
            }

            self._portDiagram.addNode(nodeRenderer);
            self._portDiagram.addPorts(nodeRenderer)
            nodeRenderers.push(nodeRenderer);

            if (graph.decimator && !graph.decimator(node)) {
                return;
            }

            let color = parseInt(self._portDiagram.getColor(node).substring(1), 16);

            // RENDER THE NODE
            let nodeGraphic: PIXI.Container = nodeRenderer.renderNode({
                color: color,
                manager: self._nodeGraphics
            });

            (nodeGraphic as any).__data__ = node;
            (nodeGraphic as any).renderer = nodeRenderer;

            // add item lets us do selection
            self._pixiHelper.addSelection(node.key, nodeGraphic);

            self._pixiHelper.addInteractionHelper(nodeGraphic, self.getOptions(),
                graph.onClick, graph.onDoubleClick, graph.contextMenuItems,
                self.nodeHoverStart, self.hoverEnd,
                self._dataTooltip, graph, node, node.key);

            // RENDER THE PORTS
            if (!(self._element as IPortDiagram).disablePortRendering) {
                // gather all the ports for rendering
                let nodePorts = self._portDiagram._nodePortInfo[node.key];
                for (let portKey in nodePorts) {
                    let port = nodePorts[portKey];

                    let portGraphic = nodeRenderer.renderPort(port, {
                        color: color,
                        manager: self._portGraphics
                    });

                    self._pixiHelper.addSelection(node.key, portGraphic);
                    self._pixiHelper.addSelection(node.key + port.key, portGraphic);

                    self._pixiHelper.addInteractionHelper(portGraphic, self.getOptions(),
                        graph.onClick, graph.onDoubleClick, graph.contextMenuItems,
                        self.nodeHoverStart, self.hoverEnd,
                        self._dataTooltip, graph, { def: port }, node.key);
                }
            }

            // CONFIGURE HOVER/DRAG ON CONTAINER
            let nodeContainer = nodeRenderer.getNode();

            // the function for moving the nodes
            let prevPos: any;
            function dragStart(event: any) {
                // store a reference to the data
                // the reason for this is because of multitouch
                // we want to track the movement of this particular touch
                this.data = event.data;
                this.dragging = true;

                // itemDragging is a workaround to have d3 and pixi coexist for events
                stage.itemDragging = true;

                prevPos = this.data.getLocalPosition(nodeContainer.parent);
                event.stopPropagation();
            }

            function dragMove(event: any) {
                if (this.dragging) {
                    self._dataTooltip.hideTooltip();
                    let pos = this.data.getLocalPosition(nodeContainer.parent);

                    pos.dx = pos.x - prevPos.x;
                    pos.dy = pos.y - prevPos.y;

                    // TODO make NodeType a class to get rid of all these if statements
                    nodeRenderer.updatePosition(pos);

                    self.renderLinkHelper(stage, self._renderedLinks);
                    self._pixiHelper.render();

                    event.stopPropagation();
                    prevPos = pos;
                }
            }

            function dragEnd() {
                this.dragging = false;

                // itemDragging is a workaround to have d3 and pixi coexist for events
                stage.itemDragging = false;
                // set the interaction data to null
                this.data = null;
            }

            nodeGraphic
                .on('mousedown', dragStart)
                .on('touchstart', dragStart)
                // events for drag end
                .on('mouseup', dragEnd)
                .on('mouseupoutside', dragEnd)
                .on('touchend', dragEnd)
                .on('touchendoutside', dragEnd)
                // events for drag move
                .on('mousemove', dragMove)
                .on('touchmove', dragMove);

            stage.addChild(nodeContainer);
        });
        return nodeRenderers;
    }

    public _select(selection: string) {
        if (selection) {
            let items = this._pixiHelper.getSelection(selection);
            if (items) {
                let self = this;
                items.forEach(function (elem: any, index: number) {
                    // assigned this renderer when rendering the node so we
                    // could find it later easily
                    elem.renderer.select(selection, elem, index, self._nodeGraphics);
                });
            }
            this._pixiHelper.render();
        }
    }

    public _unselect(selection: string) {

        let items = this._pixiHelper.getSelection(selection);
        if (items) {
            items.forEach(function (elem: any, index: number) {
                // assigned this renderer when rendering the node so we
                // could fifnd it later easily
                elem.renderer.unselect(selection, elem, index);
            });
            this._pixiHelper.render();
        }
    }

    // cache the basic graphic structures so we can clone them
    // vs recreating them
    public render(options: IOptions) {
        merge(this._options, options);

        this.getHeightWidth(this._options);

        let self = this;
        let graph = self._element as IPortDiagram;

        let first = this._pixiHelper === undefined;
        if (!first && (options.height || options.width)) {
            this._pixi.resize(self._options.width, self._options.height);
            this._pixiHelper.render();
            return;
        }

        self._portDiagram._nodePortInfo = {};

        let stage = self.initializeGraphArea(options);

        let nodeRenderers = self.renderNodes(stage);
        this._renderedLinks = self._portDiagram.createRenderedLinks();

        self._portDiagram.layout(nodeRenderers, this._renderedLinks);

        self.renderLinkHelper(stage, this._renderedLinks);

        //Render the stage
        self.configureView();
        self._pixiHelper.render(stage);

    }
}
D3Renderer.register(UIType.PortDiagram, D3PortDiagram);