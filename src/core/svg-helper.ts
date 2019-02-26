import { merge } from './utilities';
import {
    IEvent, ILegend, ILegendItem, IOptions, Alignment, Css, EventType,
    IRect, Rect, UIElement, LegendItemShape, LegendOrientation,
    IContextMenuItem, UIRenderer
} from '../interface/ui-base';
import { showContextMenu } from './context-menu';
import { BaseTooltip, CustomDivTooltip } from './tooltip';
import { SelectionHelper } from './selection';
import { ColorManager } from './color-manager';
import { legendColor } from '../../third-party/d3-legend-master';
import { UIElementRenderer } from './renderer';

import * as d3 from 'd3';

export function getStyle(target: d3.Selection<d3.BaseType, any, d3.BaseType, any>) {
    let node: any = target.node();
    let style = window.getComputedStyle(node);
    return style;
}

/**
* take two lists of strings and merge them into one list with only unique values
* note this changes the original list
*/
export function mergeKeys(arr1: string[], arr2: string[]): void {
    let keys: { [index: string]: boolean } = {};
    for (let i = 0; i < arr1.length; ++i) {
        keys[arr1[i]] = true;
    }

    for (let i = 0; i < arr2.length; ++i) {
        if (!keys.hasOwnProperty(arr2[i])) {
            arr1.push(arr2[i]);
        }
    }
}

export function getKeys(data: any, accessor: (value: any) => string[]) {
    let keyMap: { [index: string]: boolean } = {};
    let keyList: string[] = [];
    for (let i = 0; i < data.values.length; ++i) {
        let keys = accessor(data.values[i]);
        for (let i = 0; i < keys.length; ++i) {
            if ((typeof keys[i] === 'string' || typeof keys[i] === 'number') &&
                !keyMap.hasOwnProperty(keys[i])) {
                keyMap[keys[i]] = true;
                keyList.push(keys[i]);
            }
        }
    }
    return keyList;
}

export function addHover(d3Obj: d3.Selection<any, any, d3.BaseType, any>,
    fillColors: WeakMap<Object, string>, strokeColors: WeakMap<Object, string>) {
    // if you don't own the style then when you save the
    // colors save null so we restore this DOM object to
    // the same state (aka it removes the style)
    let styleAttr = d3Obj.attr('style');
    let color = d3Obj.style('fill');
    let hoverColor: string;
    if (color && color !== 'none') {
        hoverColor = SelectionHelper.getHoverColor(color);
        d3Obj.style('fill', hoverColor);
    }
    if (styleAttr) {
        fillColors.set(d3Obj.node(), color);
    }

    color = d3Obj.style('stroke');
    if (color && color !== 'none') {
        hoverColor = SelectionHelper.getHoverColor(color);
        d3Obj.style('stroke', hoverColor);
    }
    if (styleAttr) {
        strokeColors.set(d3Obj.node(), color);
    }
    d3Obj.classed('hover', true);
}

export function removeHover(d3Obj: d3.Selection<any, any, d3.BaseType, any>,
    fillColors: WeakMap<Object, string>, strokeColors: WeakMap<Object, string>) {
    d3Obj.style('fill', fillColors.get(d3Obj.node()));
    d3Obj.style('stroke', strokeColors.get(d3Obj.node()));
    d3Obj.classed('hover', false);
}

export function addClickHelper(target: d3.Selection<d3.BaseType, any, d3.BaseType, any>,
    onClick: (event: IEvent) => void, onDoubleClick: (event: IEvent) => void,
    contextMenuItems: IContextMenuItem[], tooltip: BaseTooltip, caller: UIElement, value?: any) {
    let wait: any;
    if (onClick) {
        target.on('click', function (d: any) {
            if (value !== undefined) {
                d = value;
            }
            if (onDoubleClick) {
                wait = setTimeout(function () {
                    if (wait) {
                        onClick({ caller: caller, event: EventType.Click, data: d });
                        wait = null;
                    }
                }, 300);
            } else {
                onClick({ caller: caller, event: EventType.Click, data: d });
            }
        });
    }
    if (onDoubleClick) {
        target.on('dblclick', function (d: any) {
            if (value !== undefined) {
                d = value;
            }
            window.clearTimeout(wait);
            wait = null;
            onDoubleClick({ caller: caller, event: EventType.DoubleClick, data: d });
        });
    }
    if (contextMenuItems && contextMenuItems.length) {
        target.on('contextmenu', function (d: any) {
            if (!event) {
                event = d3.event;
            }
            showContextMenu(d3.event, d, contextMenuItems);
        });
    }
}

function getSVGPoint(svg: any, elem: any, point: any) {
    if (svg.getScreenCTM && svg.getScreenCTM()) {
        // if getScreenCTM is not working right (aka Firefox...?)
        let matrix = svg.getScreenCTM().inverse();
        let svgPoint = point.matrixTransform(matrix);
        return svgPoint;
    }
    return { x: point.x, y: point.y };
}

/** Note this is very expensive due to the getBoudingClientRect() call so
 * you should cache this result if possible
 */
export function convertToSVGCoords(svg: d3.Selection<any, any, d3.BaseType, any>,
    element: d3.Selection<any, any, d3.BaseType, any>): IRect {
    let clientRect = element.node().getBoundingClientRect();
    let svgNode = svg.node();
    let elemNode = element.node();

    let p = svgNode.createSVGPoint();

    p.x = clientRect.left;
    p.y = clientRect.top;
    let topLeft = getSVGPoint(svgNode, elemNode, p);

    p.x = clientRect.right;
    p.y = clientRect.bottom;
    let bottomRight = getSVGPoint(svgNode, elemNode, p);
    return {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
        right: bottomRight.x,
        bottom: bottomRight.y
    };
}

export function animatePath(path: d3.Selection<d3.BaseType, {}, any, any>,
    duration: number) {
    let pathLength = (path.node() as any).getTotalLength();
    path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition('add')
        .duration(duration)
        .attr('stroke-dashoffset', 0)
}

export class Arrow {
    public static getAngle(start, end) {
        return Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    }

    // Returns an attrTween for translating along the specified path element.
    private static translateArrow(path) {
        // Approximate tangent
        return function (d, i, a) {
            return function (t) {
                var l = path.getTotalLength();
                var pos = path.getPointAtLength(t * l);

                var start = path.getPointAtLength(Math.max(l - 0.01, 0) * t);
                var end = path.getPointAtLength((l + 0.01) * t);
                return 'translate(' + pos.x + ', ' + pos.y + ') rotate( ' +
                    Arrow.getAngle(start, end) + ')';
            };
        };
    }

    static createArrow(group: d3.Selection<d3.BaseType, {}, any, any>,
        size = 4) {
        let doubleSize = size * 2;
        return group.append('path')
            .attr('d', `M -${doubleSize}, -${size} L0,0 L-${doubleSize},${size} z`);
    }

    static animateArrow(path: d3.Selection<d3.BaseType, {}, any, any>,
        arrow: d3.Selection<d3.BaseType, {}, any, any>, duration: number) {
        arrow.transition()
            .duration(duration)
            .attrTween('transform', Arrow.translateArrow(path.node()))
    }
}

export class Spinner {
    private _svg: any;

    constructor(svg: any, rect: Rect) {
        let self = this;

        let radius = Math.min(rect.width, rect.height) / 2;
        let tau = 2 * Math.PI;

        self._svg = svg;
        let arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.9)
            .startAngle(0);

        let background = self._svg.append('path')
            .classed('spinner', true)
            .datum({ endAngle: 0.66 * tau })
            .style('fill', 'rgb(0,113,197)')
            .attr('d', arc)
            .call(spin, 1500)

        function spin(selection, duration) {
            selection.transition()
                .ease(d3.easeLinear)
                .duration(duration)
                .attrTween('transform', function () {
                    return d3.interpolateString('rotate(0)', 'rotate(360)');
                });

            setTimeout(function () {
                if (self._svg) {
                    spin(selection, duration);
                }
            }, duration);
        }
    }
}
/**
 * Interface for the zoom callback function
 *
 * @param timeBounds - The min and max for the zoom (the domain)
 *
 * @returns Should always return true.
 */
export interface IBrushCallback {
    (
        brushBounds: number[]
    ): boolean;
}

interface BrushDatum {
    extent: [[number, number], [number, number]];
    filterZoomEvent: boolean;
}

/**
 * The Brush class uses D3's brush behavior to implement zooming
 * for Configuration Analyzer graphs where the X axis is time.
 *
 */
export class Brush {
    /** Internal function to be called at 'on mousedown' */
    public onBrushStart: any

    /** Internal function to be called at 'on mousemove' */
    public onBrushMove: any;

    /** Internal function to be called at 'on mouseup' */
    public onBrushEnd: any;

    /** The D3 behavior to implement zooming */
    private _brush: d3.BrushBehavior<{}>;

    /** The D3 selection for the entity that is to be zoomed */
    private _brushTargetGraph: d3.Selection<d3.BaseType, {}, any, any>;

    /** the rectanglet his brush lives in */
    private _rect: Rect;

    /** Function to call when a start event occurs. */
    private _onStartCallback: IBrushCallback;

    /** Function to call when a move event occurs.  */
    private _onMoveCallback: IBrushCallback;

    /** Function to call when a end event occurs.  */
    private _onEndCallback: IBrushCallback;

    private _isXY: boolean;

    /**
    * Construct a Brush instance.
    */
    constructor() {
        // Put 'this' into a variable that will be visible in the callbacks
        let self: Brush = this;
        self._isXY = false;

        // BrushMove function - called when an 'on mousemove' event occurs
        this.onBrushStart = function (d: Event): void {
            if (self._onStartCallback) {
                let dataBounds = d3.brushSelection(this);
                self._onStartCallback.call(this, dataBounds);
            }
        }   // BrushMove

        // BrushMove function - called when an 'on mousemove' event occurs
        this.onBrushMove = function (d: Event): void {
            if (self._onMoveCallback) {
                let dataBounds = d3.brushSelection(this);
                self._onMoveCallback.call(this, dataBounds);
            }
        }   // BrushMove

        // BrushEnd - Called an 'on mouseup' event
        this.onBrushEnd = function (d: Event): void {
            // Call the brush call-back function with the selected domain
            // (most commonly, the graph will be 'zoomed' to the extent)
            if (self._onEndCallback) {
                let dataBounds = d3.brushSelection(this);
                self._onEndCallback.call(this, dataBounds);
            }
        }   // BrushEnd
    }   // constructor

    public moveToFront() {
        this._brushTargetGraph.each(function () {
            (this as any).parentNode.appendChild(this);
        });
    }

    public moveToBack() {
        this._brushTargetGraph.each(function () {
            let firstChild = (this as any).parentNode.firstChild;
            if (firstChild) {
                (this as any).parentNode.insertBefore(this, firstChild);
            }
        });
    }
    public enableCallbacks(): Brush {
        let self = this;
        this._brush
            .on('start', self.onBrushStart)
            .on('brush', self.onBrushMove)
            .on('end', self.onBrushEnd);
        return this;
    }

    public disableCallbacks(): Brush {
        this._brush
            .on('start', undefined)
            .on('brush', undefined)
            .on('end', undefined);

        return this;
    }

    public brushStart(domain: d3.BrushSelection) {
        this._brushTargetGraph.call(this._brush.move, null);
    }

    public brushMove(domain: d3.BrushSelection) {
        this._brushTargetGraph.call(this._brush.move, domain);
    }

    public brushEnd() {
        // clear brush from graph
        this._brushTargetGraph.call(this._brush.move, null);
    }

    public setXY(isXY: boolean): Brush {
        this._isXY = isXY;
        return this;
    }

    public setTarget(graphSVG: d3.Selection<d3.BaseType, any, d3.BaseType, any>): Brush {
        this._brushTargetGraph = graphSVG;
        return this;
    }

    public setStartCallback(startFunc: IBrushCallback): Brush {
        this._onStartCallback = startFunc;
        return this;
    }

    public setMoveCallback(moveFunc: IBrushCallback): Brush {
        this._onMoveCallback = moveFunc;
        return this;
    }

    public setEndCallback(endFunc: IBrushCallback): Brush {
        this._onEndCallback = endFunc;
        return this;
    }

    public setRect(rect: Rect): Brush {
        this._rect = rect;
        return this;
    }

    public ready(): Brush {
        if (this._isXY) {
            this._brush = d3.brush()
                .on('start', this.onBrushStart)
                .on('brush', this.onBrushMove)
                .on('end', this.onBrushEnd);
        } else {
            this._brush = d3.brushX()
                .on('start', this.onBrushStart)
                .on('brush', this.onBrushMove)
                .on('end', this.onBrushEnd);
        }
        // append brush to graph SVG
        this._brushTargetGraph
            .call(this._brush);

        return this;
    }

    /**
     * Release all brush listeners on the target. Failure to release the
     * listeners can prevent the target from being freed.
     *
     * @param target - The object to have any tooltip listeners reset.
     */
    public static releaseListeners(target: d3.Selection<d3.BaseType, any, d3.BaseType, any>): void {
        target
            .on('brush', null)
            .on('brushend', null)
            .on('brushstart', null);
    } // ReleaseListeners
}   // class Brush

export class D3Legend {
    /** the d3svg */
    private _legendSvg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** the original legend defined by the user */
    private _legend: ILegend;

    /** the rect from the y origin of the div */
    private _position: Rect;

    /** the lane title offset from the y origin of the div */
    private _title: string;

    /** the css classes defined for this legend */
    private _classes: string;

    /** the rendered rect for the axis */
    private _renderedRect: Rect;

    /** list of legend items */
    private _items: ILegendItem[];

    /** map of legend items */
    private _itemMap: { [index: string]: ILegendItem };

    constructor(svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        legend: ILegend, title: string, rect?: Rect) {
        this._title = title ? title : '';
        this._legend = legend;

        this._itemMap = {};
        this._items = [];

        if (legend.definition) {
            let items = [];
            for (let i = 0; i < legend.definition.items.length; ++i) {
                let defItem = legend.definition.items[i];
                items.push({
                    key: defItem.key,
                    name: defItem.name ? defItem.name : defItem.key,
                    color: defItem.color,
                    shape: this.getShapeString(defItem.shape),
                    opacity: ''
                });
            }
            this.addItems(items);
        }

        this._classes = 'legendOrdinal ' + this._title +
            ' align-' + this._legend.alignment;
        this._legendSvg = svg.append('g')
            .classed(this._classes, true);

        this.setPosition(rect);
    }

    private getShapeString(shape: number | string) {
        if (typeof (shape) === 'string') {
            return shape;
        }
        switch (shape) {
            case LegendItemShape.Rectangle:
                return 'rect';
            case LegendItemShape.Line:
                return 'line';
            case LegendItemShape.Circle:
                return 'circle';
        }
    }

    public setPosition(rect: Rect) {
        this._position = rect;
    }

    public getPosition(): Rect {
        return this._position;
    }

    public setItems(items: ILegendItem[]) {
        this._items = [];
        this._itemMap = {};
        this.addItems(items);
    }

    public addItems(items: ILegendItem[]) {
        for (let i = 0; i < items.length; ++i) {
            let item = items[i];
            if (!this._itemMap.hasOwnProperty(item.key)) {
                if (!item.name) {
                    item.name = item.key;
                    if (this._legend.showValue) {
                        if (item.value !== undefined) {
                            item.name += ': ' + item.value;
                            if (item.units !== undefined) {
                                item.name += item.units;
                            }
                        }
                    }
                }
                this._itemMap[item.key] = item;
                this._items.push(item);
            } else {
                this._itemMap[item.key].color = item.color;
                this._itemMap[item.key].opacity = item.opacity;
            }
        }
    }

    public getAlignment() {
        return this._legend.alignment;
    }

    public getRenderedRect(): Rect {
        return this._renderedRect;
    }

    public getRows() {
        if (this._legend.orientation === LegendOrientation.Vertical) {
            return this._items.length;
        } else {
            return this._legendSvg.selectAll('.legendCells').size();
        }
    }

    public render() {
        let names: string[] = [];
        let colors: string[] = [];
        for (let i = 0; i < this._items.length; ++i) {
            let name = this._items[i].name;
            let color = this._items[i].color;
            let opacity = this._items[i].opacity;

            if (opacity) {
                if (color.startsWith('rgb')) {
                    color = 'rgba' + color.substr(3, color.length - 4) + ' , ' + opacity + ')';
                }
            }

            names.push(this._items[i].name);
            colors.push(color);
        }

        let orientation: any;

        if (this._legend.orientation === LegendOrientation.Vertical) {
            orientation = 'vertical';
        } else if (this._legend.orientation === LegendOrientation.Horizontal) {
            orientation = 'horizontal';
        } else if (this._legend.alignment === Alignment.Left ||
            this._legend.alignment === Alignment.Right) {
            orientation = 'vertical';
        } else {
            orientation = 'horizontal';
        }

        let itemPadding = 2;
        let itemSize = 0;
        let self = this;
        let addLegend = function (group, names, colors) {
            let ordinal = d3.scaleOrdinal()
                .domain(names)
                .range(colors);

            // any cast is just to make typescript happy as there are no
            // typescript definitions for the legend component
            let legendOrdinal = legendColor();
            legendOrdinal
                .on('cellover', function (d) {
                    this.setAttribute('title', d);
                })
                .orient(orientation)
                .labelPosition('right')
                .shape('rect')
                .shapeWidth(10)
                .shapeHeight(10)
                .shapePadding(itemPadding)
                .scale(ordinal);

            if (self._legend.onClick) {
                legendOrdinal.on('cellclick', function (d) {
                    self._legend.onClick(
                        {
                            event: EventType.Click,
                            data: d
                        }
                    )
                })
            }

            if (self._legend.contextMenuItems) {
                legendOrdinal.on('cellcontextmenu', function (d) {
                    showContextMenu(d3.event, d, self._legend.contextMenuItems);
                })
            }

            group.call(legendOrdinal);
        }

        addLegend(this._legendSvg, names, colors);
        let xPixelOffset = this._position.x;

        if ((this._legend.alignment === Alignment.Top ||
            this._legend.alignment === Alignment.Bottom) &&
            this._legend.orientation !== LegendOrientation.Vertical) {
            let horizontalRows = 1;

            itemPadding = 0;
            let cells = this._legendSvg.select('.legendCells').selectAll('.cell').each(function () {
                let rect = (this as any).getBBox();
                itemPadding = Math.max(itemPadding, rect.width);
            });
            itemSize = itemPadding + 10;
            this._legendSvg.selectAll('*').remove();

            let itemsPerRow = Math.max(1, Math.min(names.length,
                Math.floor(this._position.width / itemSize)));
            horizontalRows = Math.ceil(names.length / itemsPerRow);
            xPixelOffset = this._position.x + this._position.width / 2 -
                itemSize * itemsPerRow / 2;

            let nextRowYOffset = 0;
            for (let i = 0; i < names.length; i += itemsPerRow) {
                let rowSvg = this._legendSvg.append('g').classed(this._classes, true);
                addLegend(rowSvg, names.slice(i, i + itemsPerRow), colors.slice(i, i + itemsPerRow));

                if (nextRowYOffset) {
                    rowSvg.attr('transform', 'translate(' + 0 + ',' + nextRowYOffset + ')');
                }

                let node: any = rowSvg.node();
                nextRowYOffset += node.getBoundingClientRect().height;
            }
        }

        xPixelOffset = Math.max(0, xPixelOffset);

        this._legendSvg
            .attr('transform', 'translate(' + xPixelOffset + ',' + this._position.y + ')')
        let node: any = this._legendSvg.node();
        let svgRect: any = node.getBoundingClientRect();
        this._renderedRect = new Rect(svgRect.left, svgRect.top,
            svgRect.right - svgRect.left,
            svgRect.bottom - svgRect.top);
    }
}

export class D3SVGRenderer extends UIElementRenderer {
    /** used to disable cross graph calls when in redraw mode */
    static IS_RESIZING: boolean;

    public cursorChange(event: IEvent): void { }
    public zoom(event: IEvent): void { }
    public brush(event: IEvent): void { }
    public render(options: IOptions) { }
    protected configureTooltip() { }
    public createLayout() { }

    protected DEFAULT_GRAPH_HEIGHT: number;
    protected MIN_MARGIN = { TOP: 0, BOTTOM: 0, LEFT: 0, RIGHT: 0 };
    protected LEGEND_PADDING = { X: 10, Y: { TOP: 10, BOTTOM: 10 } };
    protected AXIS_PADDING = { X: 10, Y: { TOP: 10, BOTTOM: 10 } }

    /** the parent renderer of this renderer */
    protected _renderer: UIRenderer;

    protected _parent: d3.Selection<any, any, d3.BaseType, any>;

    /** The height of the graph. This INCLUDES the margins. */
    protected _svgRect: Rect;

    /** The width of the graph. This EXCLUDES the margins. */
    protected _graphRect: Rect;

    /** Tooltip div id */
    protected _tooltipId: string;

    /** Holds the analytics name for the tooltip for this chart */
    protected _tooltipAnalyticsName: string;

    /** width of any graph handles */
    protected _handleWidth: number;

    /** indicates we need to relayout the existing graph */
    protected _requiresRelayout: boolean;

    /** stores the original fill colors for an series */
    protected _fillColors = new WeakMap<Object, string>();

    /** stores the original stroke colors for an series */
    protected _strokeColors = new WeakMap<Object, string>();

    protected _selectionHelper: SelectionHelper;

    /** the tooltip object */
    protected _dataTooltip: CustomDivTooltip;

    constructor() {
        super();

        let self = this;
        this._options = {};
        this._selectionHelper = new SelectionHelper(
            function (selection: any) {
                self.addHover(selection);
            },
            function (selection: any) {
                self.removeHover(selection);
            });
    }

    public setColorManager(colorManager: ColorManager) {
        this._colorMgr = colorManager;
    }

    protected initialize(element: UIElement, renderer: UIRenderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        this._element = element;
        this._renderer = renderer;

        this._tooltipId = 'd3-tooltip';
        this._tooltipAnalyticsName = 'd3-ui-widget-toolkit';

        this._parent = parent;
        let node: any = parent.node();
        if (node) {
            if (!this._options.width) {
                this._options.width = node.getBoundingClientRect().width;
            }
            this._svgRect = new Rect(0, 0, this._options.width, 0);

            this._svg = parent.append('svg');
            //.attr('preserveAspectRatio', 'xMidYMid meet');
        }

        this._handleWidth = 10;
        this._options.topMargin = this.MIN_MARGIN.TOP;
        this._options.bottomMargin = this.MIN_MARGIN.BOTTOM;
        this._options.leftMargin = this.MIN_MARGIN.LEFT;     // Space for the tick labels, lane-label
        this._options.rightMargin = this.MIN_MARGIN.RIGHT;
        this._graphRect = new Rect(0, 0, 0, this.DEFAULT_GRAPH_HEIGHT);

        this._requiresRelayout = true;
    }

    protected loadOptions(options: IOptions) {
        if (options === undefined) {
            return;
        }
        if (options.width && options.width !== this._options.width) {
            this._requiresRelayout = true;
        }
        if (options.height && options.height !== this._options.height) {
            this._requiresRelayout = true;
        }
        if (options.topMargin && options.topMargin !== this._options.topMargin) {
            this._requiresRelayout = true;
        }
        if (options.bottomMargin && options.bottomMargin !== this._options.bottomMargin) {
            this._requiresRelayout = true;
        }
        if (options.leftMargin && options.leftMargin !== this._options.leftMargin) {
            this._requiresRelayout = true;
        }
        if (options.rightMargin && options.rightMargin !== this._options.rightMargin) {
            this._requiresRelayout = true;
        }
        merge(this._options, options);
    }

    public getElement() {
        return this._element;
    }
    public getOptions() {
        return this._options;
    }

    public getAnimateDuration(): number {
        return this._options.animateDuration !== undefined ? this._options.animateDuration : 1000;
    }

    /**
     * Get the css actually rendered. This is useful for legend swatches
     * and the like.
     *
     * @param the element to get the rendered CSS information for
     *
     * @return The css rendered, or undefined if called before the chart is
     *   rendered
     */
    public getRenderedCss(): Css {
        return new Css();
    }
    /**
     * tooltip the element.
     *
     * @param renderer an IRenderer object that has the tooltip
     * @param event the event to pass to the renderer
     */
    public getTooltipData(event: IEvent): any {
        return [{ source: this._element, group: '', metrics: {} }];
    }

    /**
     * hover event
     *
     * @param element to fire the hover event on
     * @param event the event to pass to the renderer
     */
    public hover(event: IEvent): void {
        this._selectionHelper.onSelect(event);
    }

    /** the svg that contains the chart */
    protected _svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** the svg that contains the chart */
    protected _backgroundSVG: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    public addHover(selection: any): void {
        let self = this;
        if (selection) {
            self._svg.selectAll('.' + selection)
                .each(function () {
                    let d3Obj = d3.select(this);
                    addHover(d3Obj, self._fillColors, self._strokeColors);
                });
        }
    }

    public removeHover(selection: any) {
        let self = this;
        self._svg.selectAll('.' + selection)
            .each(function () {
                let d3Obj = d3.select(this);
                removeHover(d3Obj, self._fillColors, self._strokeColors);
            });;
    }
    public invalidate(options: IOptions) {
        // clear the SVG
        this.loadOptions(options);
        this.createLayout();

        if (!options.disableResize) {
            this.createHandles();
        }

        this.configureTooltip();
        this.render(options);

        // restore any previous selection
        this._selectionHelper.onRedraw();
    }

    public updateHandles() {
        let self = this;

        // update handle positions
        self._svg.select('.chart-handle.bottom')
            .attr('x', self._graphRect.x)
            .attr('y', self._graphRect.y + self._graphRect.height)
            .attr('width', self._graphRect.width);

        self._svg.select('.chart-handle.left')
            .attr('x', self._graphRect.x - this._handleWidth - 1)
            .attr('y', self._graphRect.y)
            .attr('height', self._graphRect.height);

        // update handle positions
        self._svg.select('.chart-handle.right')
            .attr('x', self._graphRect.x + self._graphRect.width + 1)
            .attr('y', self._graphRect.y)
            .attr('height', self._graphRect.height);
    }

    public createHandles() {
        let self = this;

        if (!self._options.disableResizeLeft) {
            let leftHandle = self._svg.append('rect')
                .attr('opacity', 0)
                .attr('width', self._handleWidth)
                .attr('cursor', 'ew-resize')
                .classed('chart-handle vertical left', true)
                .call(d3.drag()
                    .on('start', function () {
                        D3SVGRenderer.IS_RESIZING = true;
                    })
                    .on('drag', function () {
                        if (d3.event.dx === 0) {
                            return;
                        }
                        let leftMargin = Math.min(self._options.leftMargin + self._graphRect.width,
                            Math.max(self.MIN_MARGIN.LEFT, self._options.leftMargin + d3.event.dx));

                        let node: any = self._svg.node(); // this is just to make typescript happy
                        let options = {
                            width: node.getBoundingClientRect().width,
                            leftMargin: leftMargin,
                            xStart: self._options.xStart,
                            xEnd: self._options.xEnd,
                            animateDuration: 0
                        };

                        // rerender the graph
                        if (self._element.handleUpdate) {
                            self._element.handleUpdate(self._element, options);
                        } else {
                            self.render(options);
                        }
                    })
                    .on('end', function () {
                        D3SVGRenderer.IS_RESIZING = false;
                    })
                );
        }

        if (!self._options.disableResizeRight) {
            let rightHandle = self._svg.append('rect')
                .attr('opacity', 0)
                .attr('width', self._handleWidth)
                .attr('cursor', 'ew-resize')
                .classed('chart-handle vertical right', true)
                .call(d3.drag()
                    .on('start', function () {
                        D3SVGRenderer.IS_RESIZING = true;
                    })
                    .on('drag', function () {
                        if (d3.event.dx === 0) {
                            return;
                        }
                        let rightMargin = Math.min(self._svgRect.width - self._options.leftMargin,
                            Math.max(self.MIN_MARGIN.RIGHT, self._options.rightMargin - d3.event.dx));

                        let node: any = self._svg.node(); // this is just to make typescript happy
                        let options = {
                            width: node.getBoundingClientRect().width,
                            rightMargin: rightMargin,
                            xStart: self._options.xStart,
                            xEnd: self._options.xEnd,
                            animateDuration: 0
                        };

                        // rerender the graph
                        if (self._element.handleUpdate) {
                            self._element.handleUpdate(self._element, options);
                        } else {
                            self.render(options);
                        }
                    })
                    .on('end', function () {
                        D3SVGRenderer.IS_RESIZING = false;
                    })
                );
        }
    }

    // pulled and modified from http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177
    createImage(): Promise<any> {
        let self = this;
        return new Promise<any>(function (resolve, reject) {
            // Below are the functions that handle actual exporting:
            // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
            function getSVGString(svgNode: any) {
                svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
                let cssStyleText = getCSSStyles(svgNode);
                appendCSS(cssStyleText, svgNode);

                let serializer = new XMLSerializer();
                let svgString = serializer.serializeToString(svgNode);
                svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
                svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

                return svgString;

                function getCSSStyles(parentElement: any) {
                    let selectorTextArr = [];

                    // Add Parent element Id and Classes to the list
                    selectorTextArr.push('#' + parentElement.id);
                    for (let c = 0; c < parentElement.classList.length; c++)
                        if (!contains('.' + parentElement.classList[c], selectorTextArr))
                            selectorTextArr.push('.' + parentElement.classList[c]);

                    // Add Children element Ids and Classes to the list
                    let nodes = parentElement.getElementsByTagName('*');
                    for (let i = 0; i < nodes.length; i++) {
                        let id = nodes[i].id;
                        if (!contains('#' + id, selectorTextArr))
                            selectorTextArr.push('#' + id);

                        let classes = nodes[i].classList;
                        for (let c = 0; c < classes.length; c++)
                            if (!contains('.' + classes[c], selectorTextArr))
                                selectorTextArr.push('.' + classes[c]);
                    }

                    // Extract CSS Rules
                    let extractedCSSText = '';
                    for (let i = 0; i < document.styleSheets.length; i++) {
                        let s: any = document.styleSheets[i];

                        try {
                            if (!s.cssRules) continue;
                        } catch (e) {
                            if (e.name !== 'SecurityError') throw e; // for Firefox
                            continue;
                        }

                        let cssRules = s.cssRules;
                        for (let r = 0; r < cssRules.length; r++) {
                            if (contains(cssRules[r].selectorText, selectorTextArr))
                                extractedCSSText += cssRules[r].cssText;
                        }
                    }


                    return extractedCSSText;

                    function contains(str: string, arr: string[]) {
                        return arr.indexOf(str) === -1 ? false : true;
                    }

                }

                function appendCSS(cssText: any, element: any) {
                    let styleElement = document.createElement('style');
                    styleElement.setAttribute('type', 'text/css');
                    styleElement.innerHTML = cssText;
                    let refNode = element.hasChildNodes() ? element.children[0] : null;
                    element.insertBefore(styleElement, refNode);
                }
            }
            let svg = self._svg;
            let width = Number(svg.attr('width'));
            let height = Number(svg.attr('height'))
            let html = getSVGString(svg.node())

            //console.log(html);
            let imgsrc = 'data:image/svg+xml;base64,' + btoa(html);

            let image = new Image;
            image.src = imgsrc;
            image.onload = function () {
                let canvas = document.createElement('canvas');
                canvas.height = height;
                canvas.width = width;
                let context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, width, height);

                let canvasdata = canvas.toDataURL('image/png');

                resolve({
                    image: canvasdata,
                    type: 'image/png',
                    height: height,
                    width: width
                })
            };
        });
    }
    saveImage() {
        this.createImage().then(function (imageData) {

            let pngimg = `<img src="${imageData.image}" height="${imageData.height}" width="${imageData.width}">`;
            d3.select('#pngdataurl').html(pngimg);

            let a = document.createElement('a');
            a.download = 'chart.png';
            a.href = imageData.image;
            a.click();
        });
    }
}
