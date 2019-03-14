import { IXYValue } from '../../interface/chart/series-data';
import {
    IEvent, IOptions, IRect, EventType, Alignment, Rect, UIElement,
    IContextMenuItem, UIRenderer, ILegendItem
} from '../../interface/ui-base';
import {
    IDiagramLink, IGraphLink, IGraphNode, IConnectedGraph, LinkType,
    IHierarchyGraph, IPortDiagram
} from '../../interface/graph';
import { showContextMenu } from '../context-menu';
import { SelectionHelper } from '../selection';
import { merge, getSelectionName } from '../utilities';
import { CustomDivTooltip, OneLineTooltip } from '../tooltip';

import { UIElementRenderer } from '../renderer';
import {
    addClickHelper, convertToSVGCoords, Brush, D3Legend,
    SVGRenderer, Arrow, animatePath
} from '../svg-helper';

import {
    PIXIHelper
} from '../pixi-helper';

import * as d3 from 'd3';
import * as PIXI from 'pixi.js';

/**
 * If you want to extend this class and its helpers then before rendering the links
 * you have to add source and target properties to the original links which are
 * the associated link from/to objects.
 */
export class ConnectedGraphBase {
    _parent: any;
    _graphContainer: any;
    _zoom: d3.ZoomBehavior<Element, {}>;
    _svg: any;
    _svgRect: any;

    _element: IConnectedGraph;
    _contextMenuItems: IContextMenuItem[];
    _dataTooltip: CustomDivTooltip;
    _tooltipId: string;
    _tooltipAnalyticsName: string;
    _options: IOptions;

    _brush: Brush;
    _brushTooltip: OneLineTooltip;

    onHoverChanged: (event?: IEvent) => void;
    nodeHoverStart: () => void;
    linkHoverStart: () => void
    hoverEnd: () => void;
    getTooltipData: (event: IEvent) => any;

    getLinkNode: (linkNode: any, nodes: IGraphNode[],
        nodeMap: { [index: string]: number }) => void;
    getNextXY: (rect: IRect, portAlignment: Alignment, fromXY: IXYValue,
        toXY: IXYValue) => IXYValue;
    addElbow: (path: IXYValue[], link: IRenderedDiagramLink, fromXY: IXYValue,
        toXY: IXYValue) => void;
    getElbowLinkPath: (link: IRenderedDiagramLink, fromXY: IXYValue,
        toXY: IXYValue) => any[];

    getSelectionString: (data: any) => string;
    getTooltipString: (data: any) => string;

    bindZoom: () => void;
    configureZoom: (xExtent: number[], yExtent: number[],
        height: number, width: number) => void;

    renderLegend: (height: number) => number;

    brush: (event: IEvent) => void;
    configureBrush: () => void;
    configureContextMenu: () => void;

    getAnimateDuration: () => number;

    protected static addNode(node: any, nodeList: IGraphNode[],
        nodeMap: { [index: string]: number }): number {
        if (nodeMap.hasOwnProperty(node.key)) {
            return nodeMap[node.key];
        }

        node.node = nodeList.length;
        nodeMap[node.key] = node.node;
        nodeList.push(node);

        return node.node;
    }

    initializeGraph(def: IConnectedGraph): void {
        // get the indicies for each key in the node list
        if (!def.nodes) {
            def.nodes = [];
        }

        let nodeMap: { [index: string]: number } = {};
        for (let i = 0; i < def.nodes.length; ++i) {
            let node: any = def.nodes[i];
            node.node = i;
            nodeMap[node.key] = i;
        }

        for (let i = 0; i < def.links.length; ++i) {
            let link: any = def.links[i];
            link.source = this.getLinkNode(link.from, def.nodes, nodeMap);
            link.target = this.getLinkNode(link.to, def.nodes, nodeMap);
        }
    }

    bind(renderer: UIRenderer, graph: IPortDiagram,
        getSelectionString: (data: any) => string,
        getTooltipString: (data: any) => string) {

        let self = this;
        this.getSelectionString = getSelectionString ? getSelectionString :
            (data: any): string => {
                return data.source.key + '-' + data.target.key;
            }

        this.getTooltipString = getTooltipString ? getTooltipString :
            (data: any): string => {
                let ret: string;
                if (data.source) {
                    ret = data.source.key + ' → ' + data.target.key + '\n' + data.value;
                } else {
                    ret = data.key + '\n';
                    if (data.value !== undefined) {
                        ret += data.value;
                    }
                }
                return ret;
            }

        this.onHoverChanged = function (event?: IEvent) {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }
            let hoverCallback = graph.onHover;
            if (hoverCallback) {
                hoverCallback(event);
            } else {
                renderer.hover(graph, event);
            }
            return true;
        }

        let myPrevHover: any; // used in callbacks
        this.nodeHoverStart = function () {
            let selection = this.__data__.key;
            myPrevHover = selection;
            return self.onHoverChanged({
                caller: graph,
                event: EventType.HoverStart,
                selection: selection
            });
        }    // onHoverEnter

        this.linkHoverStart = function () {
            let selection = self.getSelectionString(this.__data__);
            myPrevHover = selection;
            return self.onHoverChanged({
                caller: graph,
                event: EventType.HoverStart,
                selection: selection
            });
        }    // onHoverEnter

        this.hoverEnd = function () {
            let ret = self.onHoverChanged({
                caller: graph,
                event: EventType.HoverEnd,
                selection: myPrevHover
            });

            myPrevHover = undefined;
            return ret;
        }   // onHoverLeave
        this.getTooltipData = function (event: IEvent): any {
            let data = event.data.data;
            if (data) {
                this._dataTooltip.setData(self.getTooltipString(data), []);
            }
            return [];
        }

        // Create the tooltip
        // delay is 0 because the tooltip crosses divs and with a delay it causes
        // flashing
        let showTooltip = (d: any) => {
            if (d.def) {
                d = d.def;
            }

            let data: any = {
                tooltip: self._dataTooltip,
                data: d
            }
            let output: string;
            let cb = graph.onTooltip;
            if (cb) {
                cb({ caller: graph, data: data });
            } else {
                this.getTooltipData({ caller: graph, data: data });
            }

            return true;
        }

        this._dataTooltip = new CustomDivTooltip(this._tooltipId, 'tooltip-t');
        this._dataTooltip
            .setAnalyticsName(this._tooltipAnalyticsName)
            .setEnterCallback(showTooltip)
            .setMoveCallback(showTooltip)
            .setPlaceTooltipLeftRight()
            .alwaysRecalcWidth(true)
            .setDelay(0);

        this.getLinkNode = (linkNode: any, nodes: IGraphNode[], nodeMap: { [index: string]: number }) => {
            if (typeof linkNode === 'string' || linkNode instanceof String) {
                return ConnectedGraphBase.addNode({ key: linkNode }, nodes, nodeMap);
            }

            return ConnectedGraphBase.addNode(linkNode, nodes, nodeMap);
        }

        // link helper stuff
        this.getNextXY = (rect: IRect, portAlignment: Alignment, fromXY: IXYValue, toXY: IXYValue) => {
            switch (portAlignment) {
                case Alignment.Bottom:
                case Alignment.Top:
                    if (fromXY.x < toXY.x) {
                        return { x: rect.x + rect.width + 10, y: fromXY.y };
                    } else {
                        return { x: rect.x - 10, y: fromXY.y };
                    }
                case Alignment.Left:
                case Alignment.Right:
                    if (fromXY.y < toXY.y) {
                        return { x: fromXY.x, y: rect.y + rect.height + 10 };
                    } else {
                        return { x: fromXY.x, y: rect.y - 10 };
                    }
            }
        }

        this.addElbow = (path: IXYValue[], link: IRenderedDiagramLink,
            fromXY: IXYValue, toXY: IXYValue) => {
            // have to be a little careful here, some diagrams have ports that stick out and
            // some don't, the reason right now at least this does it based on alignment
            // is so those without ports that stick out look ok.

            // if we are going outside of our parent (in graphs with parents ) then it is very possible
            // we may have a collision so throw in some randomness in the elbow offset
            let isSameParent = (link.source.node as any).from === (link.source.node as any).to;
            let elbowOffset = 0;
            // get the entry point of the to node and draw the elbow line
            switch (link.target.alignment) {
                case Alignment.Bottom:
                    elbowOffset = isSameParent ? (fromXY.y + toXY.y) / 2 :
                        (fromXY.y - toXY.y) * Math.random() + toXY.y;
                    path.push({ x: fromXY.x, y: elbowOffset });
                    path.push({ x: toXY.x, y: elbowOffset });
                    break;
                case Alignment.Top:
                    elbowOffset = isSameParent ? (fromXY.y + toXY.y) / 2 :
                        (toXY.y - fromXY.y) * Math.random() + fromXY.y;
                    path.push({ x: fromXY.x, y: elbowOffset });
                    path.push({ x: toXY.x, y: elbowOffset });
                    break;
                case Alignment.Left:
                    elbowOffset = isSameParent ? (fromXY.x + toXY.x) / 2 :
                        (toXY.x - fromXY.x) * Math.random() + fromXY.x;
                    path.push({ x: elbowOffset, y: fromXY.y });
                    path.push({ x: elbowOffset, y: toXY.y });
                    break;
                case Alignment.Right:
                    elbowOffset = isSameParent ? (fromXY.x + toXY.x) / 2 :
                        (fromXY.x - toXY.x) * Math.random() + fromXY.x;
                    path.push({ x: elbowOffset, y: fromXY.y });
                    path.push({ x: elbowOffset, y: toXY.y });
                    break;
            }
        }
        /**
         * create the paths to render simple elbow links using the link information provided
         */
        this.getElbowLinkPath = (link: IRenderedDiagramLink, fromXY: IXYValue, toXY: IXYValue) => {
            let self = this;
            let path = [];

            // if we have ports that aren't opposite (like top/bottom or right/left) we need to
            // adjust the input and output ports a bit
            let portsAligned =
                (link.source.alignment === Alignment.Left && link.target.alignment === Alignment.Right) ||
                (link.source.alignment === Alignment.Right && link.target.alignment === Alignment.Left) ||
                (link.source.alignment === Alignment.Top && link.target.alignment === Alignment.Bottom) ||
                (link.source.alignment === Alignment.Bottom && link.target.alignment === Alignment.Top);

            // even if they are aligned if the nodes are positioned where the links will go through
            // the ports then we adjust the ports
            if (portsAligned) {
                switch (link.source.alignment) {
                    case Alignment.Left:
                        if (toXY.x > fromXY.x) {
                            portsAligned = false;
                        }
                        break;
                    case Alignment.Right:
                        if (toXY.x < fromXY.x) {
                            portsAligned = false;
                        }
                        break;
                    case Alignment.Top:
                        if (toXY.y > fromXY.y) {
                            portsAligned = false;
                        }
                        break;
                    case Alignment.Bottom:
                        if (toXY.y < fromXY.y) {
                            portsAligned = false;
                        }
                        break;
                }
            }

            if (portsAligned) {
                switch (link.target.alignment) {
                    case Alignment.Left:
                        if (toXY.x < fromXY.x) {
                            portsAligned = false;
                        }
                        break;
                    case Alignment.Right:
                        if (toXY.x > fromXY.x) {
                            portsAligned = false;
                        }
                        break;
                    case Alignment.Top:
                        if (toXY.y < fromXY.y) {
                            portsAligned = false;
                        }
                        break;
                    case Alignment.Bottom:
                        if (toXY.y > fromXY.y) {
                            portsAligned = false;
                        }
                        break;
                }
            }

            // if ports aren't aligned we need to add in a joint so it the link clears the node
            // need the currentXY as we draw our path to make the joints look nice and even
            if (portsAligned) {
                // simple case where everything is in a nice place just add in the link
                path.push(fromXY);
                this.addElbow(path, link, fromXY, toXY);
                path.push(toXY);
            } else {
                let currentXY: IXYValue;
                let nextXY: IXYValue;
                // if the links need some additional lines to make the links not run through the nodes
                // then do this...
                path.push(fromXY);

                // add additional link elbow due to help with alignment issues
                let sourceXY = link.source.node;
                currentXY = self.getNextXY(getCoordsAndCache(self._graphContainer, link.source.node),
                    link.source.alignment, fromXY, toXY);
                path.push(currentXY);

                nextXY = self.getNextXY(getCoordsAndCache(self._graphContainer, link.target.node),
                    link.target.alignment, toXY, fromXY);

                this.addElbow(path, link, currentXY, nextXY);
                path.push(nextXY);
                path.push(toXY);
            }

            return path;
        }

        this.configureZoom = (xExtent: number[], yExtent: number[],
            height: number, width: number) => {

            if (this._options.disableZoomViewUpdate) {
                return;
            }

            let self = this;

            let nodeWidth = (xExtent[1] - xExtent[0]);
            let nodeHeight = (yExtent[1] - yExtent[0]);

            let centerX = nodeWidth / 2 + xExtent[0];
            let centerY = nodeHeight / 2 + yExtent[0];

            let yScale = height / nodeHeight;
            let xScale = width / nodeWidth;
            let zoomedOutScale = Math.min(1, yScale, xScale);
            self._zoom.scaleExtent([zoomedOutScale / 3, 1.5]);

            if (self._options.fitToWindow) {
                let zoomLevel = d3.zoomIdentity
                    .translate((width / 2) - (centerX * zoomedOutScale),
                        (height / 2) - (centerY * zoomedOutScale))
                    .scale(zoomedOutScale);
                self._graphContainer
                    .call(self._zoom.transform, zoomLevel);
            }

            self._contextMenuItems.push({
                title: 'Reset Zoom',
                action(elem: any, data: any, index: any) {
                    if (self._options.fitToWindow) {
                        let zoomLevel = d3.zoomIdentity
                            .translate((width / 2) - (centerX * zoomedOutScale),
                                (height / 2) - (centerY * zoomedOutScale))
                            .scale(zoomedOutScale);
                        self._graphContainer
                            .transition()
                            .duration(self.getAnimateDuration())
                            .call(self._zoom.transform, zoomLevel);
                    } else {
                        self._graphContainer
                            .transition()
                            .duration(self.getAnimateDuration())
                            .call(self._zoom.transform, d3.zoomIdentity);
                    }
                }
            });
        }

        this.configureBrush = () => {
            let self = this;

            // a generic callback to handle brush selection events
            function onBrushCallback(coords: any[], eventType: EventType): boolean {
                if (!coords) {
                    return false;
                }

                let chart = self._element;
                let options = {
                    event: eventType,
                    xStart: coords[0][0],
                    xEnd: coords[1][0],
                    yStart: coords[0][1],
                    yEnd: coords[1][1],
                    caller: chart
                };

                let cb = chart.onBrush;
                if (cb) {
                    cb(options);
                } else {
                    self.brush(options);
                }
                return true;
            }

            let updateBrushTooltip = function (coords: any[]) {
                if (coords === null) {
                    return;
                }

                self._brushTooltip.setData('Selection',
                    '(' + coords[0][0].toFixed(2) + ', ' + coords[0][1].toFixed(2) + ') - ' +
                    '(' + coords[1][0].toFixed(2) + ', ' + coords[1][1].toFixed(2) + ')');
            }

            let brushStart = function (coords: any[]): boolean {
                self._brush.moveToFront();
                updateBrushTooltip(coords);
                self._dataTooltip.onMouseLeave(d3.event);
                self._brushTooltip.onMouseEnter(d3.event);
                self._brushTooltip.onMouseMove(d3.event);
                return onBrushCallback(coords, EventType.BrushStart);
            }

            let brushMove = function (coords: any[]): boolean {
                updateBrushTooltip(coords);
                self._dataTooltip.onMouseLeave(d3.event);
                self._brushTooltip.onMouseMove(d3.event);

                return onBrushCallback(coords, EventType.BrushMove);
            }

            let brushEnd = function (coords: any[]): boolean {
                self._brushTooltip.onMouseLeave(d3.event);

                let brushContextMenuItems = (self._element as IConnectedGraph).brushContextMenuItems;
                if (coords && brushContextMenuItems) {
                    let contextMenuItems = [];

                    for (let i = 0; i < brushContextMenuItems.length; ++i) {
                        let bcmi = brushContextMenuItems[i];
                        contextMenuItems.push({
                            title: bcmi.title,
                            action(elem: any, data: any, index: any) {
                                data.xStart = coords[0][0];
                                data.xEnd = coords[1][0];
                                data.yStart = coords[0][1];
                                data.yEnd = coords[1][1];

                                bcmi.action(elem, data, index);
                                onBrushCallback(coords, EventType.BrushEnd);
                            }
                        });
                    }

                    showContextMenu(d3.event.sourceEvent,
                        {
                            event: EventType.BrushEnd,
                            caller: self._element
                        },
                        contextMenuItems);
                } else {
                    let menus = document.getElementsByClassName('context-menu');
                    if (menus.length > 0) {
                        (menus[0] as any).style.display = 'none';
                    }
                }

                // when moving with overlay for zoomed region leave the brush on top
                if (!self._options.forceBrushToFront) {
                    self._brush.moveToBack();
                }

                return true;
            }

            // the selection brush
            self._svg.select('.brush').remove();

            self._brushTooltip = new OneLineTooltip('brush', 'tooltip-t');
            self._brushTooltip
                .setPlaceTooltipLeftRight()
                .alwaysRecalcWidth(true)
                .setDelay(0);
            self._brush = new Brush()
                .setXY(true)
                .setTarget(self._svg.append('g').attr('class', 'brush'))
                .setStartCallback(brushStart)
                .setMoveCallback(brushMove)
                .setEndCallback(brushEnd)
                .setRect(self._svgRect)
                .ready();
            self._brush.moveToBack();
        }
    }

    public configureView(height: number, width: number) {
        let xExtent: number[] = [Number.MAX_VALUE, -Number.MAX_VALUE];
        let yExtent: number[] = [Number.MAX_VALUE, -Number.MAX_VALUE];

        let graph = this._element as IConnectedGraph;
        graph.nodes.forEach(function (nodeDef: any) {
            xExtent[0] = Math.min(xExtent[0], nodeDef.x);
            xExtent[1] = Math.max(xExtent[1], nodeDef.x);
            yExtent[0] = Math.min(yExtent[0], nodeDef.y);
            yExtent[1] = Math.max(yExtent[1], nodeDef.y);
        });

        height = this.renderLegend(height);

        this.bindZoom();
        this.configureZoom(xExtent, yExtent, height, width);
        this.configureContextMenu();

        if (this._svg && !this._options.disableBrush) {
            // set timeout to let svg size change
            let self = this;
            setTimeout(function () {
                self.configureBrush();
            }, 0);
        }
    }
}

export class DiagramBase extends ConnectedGraphBase {
    bind(renderer: UIRenderer, graph: IPortDiagram) {
        ConnectedGraphBase.prototype.bind.call(this, renderer, graph,
            (data: any) => {
                return data.source.key + '-' + data.target.key;
            },
            (data: any) => {
                let ret: string;
                if (data.from) {
                    if (data.linkType &&
                        (data.linkType & LinkType.Directional) === LinkType.Directional) {
                        ret = data.from + ' \u2192 ' + data.to + '\n';
                    } else {
                        ret = data.from + ' \u2194 ' + data.to + '\n';
                    }
                } else if (data.port) {
                    ret = data.node.key + ':' + data.port.key;
                } else {
                    ret = data.label ? data.label : data.key;
                }
                return ret;
            });
    }
}

export class D3ConnectedGraphSVG extends SVGRenderer {
    _graphContainer: any;
    _zoom: d3.ZoomBehavior<Element, {}>;

    _dataTooltip: CustomDivTooltip;
    _tooltipId: string;
    _tooltipAnalyticsName: string;

    _contextMenuItems: IContextMenuItem[];
    _brush: Brush;
    _brushTooltip: OneLineTooltip;

    onHoverChanged: (event?: IEvent) => void;
    nodeHoverStart: () => void;
    linkHoverStart: () => void;
    hoverEnd: () => void;

    /** get the xy position of the start of the link */
    getLinkStartXY: (link: IRenderedDiagramLink) => IXYValue;
    /** get the xy position of the end of the link */
    getLinkEndXY: (link: IRenderedDiagramLink) => IXYValue;
    getElbowLinkPath: (link: IRenderedDiagramLink, fromXY: IXYValue,
        toXY: IXYValue) => any[];

    configureZoom: (xExtent: number[], yExtent: number[],
        height: number, width: number) => void;

    constructor(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        super();

        this.initialize(element, renderer, parent);
        this._graphContainer = this._svg;

        ConnectedGraphBase.prototype.bind.call(this, renderer, element);
    }

    protected renderLegend(graphHeight?: number): number {
        let self = this;

        let graph = self._element as IConnectedGraph;
        if (graph.legend) {
            let legendItems: ILegendItem[] = [];
            for (let i = 0; i < graph.nodes.length; ++i) {
                let node = graph.nodes[i];
                let key = node.type && node.type.length > 0 ? node.type[0] : node.key;
                let elem = self._svg.select('.node.' + key);
                legendItems.push({
                    key: key,
                    color: elem.style('fill'),
                    opacity: elem.style('opacity')
                });
            }

            // group colors mess up unless we remove duplicates here
            let itemNames: { [index: string]: boolean } = {};
            let legendMaxChars = 0;
            for (let i = 0; i < legendItems.length; ++i) {
                let item = legendItems[i];
                if (!itemNames.hasOwnProperty(item.key)) {
                    itemNames[item.key] = true;
                    legendMaxChars = Math.max(item.key.length, legendMaxChars);
                }
            }

            // render the legend
            let marginTop = 10;
            let d3Legend: D3Legend;
            switch (graph.legend.alignment) {
                case Alignment.Top:
                    d3Legend = new D3Legend(this._svg, graph.legend, graph.title,
                        new Rect(0, marginTop, this._svgRect.width, this._svgRect.height));
                    break;
                case Alignment.Bottom:
                    d3Legend = new D3Legend(this._svg, graph.legend, graph.title,
                        new Rect(0, this._svgRect.height - this.LEGEND_PADDING.Y.BOTTOM,
                            this._svgRect.width, this._svgRect.height));
                    break;
                case Alignment.Left:
                    d3Legend = new D3Legend(this._svg, graph.legend, graph.title,
                        new Rect(0, marginTop, this._svgRect.width, this._svgRect.height));
                    break;
                case Alignment.Right:
                    d3Legend = new D3Legend(this._svg, graph.legend, graph.title,
                        new Rect(this._svgRect.width - (legendMaxChars * 10), marginTop,
                            this._svgRect.width, this._svgRect.height));
                    break;
            }

            d3Legend.addItems(legendItems);
            d3Legend.render();

            if (!graphHeight) {
                graphHeight = this._options.height;
            }
            if (graph.legend.alignment === Alignment.Top ||
                graph.legend.alignment === Alignment.Bottom) {
                graphHeight += d3Legend.getRenderedRect().height;
            }
        }
        return graphHeight;
    }

    protected bindZoom(): void {
        if (this._options.disableZoomViewUpdate) {
            return;
        }

        let self = this;
        let graphArea = self._svg.select('.graphArea');

        // add graph view area to allow us to pan/zoom it
        function performZoom() {
            graphArea.attr('transform', d3.event.transform);
        }

        self._zoom = d3.zoom().on('zoom', performZoom);
        self._svg.call(self._zoom);

        if (!self._element.api) {
            self._element.api = {}
        }
        self._element.api.zoom = function (event: IEvent) {
            if (event.data) {
                self._zoom.scaleTo(self._parent, event.data);
            }
        }

        self._element.api.pan = function (event: IEvent) {
            self._zoom.translateTo(self._parent, event.xStart, event.yStart);
        }
    }


    protected configureContextMenu(): void {
        let self = this;

        let graph = self._element as IConnectedGraph;
        if (graph.contextMenuItems) {
            for (let i = 0; i < graph.contextMenuItems.length; ++i) {
                self._contextMenuItems.push(graph.contextMenuItems[i]);
            }
        }

        if (self.saveImage && self._options.enableSaveAsImage) {
            let saveImageItem = {
                title: 'Save As Image',
                action: function (elem: any, data: any, index: number) {
                    self.saveImage();
                },
                disabled: false // optional, defaults to false
            };

            self._contextMenuItems.push(saveImageItem);
        }

        // create anyc context menu
        if (self._contextMenuItems.length > 0) {
            self._parent.on('contextmenu', function (event: any) {
                showContextMenu(d3.event, undefined, self._contextMenuItems);
            });
        }
    }

    public initializeGraphArea(options: IOptions) {
        this.loadOptions(options);

        this._svg.selectAll('*').remove();
        let graphArea = this._svg.append('g').classed('graphArea', true);

        this._contextMenuItems = [];

        return graphArea;
    }

    /**
     * configure the hover requirements for a node
     */
    protected configureLinkHover(elem: any, link: IRenderedDiagramLink) {
        let self = this;
        elem.on('mouseenter', self.linkHoverStart)
            .on('mouseleave', self.hoverEnd);

        let graph = (this._element as IHierarchyGraph);
        addClickHelper(elem, graph.onClick, graph.onDoubleClick, graph.contextMenuItems,
            self._dataTooltip, graph, link.def);

        let htmlNode = elem.node();
        htmlNode['__data__'] = link;
    }

    protected initializeLinkLayer(graphArea: d3.Selection<any, any, d3.BaseType, any>) {
        // go through and compute the link paths
        graphArea.append('g')
            .classed('links', true);
    }

    // TODO? Move this to D3ConnectedGraph so the simple graph can use this too?
    protected renderLinkHelper(graphArea: d3.Selection<any, any, d3.BaseType, any>,
        renderedLinks: IRenderedDiagramLink[], isUpdate?: boolean) {

        let self = this;

        // render the links
        let line = d3.line<any>()
            .x(function (d: any) { return d.x })
            .y(function (d: any) { return d.y });

        let curve = d3.line<any>()
            .x(function (d: any) { return d.x })
            .y(function (d: any) { return d.y })
            .curve(d3.curveBasis);


        let linkGroup = graphArea.select('.links');

        let getClasses = function (link: any) {
            let classes = link.def.from + '-' + link.def.to +
                ' ' + link.def.from + ' ' + link.def.to;
            if (link.def.type && link.def.type.length > 0) {
                for (let idx = 0; idx < link.def.type.length; ++idx) {
                    classes += ' ' + getSelectionName(link.def.type[idx]);
                }
            }

            return classes;
        }

        let getColor = function (link: any) {
            if (link.def.color) {
                return link.def.color;
            }
            if (link.def.type && link.def.type.length > 0) {
                for (let idx = 0; idx < link.def.type.length; ++idx) {
                    if (self._colorMgr.hasColor(link.def.type[idx])) {
                        return self._colorMgr.getColor(link.def.type[idx]);
                    }
                }
            }
            return 'black';
        };

        // remove this existing link if it exists as this is render update
        if (isUpdate) {
            renderedLinks.forEach(function (link: IRenderedDiagramLink) {
                let d3Link = graphArea.selectAll('.' + link.def.from + '-' + link.def.to +
                    '.' + link.def.from + '.' + link.def.to);
                d3Link.remove();
            });
        }

        renderedLinks.forEach(function (renderedLink: IRenderedDiagramLink) {
            let renderedLinkDef = renderedLink.def as IDiagramLink;

            // could cache some of this stuff for performance reasons

            let fromXY = self.getLinkStartXY(renderedLink);
            let toXY = self.getLinkEndXY(renderedLink);

            if ((renderedLinkDef.linkType & LinkType.Linear) === LinkType.Linear) {
                renderedLink.path = [fromXY, toXY];
            } else {
                renderedLink.path = self.getElbowLinkPath(renderedLink, fromXY, toXY);
            }

            let linkRenderer: d3.Line<any>;
            if (renderedLinkDef.linkType & LinkType.Curve) {
                linkRenderer = curve;
            } else {
                linkRenderer = line;
            }

            let newLink = linkGroup
                .append('path')
                .attr('d', linkRenderer(renderedLink.path))
                .classed(getClasses(renderedLink), true)
                .classed('link', true)
                .attr('fill', 'none')
                .style('stroke', getColor(renderedLink))
                .attr('stroke-width', renderedLinkDef.width ? renderedLinkDef.width : 2)

            let arrow: any;
            let endPoint: any;
            if (renderedLinkDef.linkType & LinkType.Directional ||
                renderedLinkDef.linkType & LinkType.Bidirectional) {
                endPoint = renderedLink.path[renderedLink.path.length - 1];
                arrow = Arrow.createArrow(linkGroup, 4)
                    .classed(getClasses(renderedLink), true)
                    .classed('arrow', true)
                    .attr('fill', getColor(renderedLink))
                    .attr('transform',
                        'translate(' + endPoint.x + ',' + endPoint.y + ') ' +
                        'rotate( ' + Arrow.getAngle(renderedLink.path[renderedLink.path.length - 2],
                            endPoint) + ')');
            }
            if (renderedLinkDef.linkType & LinkType.Bidirectional) {
                Arrow.createArrow(linkGroup, 4)
                    .classed(getClasses(renderedLink), true)
                    .classed('arrow', true)
                    .attr('fill', getColor(renderedLink))
                    .attr('transform',
                        'translate(' + renderedLink.path[0].x + ',' + renderedLink.path[0].y + ') ' +
                        'rotate( ' + Arrow.getAngle(renderedLink.path[1], renderedLink.path[0]) + ')');
            }

            if (!isUpdate && self.getAnimateDuration() !== 0) {
                animatePath(newLink, self.getAnimateDuration());

                if (arrow) {
                    Arrow.animateArrow(newLink, arrow, self.getAnimateDuration());
                }
            }

            self.configureLinkHover(newLink, renderedLink);
            self._dataTooltip.setTarget(newLink);
        });
    }

    protected configureView() {
        let height = this._options.height ? this._options.height : 400;
        let width = this._options.width;

        this._svg
            .attr('width', width)
            .attr('height', height);
        ConnectedGraphBase.prototype.configureView.call(this, height, width);
    }
    // END SVG STUFF
}

export class D3ConnectedGraphPixi extends UIElementRenderer {
    /*****************************
     * ConnectedGraphHelper code
     */
    _graphContainer: any;
    _zoom: d3.ZoomBehavior<Element, {}>;

    protected _renderer: UIRenderer;
    protected _parent: any;

    _dataTooltip: CustomDivTooltip;
    _tooltipId: string;
    _tooltipAnalyticsName: string;

    protected _contextMenuItems: IContextMenuItem[];

    onHoverChanged: (event?: IEvent) => void;
    nodeHoverStart: () => void;
    linkHoverStart: () => void;
    hoverEnd: () => void;

    /** get the xy position of the start of the link */
    getLinkStartXY: (link: IRenderedDiagramLink) => IXYValue;
    /** get the xy position of the end of the link */
    getLinkEndXY: (link: IRenderedDiagramLink) => IXYValue;
    getElbowLinkPath: (link: IRenderedDiagramLink, fromXY: IXYValue,
        toXY: IXYValue) => any[];

    configureZoom: (xExtent: number[], yExtent: number[],
        height: number, width: number) => void;

    /*********************************************
     * Renderer specific code
     */

    protected _selectionHelper: SelectionHelper;

    protected _pixi: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    protected _pixiHelper: PIXIHelper;
    protected _stage: PIXI.Container;

    protected _pixiLinks: PIXI.Graphics;
    protected _arrowTexture: PIXI.Texture;
    protected _pixiArrows: PIXI.Container;

    constructor(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {

        super();

        this._element = element as IPortDiagram;
        this._renderer = renderer;

        this._options = {};
        this._contextMenuItems = [];

        this._tooltipId = 'd3-tooltip';
        this._tooltipAnalyticsName = 'd3-ui-widget-toolkit';

        this._parent = parent;
        this._graphContainer = parent;

        ConnectedGraphBase.prototype.bind.call(this, renderer, element);
    }

    /**
     * hover event
     *
     * @param event the event to pass to the renderer
     */
    public hover(event: IEvent): void {
        this._selectionHelper.onSelect(event);
    }

    /**
     * brush event
     * @param event the event to pass to the renderer
     */
    public brush(event: IEvent): void {
    }

    public changeCursor(event: IEvent): void {

    }

    public getTooltipData(event: IEvent): any {
        return [{ source: this._element, group: '', metrics: {} }];
    }

    public getAnimateDuration(): number {
        return this._options.animateDuration !== undefined ? this._options.animateDuration : 1000;
    }

    protected bindZoom() {
        if (this._options.disableZoomViewUpdate) {
            return;
        }

        let self = this;
        let stage = self._stage as any;
        function zoom() {
            // itemDragging is a workaround to have d3 and pixi coexist for events
            if (!stage.itemDragging) {
                stage.position.set(d3.event.transform.x, d3.event.transform.y);
                stage.scale.set(d3.event.transform.k, d3.event.transform.k);
                self._pixiHelper.render();
            }
        }
        self._zoom = d3.zoom().on('zoom', zoom);
        self._parent.call(self._zoom);

        // BIND ZOOM API
        if (!self._element.api) {
            self._element.api = {}
        }
        self._element.api.zoom = function (event: IEvent) {
            if (event.data) {
                self._zoom.scaleTo(self._parent, event.data);
            }
        }

        self._element.api.pan = function (event: IEvent) {
            self._zoom.translateTo(self._parent, event.xStart, event.yStart);
        }
    }

    configureHover() {
        let self = this;

        this._selectionHelper = new SelectionHelper(function (selection: any): void {
            if (selection) {
                let items = self._pixiHelper.getSelection(selection);
                if (items) {
                    items.forEach(function (elem: any) {
                        elem._prevTint = elem.tint;
                        elem.tint = 0x888888;
                        elem.alpha = 0x88;
                    });
                }
                self._pixiHelper.render();
            }
        }, function (selection: any) {
            let items = self._pixiHelper.getSelection(selection);
            if (items) {
                items.forEach(function (elem: any) {
                    elem.tint = elem._prevTint;
                    elem.alpha = 0xFF;
                });
            }
            self._pixiHelper.render();
        });
    }

    protected configureContextMenu(): void {
        let self = this;

        let graph = self._element as IConnectedGraph;
        if (graph.contextMenuItems) {
            for (let i = 0; i < graph.contextMenuItems.length; ++i) {
                self._contextMenuItems.push(graph.contextMenuItems[i]);
            }
        }
        // create anyc context menu
        if (self._contextMenuItems.length > 0) {
            self._parent.on('contextmenu', function (event: any) {
                showContextMenu(d3.event, undefined, self._contextMenuItems);
            });
        }
    }

    protected initializeGraphArea(options: IOptions): any {

        let self = this;

        this._contextMenuItems = [];

        // create the graph area
        merge(this._options, options);

        let first = this._pixiHelper === undefined;
        if (first) {
            this._pixiHelper = new PIXIHelper(!this.getOptions().forceCanvasRenderer);
            this._pixi = this._pixiHelper.getRenderer();
            (this._parent.node() as any).appendChild(this._pixi.view);

            // Create the main stage for your display objects
            this._stage = new PIXI.Container();
            this._stage.interactive = true;

            this.createArrowTexture();
            this.configureHover();
        }
        this._stage.removeChildren();

        return this._stage;
    }

    private createArrowTexture() {
        let arrow = new PIXI.Graphics();
        arrow.beginFill(0x000000);
        arrow.lineStyle(0, 0, 0);

        let arrowSize = 9;
        let rotation = 1.1;

        arrow.moveTo(0, 0);
        arrow.lineTo(
            arrowSize * Math.cos(rotation),
            arrowSize * Math.sin(rotation)
        );
        arrow.lineTo(
            -arrowSize * Math.cos(rotation),
            arrowSize * Math.sin(rotation)
        );
        arrow.lineTo(0, 0);

        this._arrowTexture = this._pixi.generateTexture(arrow, PIXI.SCALE_MODES.LINEAR, 10);

    }
    private createArrow(stage: PIXI.Container, to: IXYValue, from: IXYValue,
        linkType: LinkType, alignment: Alignment) {
        let arrow = new PIXI.Sprite(this._arrowTexture);
        arrow.anchor = new PIXI.ObservablePoint(undefined, undefined, .5, 0);
        arrow.x = to.x;
        arrow.y = to.y;


        arrow.rotation = -Math.atan2(to.x - from.x, to.y - from.y);
        switch (alignment) {
            case Alignment.Left:
                arrow.rotation += Math.PI;
                break;
            case Alignment.Right:
                arrow.rotation += -Math.PI;
                break;
            case Alignment.Top:
                arrow.rotation += 3 * Math.PI / 2;
                break;
            case Alignment.Bottom:
                arrow.rotation += -Math.PI / 2;
                break;
        }

        stage.addChild(arrow);
    }

    protected renderLinkHelper(stage: any,
        renderedLinks: IRenderedDiagramLink[]) {
        let self = this;

        if (self._pixiLinks) {
            stage.removeChild(self._pixiLinks);
            self._pixiLinks.destroy();

            stage.removeChild(self._pixiArrows);
            self._pixiArrows.destroy();
        }

        self._pixiLinks = new PIXI.Graphics();
        stage.addChildAt(self._pixiLinks, 0);

        self._pixiArrows = new PIXI.Container();
        stage.addChildAt(self._pixiArrows, 1);

        // remove this existing link if it exists as this is render update
        renderedLinks.forEach(function (renderedLink: IRenderedDiagramLink) {
            let renderedLinkDef = renderedLink.def as IDiagramLink;

            self._pixiLinks.lineStyle(2, 0x888888, .4);
            let fromXY = self.getLinkStartXY(renderedLink);
            let toXY = self.getLinkEndXY(renderedLink);

            if (renderedLinkDef.linkType & LinkType.Linear) {
                renderedLink.path = [fromXY, toXY];
            } else {
                renderedLink.path = self.getElbowLinkPath(renderedLink, fromXY, toXY);
            }

            if (renderedLinkDef.linkType & LinkType.Curve) {
                self._pixiLinks.moveTo(renderedLink.path[0].x, renderedLink.path[0].y);
                self._pixiLinks.bezierCurveTo(renderedLink.path[1].x, renderedLink.path[1].y,
                    renderedLink.path[renderedLink.path.length - 2].x, renderedLink.path[renderedLink.path.length - 2].y,
                    renderedLink.path[renderedLink.path.length - 1].x, renderedLink.path[renderedLink.path.length - 1].y);
            } else {
                self._pixiLinks.moveTo(renderedLink.path[0].x, renderedLink.path[0].y);
                for (let i = 1; i < renderedLink.path.length; ++i) {
                    self._pixiLinks.lineTo(renderedLink.path[i].x, renderedLink.path[i].y);
                }
            }

            if (renderedLinkDef.linkType & LinkType.Bidirectional) {
                self.createArrow(self._pixiArrows, renderedLink.path[0],
                    renderedLink.path[1], renderedLinkDef.linkType,
                    renderedLink.source.alignment);
            }

            if (renderedLinkDef.linkType & LinkType.Directional ||
                renderedLinkDef.linkType & LinkType.Bidirectional) {
                self.createArrow(self._pixiArrows,
                    renderedLink.path[renderedLink.path.length - 1],
                    renderedLink.path[renderedLink.path.length - 2],
                    renderedLinkDef.linkType,
                    renderedLink.target.alignment);
            }
        });
    }

    protected renderLegend(height: number) {
        return height;
    }

    protected configureView() {
        let height = this._options.height ? this._options.height : 400;
        let width = this._options.width ? this._options.width :
            this._parent.node().getBoundingClientRect().width;

        this._pixi.resize(width, height);
        ConnectedGraphBase.prototype.configureView.call(this, height, width);
    }
}

export interface IRenderedDiagramLink {
    /** user definition of the link */
    def: IGraphLink;
    /** source of the link */
    source: {
        node: IRenderedDiagramNode;
        alignment: Alignment;
        endPoint?: number; // only used for hierarchy graph
    }
    target: {
        node: IRenderedDiagramNode;
        alignment: Alignment;
        endPoint?: number; // only used for hierarchy graph
    }
    /** path for this link */
    path?: any[];
}

export interface IRenderedDiagramNode {
    /** node definition frmo the user */
    def: IGraphNode;
    /** the d3 selection of this node */
    d3selection?: d3.Selection<any, any, d3.BaseType, any>;
    /** rect of this node */
    rect?: Rect;

    /** cached classes of this node */
    classes?: string;
    /** cached color of this node */
    color?: string;
    /** cached svg coords of this node */
    svgCoords?: {
        x: number;
        y: number,
        width: number,
        height: number,
        right?: number,
        bottom?: number
    }
}

export function getCoordsAndCache(svg: d3.Selection<any, any, d3.BaseType, any>,
    node: any) {
    if (node.x === undefined) {
        if (!node.d3selection) {
            node.d3selection = d3.select(this);
        }
        merge(node, convertToSVGCoords(svg, node.d3selection));
    }
    return node;
}