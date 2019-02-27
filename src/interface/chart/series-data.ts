/**
 * XY Data can be rendered using RenderType
 * Line, Area, Scatter, DirectionalArrow, HeatMap
 * The x maybe used by [[SelectionHelper]] and [[ColorManager]]
 */
export interface IXYValue {
    x: any,
    y: any,
    info?: { title?: string, colorKey?: string },
    value?: any;
}

/**
 * Trace data can be rendered using RenderType
 * FlameChart, Marker, Area
 * The key/name maybe used by [[SelectionHelper]] and [[ColorManager]]
 */
export interface ITraceValue {
    key: number | string;
    name?: string;
    desc?: string;
    x: number;
    dx?: number;
    value?: any;
}

/**
 * TreeNode data can be rendered using the treemap renderer
 * The key maybe used by [[SelectionHelper]] and [[ColorManager]]
 */
export interface ITreeNode {
    key: number | string;
    value: number;
    children: ITreeNode[];
    parent: ITreeNode;
    name?: string;
    displayValue?: any;
}

/**
 * IXYRect data can be rendered using the cartesian chart
 */
export interface IXYRect {
    x: any;
    x1: any;
    y: any;
    y1: any;
    value?: any;
}

/**
 * IXYRect data can be rendered using the cartesian chart MixMaxValue render type.
 * The x maybe used by [[SelectionHelper]] and [[ColorManager]]
 */
export interface IMinMaxValue {
    x: any;
    y: number;
    min: number;
    max: number;
}
/**
 * ICandlestickValue data can be rendered using the cartesian chart BoxPlot
 * render type.  The x maybe used by [[SelectionHelper]] and [[ColorManager]]
 */
export interface ICandlestickValue {
    x: any;
    min: any;
    max: any;
    entry: any;
    exit: any;
    y?: any;
}

/**
 * This data is used as the output of the flame chart decimators
 */
export interface IFlameChartValue {
    depth: number;
    traceValue: ITraceValue;
    decimatedValues?: ITraceValue[],
}

/**
 * this function map should be passed as a parameter of the
 * [[IXYSeries]]
 */
export interface IFunctionMap {
    y: (x: any) => any;
    xMin?: any;
    xMax?: any;
    yMin?: any;
    yMax?: any;
}

/**
 * Summary value data can be rendered by RenderType Bar or
 * as a polar pie chart
 */
export interface ISummaryValue {
    key: string;
    data: { [index: string]: number } | number | ISummaryValue[];
}
