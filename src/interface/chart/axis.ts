import {
    Alignment, ICss, IOptions, IRange, UIType,
    UIElementManager, UIRenderer, UIElement
} from '../ui-base';

export interface IScalar {
    /** the multiplier used on the base scale to get this scale */
    scalar: number;

    /** the units for this scale */
    units: string;

    /** the maximum range for this scale.  For example if this is .1,
     * any value above .1 will use the next scale and any value below .1
     * will use this scale (until the next lower scale)
    */
    maxRange: number;
}

export interface IScalingInfo {
    /** the base scale for the axis */
    baseScale: IScalar;

    /** the list of scalars for the axis */
    scalars?: IScalar[];
}

/**
 * defines what type of axis scaling to use
 *
 * @enum {number}
 */
export enum AxisType {
    /** continuous axis of data with a linear scale */
    Linear,
    /** continuous axis of data with a logarithmic (base 10) scale */
    Logarithmic,
    /** axis of data with discrete values that are enumerated or derived from the data */
    Ordinal
}   // enum AxisType


/** interface that describes the data represented in an axis */
export interface IAxisDescription {
    scaleType: AxisType;
    /** what scaling and text to show for the units */
    scalingInfo?: IScalingInfo;
    /** how many decimals to show for the units */
    precision?: number;
    /** text to define what this axis represents */
    label?: string;
    /**  used for the Ordinal scaling type to define the keys */
    keys?: any[];
    /** used for a continuous axis to define what range the axis should show */
    range?: IRange;
}

/** options to pass to the axis to change how it is rendered */
export interface IAxisOptions extends IOptions {
    /** change the number of ticks to show on this axis when rendering */
    tickCount?: number;
    /** change the size of ticks that are not the two outside ticks */
    tickSizeInner?: number;
    /** change the size of the two outside ticks */
    tickSizeOuter?: number;
    /** map tick string to another value */
    tickMappingFunc?: (value: any) => string;
    /** rotate the text of the axis */
    rotateText?: boolean;
    /** percentage to rotate the text of the axis */
    rotateTextDegrees?: number;
    /** enable brush selection in ordinal case which is atypical */
    enableOrdinalBrushSelection?: boolean;
    /** try to set range from 0 to the value if possible */
    enableZeroOffset?: boolean;
}

/** the combination of axis definition and rendering information needed
 * to render this axis
 */
export interface IAxis extends UIElement {
    renderer?: UIRenderer;
    manager?: UIElementManager;

    /** defines what data to represent in the axis */
    axisDesc: IAxisDescription;
    /** defines whether an axis is top/bottom/left/right */
    alignment: Alignment;
    /** used for Y axis if you want the range to autoscale as you zoom in and out */
    enableDynamicRange?: boolean;
    /** any misc options to configure the axis */
    options?: IAxisOptions,
    /** an axis may be hidden if it is just being used to scale the data */
    hidden?: boolean;
    /** any special CSS to hardcode for this axis */
    css?: ICss;
}

/** An axis that has been render */
export interface IRenderedAxis {
    /** returns a function that converts a value into the pixel scaled value */
    getScale(): (value: any) => number;

    /** returns the number of pixels for this axis */
    getRangePixels(): number;
}