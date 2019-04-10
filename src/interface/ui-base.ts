import { ColorManager } from "../core/color-manager";

export interface ITooltipData {
    /** the element that triggered this tooltip */
    source: UIElement,
    /** the name of the group for this tooltip */
    group: string,
    /** a list of data to be shown in the tooltip */
    metrics: { [index: string]: string }
};

export interface IEvent {
    /** specifies the type of event from
     * [[EventType]]
     */
    event?: EventType,
    selection?: string,
    selectionKey?: string,
    /** data associated with the event */
    data?: any,
    /** the original caller who caused this event to be fired*/
    caller?: UIElement,
    /** xStart bounds of associated with this event */
    xStart?: number,
    /** xEnd bounds of associated with this event */
    xEnd?: number,
    /** yStart bounds of associated with this event */
    yStart?: number,
    /** yEnd bounds of associated with this event */
    yEnd?: number
}

export interface IOptions {
    /** attempt to fit a graph into the view specified by the
     * [[IOptions]]
     */
    fitToWindow?: boolean,
    /** blink assocaited data when a selection is done */
    selectionBlink?: boolean,
    disableBackground?: boolean,
    /** tell a widget to ignore the hover events */
    disableHover?: boolean,
    disableAutoResizeWidth?: boolean,
    disableAutoResizeHeight?: boolean,
    hideRowTitle?: boolean,
    hoverRadiusDelta?: number,

    // save rendered views as image if possible
    enableSaveAsImage?: boolean,

    // auto pick a default renderer unless forced by these flags
    forceSvgRenderer?: boolean,
    forceWebGLRenderer?: boolean,
    forceCanvasRenderer?: boolean,

    /** brush options */
    disableBrush?: boolean,
    forceBrushToFront?: boolean,

    /** animation time in milliseconds, defaults to 1000 **/
    animateDuration?: number,
    enableXYZoom?: boolean,
    disableZoomViewUpdate?: boolean,
    disableZoomMouseWheel?: boolean;
    showSelectionAsOverlay?: boolean,

    /** handle resize controls */
    disableResize?: boolean,
    disableResizeRight?: boolean,
    disableResizeBottom?: boolean,
    disableResizeLeft?: boolean,

    /** tooltip behavior */
    disableHoverTooltip?: boolean, // DEPRECATED for disableTooltip
    disableTooltip?: boolean,
    tooltipDelay?: number;

    /** async display behavior */
    enableWebWorkers?: boolean;
    /** DEPRECATED */
    disableWebWorkers?: boolean;
    disableProgressSpinner?: boolean;

    height?: any,
    width?: any,

    xStart?: number,
    xEnd?: number,
    yStart?: number,
    yEnd?: number,
    topMargin?: number,
    bottomMargin?: number,
    leftMargin?: number,
    rightMargin?: number
}

export interface IBuffer<DataType> {
    push(d: DataType): void;
    get(index: number): DataType;
    length(): number;
    getData(): DataType[];
}

/**
 * Represents a relative alignment
*/
export enum Alignment {
    Left = 1,
    Right = 2,
    Top = 4,
    Bottom = 8,
    None = 0
};   // bitmask Position

export enum EventType {
    CursorStart,
    CursorMove,
    CursorEnd,
    BrushStart,
    BrushMove,
    BrushEnd,
    HoverStart,
    HoverEnd,
    HoverClear,
    Zoom,
    Click,
    DoubleClick
}

export enum UIType {
    Unrendered,
    Cartesian,
    Pie,
    Grid,
    FlowDiagram,
    ForceDirectedGraph,
    Sunburst,
    HierarchyGraph,
    PortDiagram,
    SimpleGraph,
    TreeMap,
    Axis,
    Radar
}

export interface IContextMenuItem {
    /** add a clickable item title */
    title?: string,
    /** add a clickable item callback */
    action?: (elem: any, data: any, index: any) => void;
    /** disable this clickable item */
    disabled?: boolean;

    /** used to add a divider */
    divider?: boolean;

    submenu?: IContextMenuItem[];
    submenuDiv?: HTMLDivElement;
}

export enum LegendType {
    Discrete,
    Gradient
}

export enum LegendOrientation {
    Vertical,
    Horizontal
}

export enum LegendItemShape {
    Rectangle,
    Line,
    Circle
}

export interface ILegendItem {
    key: any,
    name?: string,
    color?: string,
    opacity?: string,
    shape?: string | LegendItemShape,
    value?: any,
    units?: string
}

export interface ILegendDefinition {
    items: ILegendItem[];
    type?: LegendType;
}

export interface ILegend {
    alignment: Alignment;
    orientation?: LegendOrientation;
    showValue?: boolean;
    definition?: ILegendDefinition;

    /** brush selectoin results in the following context menu */
    contextMenuItems?: IContextMenuItem[];

    /** callback when user clicks on an item */
    onClick?: (event: IEvent) => void;
}

export interface ICheckboxTreeNode {
    id: any;
    name: string;
    children: ICheckboxTreeNode[];
    parent?: ICheckboxTreeNode;
    open?: boolean;
    checked?: boolean;
    indeterminate?: boolean;
    propogateChange?: boolean;
    notCheckable?: boolean;
}

export interface UIRenderer {
    /** free resources associated with the element */
    destroy?: (caller: UIElement) => void;

    setDiv?: any;

    setOnRenderCallback?: (callback: (elem: UIElement, options: IOptions) => void) => void;

    /** callbacks for when this element has been updated, used so the render owner
     * can maintain state if they want of each element
     */
    onRender?: (caller: UIElement, options: IOptions) => void;

    /**
     * Get the css actually rendered. This is useful for legend swatches
     * and the like.
     *
     * @param the element to get the rendered CSS information for
     *
     * @return The css rendered, or undefined if called before the chart is
     *   rendered
     */
    getRenderedCss?(element: UIElement): Css;

    /**
     * tooltip the element.
     *
     * @param renderer an IRenderer object that has the tooltip
     * @param event any event to pass to the renderer
     */
    getTooltipData?(element: UIElement, event: IEvent): ITooltipData[];

    /**
     * hover event
     *
     * @param element to fire the hover event on
     * @param event any event to pass to the renderer
     */
    hover?(element: UIElement, event: IEvent): void;

    /**
     * click event
     *
     * @param element to fire the click event on
     * @param event any event to pass to the renderer
     */
    click?(element: UIElement, event: IEvent): void;

    /**
     * zoom event
     *
     * @param element to fire the zoom event on
     * @param event any event to pass to the renderer
     */
    zoom?(element: UIElement, event: IEvent): void;

    /**
     * brush event
     *
     * @param element to fire the brush event on
     * @param event any event to pass to the renderer
     */
    brush?(element: UIElement, event: IEvent): void;

    /**
     * cursor moved event
     *
     * @param element to fire the move event on
     * @param event any event to pass to the renderer
     */
    cursorChange?(element: UIElement, event: IEvent): void;

    /**
     * Render the given element
     *
     * @param the element to render
     */
    render(element: UIElement, options?: IOptions): void;

    /**
     * Invalidate the given element.  This is different from
     * render in that it completely redraws the element instead of
     * just re-rendering it
     *
     * @param the element to invalidate
     */
    invalidate(element: UIElement, options?: IOptions): void;

    /**
     * get the options the renderer is using for the given element
     *
     * @param the element to invalidate
     */
    getOptions(element: UIElement): IOptions;

    /**
     * get the colors the renderer is using for the given element
     *
     * @param the element to invalidate
     */
    getColorManager(): ColorManager;
}

export interface UIElement {
    type?: UIType;
    options?: IOptions;
    renderer?: UIRenderer;
    manager?: UIElementManager;

    api?: {
        /**
         * fire a hover event for this element
         *
         * @param event any event to pass to the renderer
         */
        hover?: (event?: IEvent) => void;

        /**
         * fire a zoom event for this element
         *
         * @param event any event to pass to the renderer
         */
        zoom?: (event?: IEvent) => void;

        /**
         * fire a mouse/touch change event for this element
         *
         * @param event any event to pass to the renderer
         */
        cursorChange?: (event?: IEvent) => void;

        /**
         * fire a brush event for this element
         *
         * @param event any event to pass to the renderer
         */
        brush?: (event?: IEvent) => void;

        /**
         * pan to a given event location
         */
        pan?: (event?: IEvent) => void;

        /**
         * Render the element.
         *
         * @param renderer an IRenderer object that can render this element
         * @param options any options to pass to the renderer
         */
        render?: (renderer?: UIRenderer, options?: IOptions) => Promise<any>;

        getOptions?: () => IOptions;
        saveImage?: () => void;
        createImage?: () => void;
    }

    /**
     * get tooltip data for the element
     *
     * @param event any event to pass to the renderer
     */
    getTooltip?: (event?: IEvent) => ITooltipData[];

    /**
     * callback when a tooltip occurs in this element
     *
     * @param event the event related to this callback
     */
    onTooltip?: (event: IEvent) => any;

    /**
     * callback when a hover occurs in this element
     *
     * @param event the event related to this callback
     */
    onHover?: (event: IEvent) => void;

    /**
     * callback when a zoom action occurs in this element
     *
     * @param event the event related to this callback
     */
    onZoom?: (event: IEvent) => void;

    /**
     * callback when a brush action occurs in this element
     *
     * @param event the event related to this callback
     */
    onBrush?: (event: IEvent) => void;

    /**
     * callback when the cursor change occurs in this element
     *
     * @param event the event related to this callback
     */
    onCursorChanged?: (event: IEvent) => void;

    /**
     * callback when a re-render occurs in this element
     *
     * @param options the options used when render was called
     */
    onRender?: (options: IOptions) => void;

    handleUpdate?: (caller: UIElement, options: IOptions) => void;

    /**
     * get all elements associated with the render call of this UIElement
     */
    getElements?: () => UIElement[];
}

export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
    right?: number;
    bottom?: number;
}

export interface ICss {
    classes?: { [index: string]: boolean };
    style?: { [index: string]: any };
}

export interface IRange {
    min: number;
    max: number;
}

// Represents a rectangular area.
export class Rect implements IRect {
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;

    constructor(x?: number, y?: number, width?: number, height?: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Returns true if the rectangle contains (x,y).
    public contains(x: number, y: number) {
        return (x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height);
    }
}

/**
 * Used to manipulate CSS class and style information
 */
export class Css implements ICss {
    public classes: { [index: string]: boolean };
    public style: { [index: string]: any };

    constructor(classes?: string, style?: { [index: string]: any }) {
        if (classes) {
            this.addClasses(classes);
        } else {
            this.classes = {};
        }

        if (style) {
            this.style = style;
        } else {
            this.style = {};
        }
    }

    /**
     * add a class to the class list
     * @param classes to add, can be strings separated by spaces
     *
     * @return the manager instance
     */
    public addClasses(classesStr: string): Css {
        let classes = classesStr.split(' ');
        for (let i = 0; i < classes.length; ++i) {
            this.classes[classes[i]] = true;
        }
        return this;
    }

    /**
     * add a set of styles to the style object
     * @param style a style object
     *
     * @return the manager instance
     */
    public addStyles(style: { [index: string]: any }): Css {
        for (let key in style) {
            this.style[key] = style[key];
        }
        return this;
    }

    /** set the color value
     *
     * @param color a string representing the color to use
     */
    public setColor(color: string): Css {
        this.addStyles({ color: color });
        return this;
    }

    /** set the opcaity value
     *
     * @param opcaity a string representing the color to use
     */
    public setOpacity(opacity: number): Css {
        this.addStyles({ opacity: opacity });
        return this;
    }

    /**
     * remove a class from the class list
     * @param className the class to remove
     *
     * @return the manager instance
     */
    public removeClass(className: string): Css {
        delete this.classes[className];
        return this;
    }

    /**
     * remove a style from the style map
     * @param key the name of the style to remove
     *
     * @return the manager instance
     */
    public removeStyle(key: string): Css {
        delete this.style[key];
        return this;
    }

    /**
     * get the list of classes
     *
     * @return a list of classes for this manager
     */
    public getClasses(): string[] {
        return Object.keys(this.classes);
    }

    /**
     * helper to get a space separated list of classes
     *
     * @return a string list of classes for this manager
     */
    public getClassString() {
        let ret = '';
        for (let className in this.classes) {
            ret += className + ' ';
        }
        return ret;
    }

    /**
     * get the style map
     *
     * @return an object that contains key/value style pairs
     */
    public getStyles(): any {
        return this.style;
    }

    /**
     * helper to get a json representation of the style map
     *
     * @return the json string of the style map
     */
    public getStyleString(): any {
        return JSON.stringify(this.style);
    }
};

/**
 * implemented a basic API on top of the IRange object
 */
export class Range implements IRange {
    public min: number;
    public max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    /**
     * set the min value for the range
     *
     * @return the min range value
     */
    public setMin(min: number): Range {
        this.min = min;
        return this;
    }

    /**
     * get the min value for the range
     *
     * @return the min range value
     */
    public getMin() {
        return this.min;
    }

    /**
     * set the max value for the range
     *
     * @return the max range value
     */
    public setMax(max: number): Range {
        this.max = max;
        return this;
    }

    /**
     * get the max value for the range
     *
     * @return the max range value
     */
    public getMax() {
        return this.max;
    }
}

export interface UIElementManager {
    /**
     * add a elem to the manager
     *
     * @param elem - the elem that should should be added
     * @param tooltipGroupName - Name of the group that this elem should be "ganged"
     *   with when showing tooltips.  If not specified, this elem will not be "ganged" with any
     *   other elem.
     * @param highlightGroupName - Name of the group that this elem should be "ganged"
     *   with when doing highlighting.  If not specified, this elem will not be "ganged" with any
     *   other elem.
     * @param renderGroupName - Name of the group that this elem should be "ganged"
     *   with when rerendering.  If not specified, this elem will not be "ganged" with any
     *   other elem.
     * @return - The elem manager instance.
     */
    addElement(elem: UIElement, tooltipGroupName?: string,
        highlightGroupName?: string, renderGroupName?: string): UIElementManager;

    /**
     * remove a elem from the manager, removes it from all groups
     *
     * @param elem - the elem that should should be removed
     *
     * @return - The elem manager instance.
     */
    removeElement(elem: UIElement): UIElementManager;

    /**
     * Return all the elems in this list
     * @return the list of elems
     */
    getElements(): UIElement[];

    /**
     * user callback called when a hover event happens
     *
     * @param the function to be called
     */
    setHoverCallback(callback: (group: UIElement[], event: IEvent) => void): UIElementManager;

    /**
     * user callback called when a tooltip is created
     *
     * @param the functiotn to be called
     */
    setTooltipCallback(callback: (group: UIElement[], event: IEvent) => ITooltipData): UIElementManager;

    /**
     * user callback called when a selection event happens
     *
     * @param the function to be called
     */
    setBrushCallback(callback: (group: UIElement[], event: IEvent) => void): UIElementManager;

    /**
     * set the group this tooltip is associated with
     *
     * @param elem - the elem that should should be "ganged"
     * @param groupName - Name of the group that this elem should be "ganged"
     *   with.
     *
     * @return - The elem manager instance.
     */
    addToTooltipGroup(elem: UIElement, groupName: string): UIElementManager;
    /**
     * remove the elem from the tooltip group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    removeFromTooltipGroup(elem: UIElement): UIElementManager;

    /**
     * set the group to select this elem with
     *
     * @param elem - the elem that should should be "ganged"
     * @param groupName - Name of the group that this elem should be "ganged"
     *   with.
     *
     * @return - The elem manager instance.
     */
    addToHighlightGroup(elem: UIElement, groupName: string): UIElementManager;

    /**
     * remove the elem from the zoom group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    removeFromHighlightGroup(elem: UIElement): UIElementManager;

    /**
     * set the group to select this elem with
     *
     * @param elem - the elem that should should be "ganged"
     * @param groupName - Name of the group that this elem should be "ganged"
     *   with.
     *
     * @return - The elem manager instance.
     */
    addToRenderGroup(elem: UIElement, groupName: string): UIElementManager;

    /**
     * remove the elem from the zoom group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    removeFromRenderGroup(elem: UIElement): UIElementManager;

    /** clear all the elements in this list */
    clear(): void;
}
