import { Alignment, ICss, IEvent, IOptions, UIRenderer, UIElement, IBuffer, ILegend } from '../ui-base';
import { IAxis, IScalingInfo } from './axis';
import { IXYValue, IMinMaxValue, IXYRect, ISummaryValue, ITreeNode, ITraceValue, IFunctionMap, IFlameChartValue } from './series-data';
import {
    IFlameChartDecimator, ISunburstDecimator, IXYDecimator, IXYStackedDecimator,
    ITraceResidencyDecimator
} from './decimator';
import { IContextMenuItem, ITooltipData } from '../ui-base';

/**
 * bit mask to define how to render the data.  This is an input to the RenderSeries.
 * Note Stacked can be compbined with Line/Area/Bar.  In the future release (2.x) note
 * that we will make this a flat enum, not a bitmask as it is now.
 *
 * @enum {number}
 */
export enum RenderType {
    /** render the data as a line.  Supports IXYValue data */
    Line = 1,
    /** render the data as an area graph, Supports IXYValue data */
    Area = 2,
    /** render the data as a scatter plot, Supports IXYValue data */
    Scatter = 4,
    /** render the data as a bar chart, Supports ISummaryValue data */
    Bar = 8,
    /** render the line/area/bar data stacked.  One data renders the Y value
     * from 0-y1 and the next series renders from y1-y2 and so on for the data
     */
    Stacked = 16,
    /** render the data as a min max value chart, Supports IMinMaxValue data */
    MinMaxValue = 32,
    /** render the data as a flame chart, Supports ITraceValue data */
    FlameChart = 64,
    /** render the data as markers, supports ITraceValue data and
     * requires image/decimation image in series*/
    Marker = 128,
    /** render the data as an arrow */
    DirectionalArrow = 256,
    /** render the data as a box plot */
    BoxPlot = 512,
    /** render the data as a heat map */
    HeatMap = 1024,
    /** render the data with no decimation but just as a line between XY values
     * Note this has other side effects like we do not include the data
     * by default in the tooltip metric list since we cannot be sure it is a metric
     * being rendered.
     */
    Raw = 2048
};   // bitmask RenderType

/**
 * how to render a line graph
 *
 * @enum {number}
 */
export enum InterpolateType {
    /** render a connected line from the previous value y to the current value y */
    Linear,
    /** render a horizontal line using the previous y value from the previous x value
     * to the current x value and then render a vertical line from the previous value
     * y to the current value y
     */
    StepBefore,
    /** render a horizontal line using the current y value from the current x value
     * to the next x value and then render a vertical line from the current value
     * y to the next value y
     */
    StepAfter
}

/** a series of IXYValues, their description and any rendering css options */
export interface IXYSeries {
    values?: IXYValue[] | IBuffer<IXYValue>

    /** a function that is run per X value to generate the output Y value*/
    functionMap?: IFunctionMap;

    /** the name for this series may be used by the
     * [[SelectionHelper]] and [[ColorManager]]
     *  */
    name?: string;

    /** CSS for this data */
    css?: ICss;

    /** EXPERIMENTAL: this flag enables text rendering for each XY scatter point*/
    showTitleText?: boolean;

    /** EXPERIMENTAL: description is drawn along the line/area graph */
    description?: {
        /** the description text */
        text: string;

        /** this describes where along the line/area the description is drawn*/
        percentage?: number;
        alignment?: Alignment;
    }
}

/** a series of IXYValues, their description and any rendering css options */
export interface IRectSeries {
    /** a list of rectangles to render in the chart */
    rects: IXYRect[];
    /** the name for this series */
    name?: string;
    /** CSS for this rectangle */
    css?: ICss;

    /** EXPERIMENTAL: description is drawn along the rectangle graph */
    description?: {
        /** the description text */
        text: string;

        /** this describes where along the line/area the description is drawn*/
        percentage?: number;
        alignment?: Alignment;
    }
}

/** the layer of data is a set of data and how to render it */
export interface IBaseLayer {
    /** how to render the data */
    renderType: RenderType,
    /** any css to be applied to the data */
    css?: ICss;
    /** index of the axis in the associated chart that is the x-axis for this data */
    xAxisIdx?: number;
    /** index of the axis in the associated chart that is the y-axis for this data */
    yAxisIdx?: number;

    /** scaling info for the X axis */
    xScalingInfo?: IScalingInfo;

    /** scaling info for the Y axis */
    yScalingInfo?: IScalingInfo;

    /** hide this data series in the legend for some reason */
    hideInLegend?: boolean;

    /** extra color information for the bar series type */
    colors?: { [index: string]: string };

    /** the callback when an item in this data is hovered over
     * @param event contains the data for the item that was hovered
     */
    onHover?: (event: IEvent) => void;

    /** the callback when an item in this data is clicked
     * @param event contains the data for the item that was clicked
     */
    onClick?: (event: IEvent) => void;

    /** the callback when an item in this data is double clicked
     * @param event contains the data for the item that was clicked
     */
    onDoubleClick?: (event: IEvent) => void;

    /** the context menu definitions for when the user right clicks */
    contextMenuItems?: IContextMenuItem[];

    /** DEPRECATED disable using web workers for decimation */
    disableWebWorkers?: boolean;

    /** enable web workers for this data set */
    enableWebWorkers?: boolean;

    /** force a from one time from scratch redraw if layer changes */
    forceUpdate?: boolean;
}

/** a set of xy data. line/area/scatter plots */
export interface IXYLayer extends IBaseLayer {
    /** a set of list of XY to render */
    data: IXYSeries[];

    /** any transformation to do before rendering the data */
    decimator?: IXYDecimator | IXYStackedDecimator;

    /** tells the line graph how to render information between two points */
    interpolateType?: InterpolateType,

    /** tells the scatter plot to use the IXYValue.value as the radius */
    useValueWhenRendering?: boolean;

    /** populated by the renderer */
    getAbsolutePosition?: (value: IXYValue) => IXYValue;
}

/** a set of summary data. bar graphs */
export interface ISummaryLayer extends IBaseLayer {
    /** a set of summary values to render */
    data: ISummaryValue[];
    /** extra color information for the bar series type */
    colors?: { [index: string]: string };
}

/** a set of min/max/value data */
export interface IMinMaxValueLayer extends IBaseLayer {
    /** a list of min max values to render */
    data: IMinMaxValue[];
}

/** a set of flame chart data */
export interface ITraceValueLayer extends IBaseLayer {
    /** a list of trace values to render */
    data: ITraceValue[];
    /** any transformation to do before rendering the data */
    decimator?: IFlameChartDecimator | ITraceResidencyDecimator;
    /** turn on rendering of the background, useful when using the rect limit decimator */
    enableBackground?: boolean;
    /** disable automatic hover of all identically named items */
    disableHover?: boolean;
    /** tells the area graph how to render information between two points */
    interpolateType?: InterpolateType,
}

/** a set of flame chart data */
export interface IStackLayer extends IBaseLayer {
    /** a list of trace values to render */
    data: IFlameChartValue[];
    /** any transformation to do before rendering the data */
    decimator?: IFlameChartDecimator | ITraceResidencyDecimator;
    /** turn on rendering of the background, useful when using the rect limit decimator */
    enableBackground?: boolean;
    /** disable automatic hover of all identically named items */
    disableHover?: boolean;
    /** tells the area graph how to render information between two points */
    interpolateType?: InterpolateType,
}

/** a set of markert data */
export interface IMarkerLayer extends IBaseLayer {
    /** a list of marker values to render */
    data: ITraceValue[];

    /** the image to use to render raw data */
    image: any;

    /** the image to use to render decimated data */
    decimatedImage?: any;

    /** any transformation to do before rendering the data */
    decimator?: any;
}

export interface IRectLayer extends IBaseLayer {
    data: IRectSeries[];
}

export type ILayer = IXYLayer | ISummaryLayer | IMinMaxValueLayer | ITraceValueLayer |
    IStackLayer | IRectLayer | IMarkerLayer;

export interface ITooltipEvent extends IEvent {
    defaultTitle?: string;
    defaultClass?: {
        getTooltipData: (event: IEvent) => ITooltipData[];
    }
}
/** base chart class */
export interface IChart extends UIElement {
    category?: string;

    /** a title for this chart that may be displayed */
    title?: string;

    /** context menu items that will be added to the context menu */
    contextMenuItems?: IContextMenuItem[];

    /** a callback that will be fired when the tooltip is triggered */
    onTooltip?: (event: ITooltipEvent) => any;

    /** once the chart is rendered this API object is filled with callbacks to
     * interact with the chart
     */
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
         * pan to a given event location
         */
        pan?: (event?: IEvent) => void;

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
         * re-render the chart
         *
         */
        render?: (renderer?: UIRenderer, options?: IOptions) => Promise<any>;

        /** [[createImage]] is triggered and prompts the user to save it via
         * the browser save dialog
         */
        saveImage?: () => void;

        /** creates and image and loads it into memory */
        createImage?: () => void;

        /** reset the zoom for the chart to the original value */
        zoomReset?: () => void;

        /** zoom in by one step */
        zoomIn?: () => void;

        /** zoom out by one step */
        zoomOut?: () => void;

        /** pan right by one step */
        panRight?: () => void;

        /** pan left by one step */
        panLeft?: () => void;

        /** limit the X range of the chart, works only with 1 x axis */
        rangeUpdate?: (event?: IEvent) => void;

        /** reset the X range of the chart to default values, works only with 1 x axis */
        rangeReset?: () => void;
    }
}

/** cartesian chart is used to define a chart with an X and Y axis */
export interface ICartesianChart extends IChart {
    /** the sets of data to render */
    dataSets: ILayer[];
    /** flag if the x-axis is continuous.  A continuous x-axis allows zooming */
    isXContinuous: boolean;
    /** the set of axes for this chart that the data can reference */
    axes?: IAxis[];
    /** the set of legends for this chart */
    legends?: ILegend[];
    /** brush selectoin results in the following context menu */
    brushContextMenuItems?: IContextMenuItem[];

    /** callback when user clicks on an item */
    onClick?: (event: IEvent) => void;

    /** the callback when an item in this data is double clicked
     * @param event contains the data for the item that was clicked
     */
    onDoubleClick?: (event: IEvent) => void;
}

export interface IPolarChart extends IChart {
    /** the legend for this chart */
    legend?: ILegend;
    /** units string */
    units?: string;

    /** callback when user clicks on an arc */
    onClick?: (event: IEvent) => void;

    /** the callback when an item in this data is double clicked
     * @param event contains the data for the item that was clicked
     */
    onDoubleClick?: (event: IEvent) => void;
}

/** defines a simple pie chart */
export interface IPieChart extends IPolarChart {
    /** the data for the pie, each key/value pair is a pie segment
     * the index is used by [[SelectionHelper]] and [[ColorManager]]
    */
    data: { [index: string]: number };
    /** specify what colors to use for each key in the bar */
    colors?: { [index: string]: string };
    /** a value from 0-1 which specifies the percentage of the outer radius
     * to cut out of the middle of the pie to make a donut chart */
    innerRadius?: number;
}

/** defines a sunburst chart */
export interface ISunburstChart extends IPolarChart {
    /** the data for the sunburst, each key/value pair is a pie segment */
    data: ITreeNode[];
    /** a decimator for the data */
    decimator?: ISunburstDecimator;
}

/** defines a sunburst chart */
export interface IRadarChart extends IPolarChart {
    /** the data for the sunburst, each key/value pair is a pie segment */
    data: ISummaryValue[];
}
