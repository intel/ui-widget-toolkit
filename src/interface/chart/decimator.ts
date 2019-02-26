import { IXYValue, IFlameChartValue, IMinMaxValue, ICandlestickValue } from './series-data';
import { IBuffer } from '../ui-base';

/**
 * Define the interface for a decimator
 */
export interface IDecimator {
    initialize?(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number);

    /**
     * the name of this decimation scheme
     */
    getKey(): string;

    /**
     * the name of this decimation scheme
     */
    getName(): string;

    /**
     * Returns the decimated list of data
     */
    getValues(): any;

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(xStart: number, xEnd: number, values: any): any;
}   // interface IDecimator

/*************************************************************
 * NEWS (Min/Max/Entry/Exit) CHART DECIMATORS
 */
/**
 * Internally used class for the array of values
 */
export interface INEWSDecimationValue extends ICandlestickValue {
    y: any;
} // class IINEWSDecimationValue

/*************************************************************
 * SIMPLE XY CHART DECIMATORS
 */
export interface IXYDecimator extends IDecimator {
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number);

    /**
     * Returns the decimated list of data
     */
    getValues(): IXYValue[];

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(xStart: number, xEnd: number, values: IBuffer<IXYValue>): IXYValue[];
}   // interface IDecimator

/****************************************************
 * STACKED XY DECIMATORS
 */
export interface IXYStackedDecimator extends IDecimator {
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number,
        seriesNames?: string[]);

    /**
     * Returns the decimated list of data
     */
    getValues(): IXYValue[][];

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(xStart: number, xEnd: number, values: IBuffer<IXYValue>[]): IXYValue[][];
}   // interface IDecimator

/*************************************************************
 * FLAME CHART DECIMATORS
 */

export interface IFlameChartDecimator extends IDecimator {
    initialize?(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number);

    /**
     * Returns the key of this decimator
     */
    getKey(): string;

    /**
     * the name of this decimation scheme
     */
    getName(): string;

    /**
     * Returns the decimated list of data
     */
    getValues(): IFlameChartValue[];

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(xStart: number, xEnd: number, values: any): IFlameChartValue[];
}
11
/*************************************************************
 * TRACE DATA DECIMATORS
 */

export interface ITraceResidencyDecimator extends IDecimator {
    initialize?(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number,
        seriesNames?: string[]);

    /**
     * Returns the key of this decimator
     */
    getKey(): string;

    /**
     * the name of this decimation scheme
     */
    getName(): string;

    /**
     * Returns the decimated list of data
     */
    getValues(): IXYValue[][];

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(xStart: number, xEnd: number, values: any): IXYValue[][];
}

export interface ITraceStateDecimator extends IDecimator {
    initialize?(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number,
        seriesNames?: string[]);

    /**
     * Returns the key of this decimator
     */
    getKey(): string;

    /**
     * the name of this decimation scheme
     */
    getName(): string;

    /**
     * Returns the decimated list of data
     */
    getValues(): INEWSDecimationValue[];

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(xStart: number, xEnd: number, values: any): INEWSDecimationValue[];
}

export interface IPolarCoord {
    angle: number;
    radius: number;
}
export interface IPolarSegment {
    startAngle: number;
    endAngle: number;
    outerRadius: number;
    innerRadius: number;
    depth: number;
    rawData: any;
}

export interface ISunburstDecimationInfo {
    arcs: IPolarSegment[],  // arcs ordered by angle
    renderedArcs: IPolarSegment[],  // arcs to render
    background: IPolarCoord[]
}
export interface ISunburstDecimator {
    /**
     * Returns the key of this decimator
     */
    getKey(): string;

    /**
     * the name of this decimation scheme
     */
    getName(): string;

    /**
     * Returns the decimated list of data
     */
    getValues(): ISunburstDecimationInfo;

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    decimateValues(values: any): ISunburstDecimationInfo;

    /**
     * reset the decimator
     */
    reset();
}