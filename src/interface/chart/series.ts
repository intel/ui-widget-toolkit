
import { IEvent, UIElement, ITooltipData, ILegendItem } from '../ui-base';
import { IRenderedAxis, IScalingInfo } from './axis';
import { ILayer } from './chart';

export interface ICartesianSeriesPlugin {
    // static canRender: (layer: any): boolean;

    /** get the name of this series */
    getName: () => string;

    /** check if the x is continuous series */
    isXContinuousSeries: () => boolean;

    /** check if the y is continuous series */
    isYContinuousSeries: () => boolean;

    /** get all discrete x values */
    getDiscreteXValues?: (isStacked: boolean) => string[];

    /** get all discrete y values */
    getDiscreteYValues?: () => string[];

    /** get x min max values for the object */
    getXMinMax: () => number[];

    /** get y min max values for the object */
    getYMinMax: () => number[];

    /** get the minimum graph height */
    getRequiredHeight: () => number;

    /** decimate the data for the series or series group */
    decimateData: (xStart: number, xEnd: number, xAxis: IRenderedAxis, yAxis: IRenderedAxis) => Promise<any>;

    /** get the x scaling info for this series */
    getXScalingInfo: () => IScalingInfo;

    /** get the y scaling info for this series */
    getYScalingInfo: () => IScalingInfo;

    /** fill in tooltip information  */
    getTooltipMetrics: (elem: UIElement, event: IEvent) => ITooltipData[];

    /** get information for the legend to render */
    getLegendInfo: () => ILegendItem[];

    /** handle on select events if we want to */
    addHover: (selection: string) => void;

    /** handle on deselect events if we want to */
    removeHover: (selection: string) => void;

    /** set update data for the given plugin */
    setData: (layer: ILayer) => void;

    /** render all of the data in the series
     * @param svg the svg to draw the data in
     * @param yOffsets for each data point in this element
     */
    render: (yOffsets?: number[]) => void;
}