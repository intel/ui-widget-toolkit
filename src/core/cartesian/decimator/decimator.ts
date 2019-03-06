import {
    IXYValue, IFlameChartValue, ITraceValue
} from '../../../interface/chart/series-data';
import {
    IDecimator, IXYDecimator, IXYStackedDecimator, IFlameChartDecimator,
    ITraceResidencyDecimator, ITraceStateDecimator, INEWSDecimationValue
} from '../../../interface/chart/decimator';

import { IBuffer } from '../../../interface/ui-base';
import { XYValue, CandlestickValue } from '../../data';
import { bisectBuffer } from '../../utilities';

export var findFirstInsertionIdx: (buffer: IBuffer<{ x: any }>, x: number) => number =
    bisectBuffer(function (xy: { x: any }) { return xy.x }).left;
export var findLastInsertionIdx: (buffer: IBuffer<{ x: any }>, x: number) => number =
    bisectBuffer(function (xy: { x: any }) { return xy.x }).right;

/** This function is created by a user to do a user defined decimation.
 * Note that the function is called once per x pixel on the screen.  Also
 * it is guaranteed that the inputValues will be in the same order as they
 * are in the original array, so runnings statistical values can be stored
 * in the function if really needed.
 *
 * yValueToCoord will map the yValue to an actual pixel.  The larger the
 * output of yValueToCoord, the smaller the actual value is aka there is an
 * inverse relationship between yValueToCoord output and the actual Y value.
 *
 */
export type IXYXSimpleDecimationFunction = (inputValues: IBuffer<IXYValue>,
    startIdx: number, endIdx: number,
    yValueToCoord: (value: any) => number,
    xValueToCoord: (value: any) => number,
    xStart: number, xEnd: number) => IXYValue[];

/**
 * this class allows a decimation function to be passed in to allow for
 * generic decimation
 */
export class CustomPointXYDecimator implements IXYDecimator {
    /** this function should take a set of buckets and reduce them
     * to a decimated subset for a given range */
    protected _key: string;

    protected _name: string;

    /** this function should take a set of buckets and reduce them
     * to a decimated subset for a given range */
    protected _customFunc: IXYXSimpleDecimationFunction;

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    /** the list of values in the bucket */
    protected _decimatedValues: IXYValue[];

    constructor() {
        this._name = 'Simple Unimplemented Decimator';
    }

    /**
     * construct a generic decimator using a custom user function
     *
     * @param xValueToCoord converts the x value to a GUI x coordinate
     * @param yValueToCoord converts the y value to a GUI y coordinate
     * @param decimationFunc convert a list of data to a for rendering smaller list
     */
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {

        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return this._key;
    }

    /**
     * Returns the name of this decimator
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Returns the decimated list of buckets
     */
    public getValues(): IXYValue[] {
        return this._decimatedValues;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, inputValues: IBuffer<IXYValue>): IXYValue[] {
        // loop over the data samples
        this._decimatedValues = [];
        if (inputValues.length() === 0) {
            return this._decimatedValues;
        }

        let left: number = findFirstInsertionIdx(inputValues, xStart);
        let right: number = findLastInsertionIdx(inputValues, xEnd);

        if (left > 0) {
            --left;
        }
        if (right < inputValues.length()) {
            ++right;
        }

        let xStartCoord: number;
        if (xStart) {
            xStartCoord = Math.floor(this._xValueToCoord(xStart));
        } else {
            xStartCoord = Math.floor(this._xValueToCoord(inputValues.get(left).x));
        }

        let startIdx = left;
        for (let index = left; index < right; ++index) {
            let inputValue = inputValues.get(index);
            let xEndCoord = Math.floor(this._xValueToCoord(inputValue.x));

            let endIdx = index;
            if (endIdx === right - 1 || xEndCoord !== xStartCoord &&
                (xEnd === undefined || (inputValue.x < xEnd && inputValue.x > xStart))) {
                this._decimatedValues = this._decimatedValues.concat(
                    this._customFunc(inputValues, startIdx, endIdx,
                        this._yValueToCoord, this._xValueToCoord,
                        this._xCoordToValue(xStartCoord), this._xCoordToValue(xEndCoord)));

                xStartCoord = xEndCoord;
                startIdx = endIdx;
            }
        }

        return this._decimatedValues;
    }
}

/** used to compute the min values for a set of data */
export class MinPointDecimator extends CustomPointXYDecimator {
    public static KEY = 'MinPointDecimator';
    constructor() {
        super();

        this._key = MinPointDecimator.KEY;
        this._name = 'Min';
        this._customFunc = function (values: IBuffer<IXYValue>, startIdx: number,
            endIdx: number, yValueToCoord: (value: any) => number): IXYValue[] {

            if (values.length() > 0 && startIdx !== endIdx) {
                let minY = Number.MAX_VALUE;
                let minValue: IXYValue;
                for (let i = startIdx; i < endIdx; ++i) {
                    let value = values.get(i);
                    let y = value.y;
                    if (y < minY) {
                        minValue = value;
                        minY = y;
                    }
                }
                return [minValue];
            }
            return [];
        }
    }
};

function computeAvg(values: IBuffer<IXYValue>, startIdx: number,
    endIdx: number, yValueToCoord: (value: any) => number): IXYValue[] {

    if (values.length() > 0 && startIdx !== endIdx) {
        let total = 0;
        for (let i = startIdx; i < endIdx; ++i) {
            let value = values.get(i);
            total += value.y;
        }
        return [new XYValue(values.get(endIdx - 1).x,
            total / (endIdx - startIdx))];
    }
    return [];
}

/** used to compute the avg values for a set of data */
export class AvgPointDecimator extends CustomPointXYDecimator {
    public static KEY = 'AvgPointDecimator';
    constructor() {
        super();

        this._key = AvgPointDecimator.KEY;
        this._name = 'Avg';
        this._customFunc = computeAvg;
    }
};

/** used to compute the min values for a set of data */
export class MaxPointDecimator extends CustomPointXYDecimator {
    public static KEY = 'MaxPointDecimator';
    constructor() {
        super();

        this._key = MaxPointDecimator.KEY;
        this._name = 'Max';
        this._customFunc = function (values: IBuffer<IXYValue>, startIdx: number,
            endIdx: number, yValueToCoord: (value: any) => number): IXYValue[] {

            if (values.length() > 0 && startIdx !== endIdx) {
                let maxY = -Number.MAX_VALUE;
                let maxValue: IXYValue;
                for (let i = startIdx; i < endIdx; ++i) {
                    let value = values.get(i);
                    let y = value.y;
                    if (y > maxY) {
                        maxValue = value;
                        maxY = y;
                    }
                }
                return [maxValue];
            }
            return [];
        }
    }
};

/**
 * Data decimation to fit information to onto the graph.
 *
 * This class divides the x-Axis time range into a set of buckets.  Each
 * bucket provides the average of the values, the minimum & maximum
 * values, and the values upon entry & exit.
 * It assumes that the DB values are increase over the time.
 */
export class XYPointDecimator extends CustomPointXYDecimator {
    public static KEY = 'XYPointDecimator';
    constructor() {
        super();

        this._key = XYPointDecimator.KEY;
        this._name = 'XYPointDecimator';
        this._customFunc = function (values: IBuffer<IXYValue>, startIdx: number,
            endIdx: number, yValueToCoord: (value: any) => number): IXYValue[] {

            let yMap: { [index: number]: boolean } = {};
            let reducedValues: IXYValue[] = [];

            for (let i = startIdx; i < endIdx; ++i) {
                let value = values.get(i);

                let yCoord = Math.floor(yValueToCoord(value.y));
                if (!yMap.hasOwnProperty(yCoord.toString())) {
                    reducedValues.push(value);
                    yMap[yCoord] = true;
                }
            }
            return reducedValues;
        }
    }
}   // class VerticalDecimator

/**
 * this class allows a decimation function to be passed in to allow for
 * generic decimation
 */
export class CustomContinuousXYDecimator implements IXYDecimator {
    /** this function should take a set of buckets and reduce them
     * to a decimated subset for a given range */
    protected _key: string;

    protected _name: string;

    /** this function should take a set of buckets and reduce them
     * to a decimated subset for a given range */
    protected _customFunc: IXYXSimpleDecimationFunction;

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    /** the list of values in the bucket */
    protected _decimatedValues: IXYValue[];

    constructor() {
        this._name = 'Simple Unimplemented Decimator';
    }

    /**
     * construct a generic decimator using a custom user function
     *
     * @param xValueToCoord converts the x value to a GUI x coordinate
     * @param yValueToCoord converts the y value to a GUI y coordinate
     * @param decimationFunc convert a list of data to a for rendering smaller list
     */
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {

        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return this._key;
    }

    /**
     * Returns the name of this decimator
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Returns the decimated list of buckets
     */
    public getValues(): IXYValue[] {
        return this._decimatedValues;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, inputValues: IBuffer<IXYValue>): IXYValue[] {
        // loop over the data samples
        this._decimatedValues = [];
        if (inputValues.length() === 0) {
            return this._decimatedValues;
        }

        let left: number = findFirstInsertionIdx(inputValues, xStart);
        let right: number = findLastInsertionIdx(inputValues, xEnd);

        if (left > 0) {
            --left;
        }
        if (right < inputValues.length()) {
            ++right;
        }

        let lastX: number;
        if (left < inputValues.length()) {
            lastX = Math.floor(this._xValueToCoord(inputValues.get(left).x));
            --lastX;
        }

        let xStartCoord: number;
        if (xStart) {
            xStartCoord = this._xValueToCoord(xStart);
        } else {
            xStartCoord = left;
        }

        let lastIdx = left;
        for (let index = left; index < right; ++index) {
            let inputValue = inputValues.get(index);
            let xEndCoord = Math.floor(this._xValueToCoord(inputValue.x));

            let endIdx = index + 1;
            if (xEndCoord !== lastX) {
                this._decimatedValues = this._decimatedValues.concat(
                    this._customFunc(inputValues, lastIdx, endIdx,
                        this._yValueToCoord, this._xValueToCoord,
                        this._xCoordToValue(xStartCoord), this._xCoordToValue(xEndCoord)));

                xStartCoord = xEndCoord;
                lastX = xEndCoord;
                lastIdx = endIdx;
            }
        }

        if (lastIdx !== inputValues.length()) {
            this._decimatedValues = this._decimatedValues.concat(
                this._customFunc(inputValues, lastIdx, lastIdx + 1,
                    this._yValueToCoord, this._xValueToCoord,
                    this._xCoordToValue(xStartCoord), Number.MAX_VALUE));
        }
        return this._decimatedValues;
    }
}

/** used to compute the avg values for a set of data */
export class AvgContinuousDecimator extends CustomContinuousXYDecimator {
    public static KEY = 'AvgContinuousDecimator'
    constructor() {
        super();

        this._key = AvgContinuousDecimator.KEY;
        this._name = 'Avg';
        this._customFunc = computeAvg;
    }
};

/** this is a helper function class that computes the summed values for each
 * Y state per each X bucket
 */
export function sumMultiXYSeriesValues(_xValueToCoord: (value: any) => number,
    _xCoordToValue: (value: any) => number, _yValueToCoord: (value: any) => number,
    xStart: number, xEnd: number, values: IBuffer<IXYValue>[]): any[][] {

    let ret: any[] = [];
    // first this is total weighted sum per x, then used to store percentage per x
    let tempValues: number[][] = [];

    let globalStartBucket = 0;
    let globalEndBucket = Math.ceil(_xValueToCoord(Number.MAX_VALUE));

    if (globalEndBucket < globalStartBucket) {
        return undefined;
    }

    // NOTE: I do this up here so I can cheat and use the x values here
    // so later I don't keep calling _xCoordToValue
    let xBucketValues = [];
    for (let bucket = 0; bucket <= globalEndBucket + 1; ++bucket) {
        xBucketValues.push(_xCoordToValue(bucket));
    }

    // for a series get the weighted sum for the number of buckets xStart to xEnd
    for (let stateIdx = 0; stateIdx < values.length; ++stateIdx) {
        let perStateData = values[stateIdx];
        let value: IXYValue;
        let nextValue: IXYValue;
        let start = findFirstInsertionIdx(values[stateIdx], xStart);
        let end = findLastInsertionIdx(values[stateIdx], xEnd);

        if (start > 0) {
            --start;
        }
        // the last element would be caught by the algorithm already
        if (end === perStateData.length()) {
            --end;
        }

        // pad endBucket + 1 so we get data past the last point in the bucket
        // so we can graph to the first value in the next bucket
        tempValues[stateIdx] = Array.apply(null, Array(globalEndBucket)).
            map(Number.prototype.valueOf, 0);

        // get weighted sum of the values for each bucket
        for (let rawDataIdx = start; rawDataIdx < end; ++rawDataIdx) {
            value = perStateData.get(rawDataIdx);
            nextValue = perStateData.get(rawDataIdx + 1);

            let startBucket = Math.floor(_xValueToCoord(value.x));
            let endBucket = Math.floor(_xValueToCoord(nextValue.x));

            let totalX = (nextValue.x - value.x);
            let valuePerX = totalX === 0 ? 0 : nextValue.y / totalX;
            if (startBucket === endBucket) {
                if (xStart === undefined || (value.x > xStart && nextValue.x < xEnd)) {
                    // here it's all in the existing bucket
                    tempValues[stateIdx][startBucket] += valuePerX;
                } else {
                    let bucketScalar = 1 / (xBucketValues[startBucket + 1] - xBucketValues[startBucket]);
                    if (nextValue.x < xEnd) {
                        // here the back half is in the bucket
                        tempValues[stateIdx][startBucket] +=
                            (nextValue.x - xBucketValues[startBucket]) * valuePerX * bucketScalar;
                    } else {
                        // here the front half is in the bucket
                        tempValues[stateIdx][startBucket] +=
                            (xBucketValues[startBucket + 1] - value.x) * valuePerX * bucketScalar;
                    }
                }
            } else {
                let bucketScalar = 1 / (xBucketValues[startBucket + 1] - xBucketValues[startBucket]);
                let startX = xStart ? Math.max(xStart, value.x) : value.x;
                let endStartBucket = xBucketValues[startBucket + 1];
                tempValues[stateIdx][startBucket] +=
                    (endStartBucket - startX) * valuePerX * bucketScalar;

                // add in all the bucket values in between
                for (let currBucket = startBucket + 1; currBucket < endBucket; ++currBucket) {
                    tempValues[stateIdx][currBucket] += valuePerX;
                }

                // add in end bucket amount
                bucketScalar = 1 / (xBucketValues[endBucket] - xBucketValues[endBucket - 1]);
                let endX = xEnd ? Math.min(xEnd, nextValue.x) : nextValue.x;
                let startEndBucket = xBucketValues[endBucket];
                tempValues[stateIdx][endBucket] +=
                    (endX - startEndBucket) * valuePerX * bucketScalar;
            }
        }

        ret[stateIdx] = [];

        let buckets = tempValues[stateIdx];
        for (let bucket = 0; bucket < buckets.length; ++bucket) {
            ret[stateIdx][bucket] = {
                x: xBucketValues[bucket],
                y: tempValues[stateIdx][bucket]
            };
        }
    }

    return ret;
}

/** class that computes the summed values for each Y state per each X bucket */
export class SummedValueMultiXYSeriesDecimator implements IXYStackedDecimator {
    public static KEY = 'SummedValueMultiXYSeriesDecimator';

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    /** the list of values in the bucket */
    protected _decimatedValues: IXYValue[][];

    constructor() {
    }

    /**
     * construct a generic decimator using a custom user function
     *
     * @param xValueToCoord converts the x value to a GUI x coordinate
     * @param yValueToCoord converts the y value to a GUI y coordinate
     * @param decimationFunc convert a list of data to a for rendering smaller list
     */
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {

        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return SummedValueMultiXYSeriesDecimator.KEY;
    }

    /**
     * Returns the decimated list of buckets
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of buckets
     */
    public getValues(): IXYValue[][] {
        return this._decimatedValues;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<IXYValue>[]): IXYValue[][] {

        this._decimatedValues = sumMultiXYSeriesValues(this._xValueToCoord,
            this._xCoordToValue, this._yValueToCoord, xStart, xEnd, values);
        return this._decimatedValues;
    }
};

/** class that computes the residency values for each Y state per each X bucket.
 * This means the sum of all values within an output bucket is 100.
*/
export class ResidencyDecimator extends SummedValueMultiXYSeriesDecimator {
    public static KEY = 'ResidencyDecimator';

    constructor() {
        super();
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return ResidencyDecimator.KEY;
    }

    /**
     * Returns the decimated list of buckets
     */
    public getName(): string {
        return '';
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<IXYValue>[]): IXYValue[][] {

        this._decimatedValues = sumMultiXYSeriesValues(this._xValueToCoord,
            this._xCoordToValue, this._yValueToCoord, xStart, xEnd, values);

        // normalize all values to 100%
        for (let bucket = 0; bucket < this._decimatedValues[0].length; ++bucket) {
            let total = 0;
            for (let stateIdx = 0; stateIdx < this._decimatedValues.length; ++stateIdx) {
                if (this._decimatedValues[stateIdx][bucket].y) {
                    total += this._decimatedValues[stateIdx][bucket].y;
                }
            }
            if (total > 0) {
                let scalar = 100 / total;
                for (let stateIdx = 0; stateIdx < values.length; ++stateIdx) {
                    if (this._decimatedValues[stateIdx][bucket].y) {
                        this._decimatedValues[stateIdx][bucket].y =
                            this._decimatedValues[stateIdx][bucket].y * scalar;
                    }
                }
            }
        }

        return this._decimatedValues;
    }
};

/** class that computes the summed Y value per each X bucket */
export class SummedValueXYSeriesDecimator implements IXYDecimator {
    public static KEY = 'SummedValueXYSeriesDecimator';

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    /** the list of values in the bucket */
    protected _decimatedValues: IXYValue[];

    constructor() {
    }

    /**
     * construct a generic decimator using a custom user function
     *
     * @param xValueToCoord converts the x value to a GUI x coordinate
     * @param yValueToCoord converts the y value to a GUI y coordinate
     * @param decimationFunc convert a list of data to a for rendering smaller list
     */
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {

        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the name of this decimator
     */
    public getKey(): string {
        return SummedValueXYSeriesDecimator.KEY;
    }

    /**
     * Returns the name of this decimator
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of buckets
     */
    public getValues(): IXYValue[] {
        return this._decimatedValues;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<IXYValue>): IXYValue[] {

        this._decimatedValues = sumMultiXYSeriesValues(this._xValueToCoord,
            this._xCoordToValue, this._yValueToCoord, xStart, xEnd, [values])[0];
        return this._decimatedValues;
    }
}

/*************************************************************
 * NEWS (Min/Max/Entry/Exit) CHART DECIMATORS
 */
/**
 * Internally used class for the array of values
 */
export class NEWSDecimationValue extends CandlestickValue implements INEWSDecimationValue {
    public y: any;

    /** number of samples that contributed to this bucket */
    public _bucketPts: number;

    /**
     * Construct a DecimationValue instance
     *
     * @param value - an XYValue to initialize the decimation value
     */
    constructor() {
        super(undefined, undefined, undefined, undefined, undefined);
        this._bucketPts = 0;
    } // constructor
} // class DecimationValue

/**
 * Data decimation to fit information to onto the graph.
 *
 * This class divides the x-Axis time range into a set of buckets.  Each
 * bucket provides the average of the values, the minimum & maximum
 * values, and the values upon entry & exit.
 * It assumes that the DB values are increase over the time.
 */
export class NEWSBaseDecimator implements IDecimator {
    /** an unique identifier for this decimator */
    protected _key: string;

    /** The buckets we're accumlating */
    protected _buckets: NEWSDecimationValue[];

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    public initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {
        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return this._key;
    }

    public getName(): string {
        return '';
    }

    /**
     * Get the accumulated buckets
     *
     * @returns the accumulated buckets
     */
    public getValues(): NEWSDecimationValue[] {
        return this._buckets;
    }

    /**
     * Bucket dumper
     */
    public _dumpBucket(firstTimeStamp: number, bucket: NEWSDecimationValue, valuesInBucket: number): string {
        let details: string = "valuesInBucket = " + valuesInBucket.toFixed(0) + ", ";

        details += "([avg]Time delta, avgValue) = (" +
            (bucket.x - firstTimeStamp).toFixed(2) + ", " + bucket.y.toFixed(2) + "), ";
        details += "(entry, min, max, exit) = (" + (bucket.entry).toFixed(2) + ", " +
            (bucket.min).toFixed(2) + ", " + (bucket.max).toFixed(2) + ", " +
            (bucket.exit).toFixed(2) + ")";

        return details;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, inputValues: IBuffer<IXYValue>): NEWSDecimationValue[] {
        throw 'Error need to implement decimate code'
    }
}

/** this class takes a series x, y points and using for each X bucket provides
 * the Y entry/exit/min/max/average for that X bucket
 */
export class NEWSPointDecimator extends NEWSBaseDecimator {
    public static KEY = 'NEWSPointDecimator';
    constructor() {
        super();
        this._key = NEWSPointDecimator.KEY;
    }

    protected createNewBucket(decimatedValue: NEWSDecimationValue, value: IXYValue): void {
        decimatedValue.entry = value.y;
        decimatedValue.exit = value.y;
        decimatedValue.min = value.y;
        decimatedValue.max = value.y;
        decimatedValue.x = 0;
        decimatedValue.y = 0;
        decimatedValue._bucketPts = 0;
        this.addToBucket(decimatedValue, value);
    }

    /**
     * Add an x/y value pair to this value. Both the time (x) and
     * value (y) are added to this point/bucket
     *
     * @param dbPoint - The x/y value pair to add to this value.
    */

    protected addToBucket(decimatedValue: NEWSDecimationValue, value: IXYValue): void {
        decimatedValue.x += value.x;
        decimatedValue.y += value.y;
        decimatedValue.min = Math.min(decimatedValue.min, value.y);
        decimatedValue.max = Math.max(decimatedValue.max, value.y);
        decimatedValue.exit = value.y;

        decimatedValue._bucketPts++;
    }

    protected finalizeBucket(decimatedValue: NEWSDecimationValue, pointsInBucket?: number) {
        if (undefined !== pointsInBucket) {
            if (pointsInBucket !== decimatedValue._bucketPts) {
                console.log("AverageTime: mismatching pt calculation");
            }
        }
        if (decimatedValue._bucketPts === 0) {
            console.log("AverageTime: 0 points");
        }
        decimatedValue.x = decimatedValue.x / decimatedValue._bucketPts;
        decimatedValue.y = decimatedValue.y / decimatedValue._bucketPts;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, inputValues: IBuffer<IXYValue>): NEWSDecimationValue[] {
        // loop over the data samples
        this._buckets = [];
        if (inputValues.length() === 0) {
            return this._buckets;
        }
        let currentPoint: NEWSDecimationValue;

        let left: number = findFirstInsertionIdx(inputValues, xStart);
        let right: number = findLastInsertionIdx(inputValues, xEnd);

        if (left > 0) {
            --left;
        }
        if (right < inputValues.length()) {
            ++right;
        }

        let lastX: number = 0;
        if (left < inputValues.length()) {
            lastX = Math.floor(this._xValueToCoord(inputValues.get(left).x));
            --lastX;
        }

        for (let index: number = left; index < right; ++index) {
            let inputValue = inputValues.get(index);
            let xCoord = Math.floor(this._xValueToCoord(inputValue.x));

            if (xCoord !== lastX) {
                if (currentPoint) {
                    this.finalizeBucket(currentPoint);
                    this._buckets.push(currentPoint);
                }
                currentPoint = new NEWSDecimationValue();
                this.createNewBucket(currentPoint, inputValue);

                lastX = xCoord;
            } else {
                this.addToBucket(currentPoint, inputValue);
            }
        }
        if (currentPoint) {
            this.finalizeBucket(currentPoint);
            this._buckets.push(currentPoint);
        }

        return this._buckets;
    }  // decimateValues()
}   // class NEWSDecimator

/** this class takes a series x, y points and using for each X bucket provides
 * the Y entry/exit/min/max/average for that X bucket
 */
export class NEWSStateDecimator extends NEWSBaseDecimator {
    public static KEY = 'NEWSStateDecimator';
    protected _weightedSums: { [index: string]: number } = {};
    protected _prevX = 0;
    protected _isYObject: boolean;
    protected _states: string[];

    constructor(states?: string[]) {
        super();
        this._prevX = 0;
        this._key = NEWSStateDecimator.KEY;

        if (states) {
            this._states = states;
        }
    }

    protected createNewBucket(decimatedValue: NEWSDecimationValue, value: IXYValue) {
        this._weightedSums = {};
        decimatedValue._bucketPts = 0;

        let defaultValue: any;
        if (!this._isYObject) {
            defaultValue = value.y;
            decimatedValue.x = 0;
            decimatedValue.y = defaultValue;
            decimatedValue.entry = defaultValue;
            decimatedValue.exit = defaultValue;
            decimatedValue.min = defaultValue;
            decimatedValue.max = defaultValue;
        }

        this.addToBucket(decimatedValue, value);
    };

    protected addToStateValueToBucket(state: string, value: number) {
        if (value === 0) {
            return;
        }
        if (!this._weightedSums[state]) {
            this._weightedSums[state] = 0;
        }
        this._weightedSums[state] += value;
    }

    protected addToBucket(decimatedValue: NEWSDecimationValue, value: IXYValue): void {

        if (this._isYObject) {
            if (this._states) {
                // take prevX and currentX
                for (let stateKey in value.y as { [index: number]: number }) {
                    this.addToStateValueToBucket(this._states[stateKey],
                        (value.x - this._prevX) * value.y[stateKey]);
                }
            } else {
                // take prevX and currentX
                for (let state in value.y) {
                    this.addToStateValueToBucket(state,
                        (value.x - this._prevX) * value.y[state]);
                }
            }
        } else {
            let state: any;
            if (this._states) {
                state = this._states[value.y];
            } else {
                state = value.y;
            }
            decimatedValue.exit = state;
            this.addToStateValueToBucket(state, (value.x - this._prevX));
        }

        decimatedValue.x += value.x;
        decimatedValue._bucketPts++;

        this._prevX = value.x;
    }

    protected finalizeBucket(decimatedValue: NEWSDecimationValue,
        pointsInBucket?: number): void {
        if (undefined !== pointsInBucket) {
            if (pointsInBucket !== decimatedValue._bucketPts) {
                console.log("AverageTime: mismatching pt calculation");
            }
        }
        if (decimatedValue._bucketPts === 0) {
            console.log("AverageTime: 0 points");
        }
        decimatedValue.x = decimatedValue.x / decimatedValue._bucketPts;

        // find the maximum value by weightedSums
        var maxWeightedKey: any;
        var maxWeightValue = -Number.MAX_VALUE;
        let minState = -Number.MAX_VALUE;
        let maxState = Number.MAX_VALUE;

        for (let state in this._weightedSums) {
            if (this._weightedSums[state] !== undefined) {
                let stateWeight = this._weightedSums[state];
                if (stateWeight > maxWeightValue) {
                    maxWeightedKey = state;
                    maxWeightValue = stateWeight;
                }
            }
            // min is bigger since Y values increase as you go down the axis
            let yOffset = this._yValueToCoord(state);
            if (yOffset > minState) {
                decimatedValue.min = state;
                minState = yOffset;
            }
            if (yOffset < maxState) {
                decimatedValue.max = state;
                maxState = yOffset;
            }
        }

        let hasValues = maxWeightedKey !== undefined;
        if (hasValues) {
            decimatedValue.y = maxWeightedKey;
        } else {
            // no values so set a default a y value
            if (!this._isYObject) {
                decimatedValue.min = decimatedValue.y;
                decimatedValue.max = decimatedValue.y;
            }
        }

    } // finalize );

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number,
        inputValues: IBuffer<IXYValue>): NEWSDecimationValue[] {
        // loop over the data samples
        this._buckets = [];
        if (inputValues.length() === 0) {
            return this._buckets;
        }
        let currentPoint: NEWSDecimationValue;

        let left: number = findFirstInsertionIdx(inputValues, xStart);
        let right: number = findLastInsertionIdx(inputValues, xEnd);

        if (left > 0) {
            --left;
        }
        if (right < inputValues.length()) {
            ++right;
        }

        let lastX: number = 0;
        if (left < inputValues.length()) {
            this._isYObject = typeof (inputValues.get(left).y) === 'object';
            lastX = Math.floor(this._xValueToCoord(inputValues.get(left).x));
            --lastX;
        }

        for (let index: number = left; index < right; ++index) {
            let inputValue = inputValues.get(index);
            let xCoord = Math.floor(this._xValueToCoord(inputValue.x));

            if (xCoord !== lastX) {
                if (currentPoint) {
                    this.finalizeBucket(currentPoint);
                    this._buckets.push(currentPoint);
                }

                // add in buckets between the previous bucket and the new bucket since
                // the state spans the whole time
                if (lastX + 1 < xCoord) {
                    let point = new NEWSDecimationValue();
                    this.createNewBucket(point, inputValue);
                    this.finalizeBucket(point);
                    point.x = this._xCoordToValue(xCoord - 1);
                    this._buckets.push(point);
                    this._prevX = point.x;
                }

                currentPoint = new NEWSDecimationValue();
                this.createNewBucket(currentPoint, inputValue);

                lastX = xCoord;
            } else {
                this.addToBucket(currentPoint, inputValue);
            }
        }
        if (currentPoint) {
            this.finalizeBucket(currentPoint);
            this._buckets.push(currentPoint);
        }

        return this._buckets;
    }  // decimateValues()
};

export class FlameChartRectLimitDecimator implements IFlameChartDecimator {
    public static KEY = 'FlameChartRectLimitDecimator';
    protected _data: IFlameChartValue[];
    protected _rectLimit: number;

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    public initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {
        this._data = [];

        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return FlameChartRectLimitDecimator.KEY;
    }

    /**
     * the name of this decimation scheme
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of data
     */
    public getValues(): IFlameChartValue[] {
        return this._data;
    }

    public setRectLimit(rectLimit: number): IFlameChartDecimator {
        this._rectLimit = rectLimit;
        return this;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<IFlameChartValue>):
        IFlameChartValue[] {

        // using the whole view
        this._data = values.getData();

        if (this._rectLimit) {
            this._data.sort(function (a: IFlameChartValue, b: IFlameChartValue): number {
                if (a.traceValue.dx > b.traceValue.dx) {
                    return -1;
                }
                if (a.traceValue.dx < b.traceValue.dx) {
                    return 1;
                }
                return 0;
            });

            this._data = this._data.splice(0, this._rectLimit);
        }

        return this._data;
    }
};

/** this decimator merges the rectangles in a flame chart to combine
 * identical rectangles that are touching on a left/right pixel basis so
 * we can merge them for rendering
 */
export class FlameChartMergeRectDecimator implements IFlameChartDecimator {
    public static KEY = 'FlameChartMergeRectDecimator';
    protected _data: IFlameChartValue[];
    protected _rectLimit: number;
    protected _minRectDelta = 1;

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    public initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {
        this._data = []
        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return FlameChartMergeRectDecimator.KEY;
    }

    /**
     * the name of this decimation scheme
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of data
     */
    public getValues(): IFlameChartValue[] {
        return this._data;
    }

    public setPixelWidth(width: number): FlameChartMergeRectDecimator {
        this._minRectDelta = width - 1;
        return this;
    }

    /**
     * used to generate a list of all rects that could be drawn sorted by duration
     */
    protected mergeRects(values: IFlameChartValue[]): IFlameChartValue[] {
        let len = values.length;
        let ret = [];

        let prevValueByDepth: IFlameChartValue[] = [];
        let prevXCoordbyDepth: number[] = [];

        // compute rects
        for (let i = 0; i < len; i++) {
            let value = values[i];
            if (prevValueByDepth.length < value.depth) {
                prevValueByDepth.length = value.depth;
                prevXCoordbyDepth.length = value.depth;
            }

            // first check if you need to merge with a previous rectangle of this depth
            let prevValue = prevValueByDepth[value.depth];
            if (prevValue && prevValue.traceValue.key === value.traceValue.key &&
                prevValue.traceValue.x + prevValue.traceValue.dx === value.traceValue.x) {
                prevValue.traceValue.dx += value.traceValue.dx;
            } else {
                // might have to merge things with subpixel accuracy
                let startTime = values[i].traceValue.x;
                let subpixelMap: any = {};
                let valueList: ITraceValue[] = [];

                // before adding the next item iterate to a point where the next
                // value starts in the next pixel for the given depth`
                for (; i < len; ++i) {
                    value = values[i];
                    valueList.push(value.traceValue);

                    if (prevValueByDepth.length <= value.depth) {
                        prevValueByDepth.length = value.depth + 1;
                        prevXCoordbyDepth.length = value.depth + 1;
                        break;
                    } else {
                        let endCurrX = Math.round(this._xValueToCoord(value.traceValue.x + value.traceValue.dx));
                        if (endCurrX > prevXCoordbyDepth[value.depth] + this._minRectDelta) {
                            break;
                        } else {
                            // if we have multiple items in the end pixel add up the
                            // the durations and find the one with the most weight
                            if (!subpixelMap.hasOwnProperty[value.traceValue.name]) {
                                subpixelMap[value.traceValue.name] = 0;
                            }
                            subpixelMap[value.traceValue.name] += value.traceValue.dx;

                            // update the previous value as we iterate
                            prevValue = value;
                        }
                    }
                }

                let fcValue: IFlameChartValue;
                if (Object.keys(subpixelMap).length === 0) {
                    // if we have just one item just add it to the trace
                    fcValue = {
                        traceValue: {
                            x: value.traceValue.x,
                            dx: value.traceValue.dx,
                            key: value.traceValue.key,
                            name: value.traceValue.name,
                            desc: value.traceValue.desc,
                        },
                        decimatedValues: valueList,
                        depth: value.depth
                    }
                } else {
                    // find the subpixel value with the most weight
                    let pixelName;
                    let max = 0;
                    for (let name in subpixelMap) {
                        let groupWeight = subpixelMap[name];
                        if (groupWeight > max) {
                            pixelName = name;
                            max = groupWeight;
                        }
                    }

                    fcValue = {
                        traceValue: {
                            x: startTime,
                            dx: prevValue.traceValue.x + prevValue.traceValue.dx - startTime,
                            key: 'merged',
                            name: pixelName,
                            desc: prevValue.traceValue.desc,
                        },
                        decimatedValues: valueList,
                        depth: value.depth
                    }
                    // we back up to the last item tthat broke the subpixel iteration loop
                    --i;
                }

                ret.push(fcValue);

                // update the last value for this level
                let lastX = Math.round(this._xValueToCoord(fcValue.traceValue.x + fcValue.traceValue.dx));
                prevValueByDepth[value.depth] = fcValue;
                prevXCoordbyDepth[value.depth] = lastX;
            }
        }
        return ret;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<IFlameChartValue>):
        IFlameChartValue[] {

        let allData = values.getData();

        // using the whole view
        if (xStart !== undefined && xEnd !== undefined) {
            let filteredData = [];
            for (let i = 0; i < allData.length; ++i) {
                let fcValue = allData[i];
                let rectEnd = fcValue.traceValue.x + fcValue.traceValue.dx;
                if (rectEnd > xStart && fcValue.traceValue.x < xEnd) {
                    filteredData.push(fcValue);
                }
            }
            this._data = this.mergeRects(filteredData);
        } else {
            this._data = this.mergeRects(allData);
        }
        return this._data;
    }
};

/**
 * Takes ITraceValue data and for each bucket returns a residency value
 * by ITracevalue.name. This means the sum of all values within an output bucket is 100.
 */
export class TraceResidencyDecimator implements ITraceResidencyDecimator {
    public static KEY = 'TraceResidencyDecimator';
    protected _decimatedValues: IXYValue[][];
    protected _states: string[];

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    public initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number,
        states: string[]) {
        this._decimatedValues = []
        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
        this._states = states;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return TraceResidencyDecimator.KEY;
    }

    /**
     * the name of this decimation scheme
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of data
     */
    public getValues(): IXYValue[][] {
        return this._decimatedValues;
    }

    /**
   * Values to be decimated
   *
   * @param xStart - start time of the region
   * @param xEnd - start time of the region
   * @param values - Values to be decimated.
   */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<ITraceValue>): IXYValue[][] {
        this._decimatedValues = new Array(this._states.length).fill(0).map(() => new Array());

        let globalStartBucket = 0;
        let globalEndBucket = Math.ceil(this._xValueToCoord(Number.MAX_VALUE));

        if (globalEndBucket < globalStartBucket) {
            return undefined;
        }

        // this is total weighted sum for each state per x, then used to store percentage per x
        let tempValues: { [index: string]: number[] } = {};

        // map states to return index
        let stateMap: { [index: string]: number } = {};
        this._states.forEach((state, index) => {
            stateMap[state] = index;
            tempValues[state] = Array.apply(null, Array(globalEndBucket)).
                map(Number.prototype.valueOf, 0);
        })

        // set up the values for iteration
        // for a series get the weighted sum for the number of buckets xStart to xEnd
        let value: ITraceValue;
        let traceEndX: number;
        let start = findFirstInsertionIdx(values, xStart);
        let end = findLastInsertionIdx(values, xEnd);

        if (start > 0) {
            --start;
        }
        // the last element would be caught by the algorithm already
        if (end === values.length()) {
            --end;
        }

        // NOTE: I do this up here so I can cheat and use the x values here
        // so later I don't keep calling this._xCoordToValue
        let xBucketValues = [];
        for (let bucket = 0; bucket <= globalEndBucket; ++bucket) {
            xBucketValues.push(this._xCoordToValue(bucket));
        }

        // this is the amount of x values within a given bucket
        let bucketScalar = 1 / (xBucketValues[globalStartBucket + 1] - xBucketValues[globalStartBucket]);

        // get weighted sum of the values for each bucket
        // note this is forward looking data unlike most of our data so
        // the algorithm is a little different
        for (let rawDataIdx = start; rawDataIdx < end; ++rawDataIdx) {
            value = values.get(rawDataIdx);
            traceEndX = value.x + value.dx;

            let startBucket = Math.floor(this._xValueToCoord(value.x));
            let endBucket = Math.floor(this._xValueToCoord(traceEndX));

            if (startBucket === endBucket) {
                tempValues[value.name][startBucket] += value.dx * bucketScalar;
                // TODO consider we should/can fix this corner case

                // Code below is technically more correct as it handles some edge cases
                // but it's about 3x slower?
                // if (xStart === undefined || (value.x > xStart && traceEndX < xEnd)) {
                //     // here it's all in the existing bucket
                //     tempValues[value.name][startBucket] += value.dx * bucketScalar;
                // } else if (traceEndX > xStart) {
                //     if (traceEndX < xEnd) {
                //         // here the back half is in the bucket
                //         tempValues[value.name][startBucket] += (traceEndX - xStart) * bucketScalar;
                //     } else {
                //         // here the front half is in the bucket
                //         tempValues[value.name][startBucket] += (xEnd - value.x) * bucketScalar;
                //     }
                // }
            } else {
                // add in start bucket amount
                let startX = xStart ? Math.max(xStart, value.x) : value.x;
                let endStartBucket = xBucketValues[startBucket + 1];
                tempValues[value.name][startBucket] = (endStartBucket - startX) * bucketScalar;

                // add in all the bucket values in between
                for (let currBucket = startBucket + 1; currBucket < endBucket - 1; ++currBucket) {
                    tempValues[value.name][currBucket] += 1;
                }

                // add in end bucket amount
                let endX = xEnd ? Math.min(xEnd, traceEndX) : traceEndX;
                let startEndBucket = xBucketValues[endBucket];
                tempValues[value.name][endBucket - 1] = (endX - startEndBucket) * bucketScalar;
            }
        }

        // create an array that is used when this state wasn't seen at
        // all in the time region.
        let emptyArray = [];
        for (let bucket = 0; bucket < globalEndBucket; ++bucket) {
            emptyArray[bucket] = {
                x: xBucketValues[bucket],
                y: 0
            }
        }

        for (let stateIdx = 0; stateIdx < this._states.length; ++stateIdx) {
            let buckets = tempValues[this._states[stateIdx]];
            if (buckets) {
                for (let bucket = 0; bucket < buckets.length; ++bucket) {
                    this._decimatedValues[stateIdx][bucket] = {
                        x: xBucketValues[bucket],
                        y: tempValues[this._states[stateIdx]][bucket] * 100
                    };
                }
            } else {
                this._decimatedValues[stateIdx] = emptyArray;
            }
        }

        return this._decimatedValues;
    }
};

/**
* Takes ITraceValue data and for each bucket returns a sum by ITracevalue.name.
* This means the sum of all values within an output bucket is 100.
*/
export class TraceStateDecimator implements ITraceStateDecimator {
    public static KEY = 'TraceStateDecimator';
    protected _decimatedValues: INEWSDecimationValue[];
    protected _states: string[];

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    public initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number,
        states: string[]) {
        this._decimatedValues = []
        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
        this._states = states;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return TraceResidencyDecimator.KEY;
    }

    /**
     * the name of this decimation scheme
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of data
     */
    public getValues(): INEWSDecimationValue[] {
        return this._decimatedValues;
    }

    /**
   * Values to be decimated
   *
   * @param xStart - start time of the region
   * @param xEnd - start time of the region
   * @param values - Values to be decimated.
   */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<ITraceValue>): INEWSDecimationValue[] {
        let globalStartBucket = 0;
        let globalEndBucket = Math.ceil(this._xValueToCoord(Number.MAX_VALUE));

        if (globalEndBucket < globalStartBucket) {
            return undefined;
        }

        // set up the values for iteration
        // for a series get the weighted sum for the number of buckets xStart to xEnd
        let value: ITraceValue;
        let traceEndX: number;
        let start = findFirstInsertionIdx(values, xStart);
        let end = findLastInsertionIdx(values, xEnd);

        if (start > 0) {
            --start;
        }
        // the last element would be caught by the algorithm already
        if (end === values.length()) {
            --end;
        }

        // NOTE: I do this up here so I can cheat and use the x values here
        // so later I don't keep calling this._xCoordToValue
        let xBucketValues = [];
        for (let bucket = 0; bucket <= globalEndBucket; ++bucket) {
            xBucketValues.push(this._xCoordToValue(bucket));
        }

        this._decimatedValues = Array.apply(null, Array(globalEndBucket)).
            map(() => { return new NEWSDecimationValue(); })

        let states: { [index: string]: number } = {};
        this._states.forEach((state, i) => {
            states[state] = i;
        })

        // store the entry/exit/min/max of each bucket
        // min and max are based on the state index
        for (let rawDataIdx = start; rawDataIdx < end; ++rawDataIdx) {
            value = values.get(rawDataIdx);
            traceEndX = value.x + value.dx;

            let startBucket = Math.floor(this._xValueToCoord(value.x));
            let endBucket = Math.floor(this._xValueToCoord(traceEndX));

            if (!this._decimatedValues[startBucket].entry) {
                this._decimatedValues[startBucket].x = xBucketValues[startBucket];
                this._decimatedValues[startBucket].entry = states[value.name];
                this._decimatedValues[startBucket].exit = states[value.name];
                this._decimatedValues[startBucket].min = states[value.name];
                this._decimatedValues[startBucket].max = states[value.name];
            }
            if (startBucket === endBucket) {
                this._decimatedValues[startBucket].exit = states[value.name];
                this._decimatedValues[startBucket].min =
                    Math.min(this._decimatedValues[startBucket].min, states[value.name]);
                this._decimatedValues[startBucket].max =
                    Math.max(this._decimatedValues[startBucket].max, states[value.name]);
            } else {
                // start bucket exit
                this._decimatedValues[startBucket].exit = states[value.name];
                this._decimatedValues[startBucket].min =
                    Math.min(this._decimatedValues[startBucket].min, states[value.name]);
                this._decimatedValues[startBucket].max =
                    Math.max(this._decimatedValues[startBucket].max, states[value.name]);

                // add in all the bucket values in between
                if (endBucket !== globalEndBucket) {
                    for (let currBucket = startBucket + 1; currBucket <= endBucket; ++currBucket) {
                        this._decimatedValues[currBucket].x = xBucketValues[currBucket];
                        this._decimatedValues[currBucket].entry = states[value.name];
                        this._decimatedValues[currBucket].exit = states[value.name];
                        this._decimatedValues[currBucket].min = states[value.name];
                        this._decimatedValues[currBucket].max = states[value.name];
                    }
                }
            }
        }

        // convert state index to actual state names for rendering
        this._decimatedValues.forEach(newsValue => {
            newsValue.entry = this._states[newsValue.entry];
            newsValue.exit = this._states[newsValue.exit];
            newsValue.min = this._states[newsValue.min];
            newsValue.max = this._states[newsValue.max];
        })
        return this._decimatedValues;
    }
};

/**
 * For a marker layer just removes markers that have the same X value
 */
export class SimpleMarkerDecimator implements IDecimator {
    public static KEY = 'SimpleMarkerDecimator';
    protected _data: ITraceValue[];

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    public initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {
        this._data = []
        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return SimpleMarkerDecimator.KEY;
    }

    /**
     * the name of this decimation scheme
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of data
     */
    public getValues(): ITraceValue[] {
        return this._data;
    }

    public mergeMarkers(values: ITraceValue[]): ITraceValue[] {
        let ret: ITraceValue[] = [];

        let lastCoord = -Number.MAX_VALUE;
        values.forEach((value) => {
            let coord = this._xValueToCoord(value.x);
            if (coord !== lastCoord) {
                ret.push(value);
                lastCoord = coord;
            }
        });
        return ret;
    }
    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<ITraceValue>):
        ITraceValue[] {

        let allData = values.getData();

        // using the whole view
        if (xStart !== undefined && xEnd !== undefined) {
            let filteredData: ITraceValue[] = [];
            allData.forEach(function (value) {
                if (value.x < xEnd && value.x > xStart) {
                    filteredData.push(value);
                } else if (value.dx && value.x + value.dx < xEnd &&
                    value.x + value.dx > xStart) {
                    filteredData.push(value);
                }
            });

            this._data = this.mergeMarkers(filteredData);
        } else {
            this._data = this.mergeMarkers(allData);
        }
        return this._data;
    }
};

/** */


export class XYHeatMapDecimator implements IXYStackedDecimator {
    public static KEY = 'SummedValueMultiXYSeriesDecimator';

    /** this function is used to map the input xyValues to x scaled values*/
    protected _xValueToCoord: (value: any) => number;

    /** this function is used to map the revert xyValues from x scaled values*/
    protected _xCoordToValue: (value: any) => number;

    /** this function is used to map the input xyValues to y scaled values*/
    protected _yValueToCoord: (value: any) => number;

    /** the list of values in the bucket */
    protected _decimatedValues: IXYValue[][];

    constructor() {
    }

    /**
     * construct a generic decimator using a custom user function
     *
     * @param xValueToCoord converts the x value to a GUI x coordinate
     * @param yValueToCoord converts the y value to a GUI y coordinate
     * @param decimationFunc convert a list of data to a for rendering smaller list
     */
    initialize(xValueToCoord: (value: any) => number,
        xCoordToValue: (value: any) => number,
        yValueToCoord: (value: any) => number) {

        this._xValueToCoord = xValueToCoord;
        this._xCoordToValue = xCoordToValue;
        this._yValueToCoord = yValueToCoord;
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return SummedValueMultiXYSeriesDecimator.KEY;
    }

    /**
     * Returns the decimated list of buckets
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of buckets
     */
    public getValues(): IXYValue[][] {
        return this._decimatedValues;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(xStart: number, xEnd: number, values: IBuffer<IXYValue>[]): IXYValue[][] {
        this._decimatedValues = [];

        // first this is total weighted sum per x, then used to store percentage per x
        let tempValues: number[][] = [];

        let globalStartBucket = 0;
        let globalEndBucket = Math.ceil(this._xValueToCoord(Number.MAX_VALUE));

        if (globalEndBucket < globalStartBucket) {
            return undefined;
        }

        // NOTE: I do this up here so I can cheat and use the x values here
        // so later I don't keep calling _xCoordToValue
        let xBucketValues = [];
        for (let bucket = 0; bucket <= globalEndBucket + 1; ++bucket) {
            xBucketValues.push(this._xCoordToValue(bucket));
        }

        // for a series get the weighted sum for the number of buckets xStart to xEnd
        for (let stateIdx = 0; stateIdx < values.length; ++stateIdx) {
            let perStateData = values[stateIdx];
            let value: IXYValue;
            let nextValue: IXYValue;
            let start = findFirstInsertionIdx(values[stateIdx], xStart);
            let end = findLastInsertionIdx(values[stateIdx], xEnd);

            if (start > 0) {
                --start;
            }
            // the last element would be caught by the algorithm already
            if (end === perStateData.length()) {
                --end;
            }

            // pad endBucket + 1 so we get data past the last point in the bucket
            // so we can graph to the first value in the next bucket
            tempValues[stateIdx] = Array.apply(null, Array(globalEndBucket)).
                map(Number.prototype.valueOf, 0);

            // get weighted sum of the values for each bucket
            for (let rawDataIdx = start; rawDataIdx < end; ++rawDataIdx) {
                value = perStateData.get(rawDataIdx);
                nextValue = perStateData.get(rawDataIdx + 1);

                let startBucket = Math.floor(this._xValueToCoord(value.x));
                let endBucket = Math.floor(this._xValueToCoord(nextValue.x));

                let totalX = (nextValue.x - value.x);
                let valuePerX = totalX === 0 ? 0 : nextValue.y / totalX;
                if (startBucket === endBucket) {
                    if (xStart === undefined || (value.x > xStart && nextValue.x < xEnd)) {
                        // here it's all in the existing bucket
                        tempValues[stateIdx][startBucket] += valuePerX;
                    } else {
                        let bucketScalar = 1 / (xBucketValues[startBucket + 1] - xBucketValues[startBucket]);
                        if (nextValue.x < xEnd) {
                            // here the back half is in the bucket
                            tempValues[stateIdx][startBucket] +=
                                (nextValue.x - xBucketValues[startBucket]) * valuePerX * bucketScalar;
                        } else {
                            // here the front half is in the bucket
                            tempValues[stateIdx][startBucket] +=
                                (xBucketValues[startBucket + 1] - value.x) * valuePerX * bucketScalar;
                        }
                    }
                } else {
                    let bucketScalar = 1 / (xBucketValues[startBucket + 1] - xBucketValues[startBucket]);
                    let startX = xStart ? Math.max(xStart, value.x) : value.x;
                    let endStartBucket = xBucketValues[startBucket + 1];
                    tempValues[stateIdx][startBucket] +=
                        (endStartBucket - startX) * valuePerX * bucketScalar;

                    // add in all the bucket values in between
                    for (let currBucket = startBucket + 1; currBucket < endBucket; ++currBucket) {
                        tempValues[stateIdx][currBucket] += valuePerX;
                    }

                    // add in end bucket amount
                    bucketScalar = 1 / (xBucketValues[endBucket] - xBucketValues[endBucket - 1]);
                    let endX = xEnd ? Math.min(xEnd, nextValue.x) : nextValue.x;
                    let startEndBucket = xBucketValues[endBucket];
                    tempValues[stateIdx][endBucket] +=
                        (endX - startEndBucket) * valuePerX * bucketScalar;
                }
            }

            this._decimatedValues[stateIdx] = [];

            let buckets = tempValues[stateIdx];
            for (let bucket = 0; bucket < buckets.length; ++bucket) {
                this._decimatedValues[stateIdx][bucket] = {
                    x: xBucketValues[bucket],
                    y: tempValues[stateIdx][bucket]
                };
            }
        }

        return this._decimatedValues;
    }
};

let decimatorList = [
    new ResidencyDecimator(), new MinPointDecimator(),
    new AvgPointDecimator(), new MaxPointDecimator(), new AvgContinuousDecimator(),
    new FlameChartMergeRectDecimator(), new FlameChartRectLimitDecimator(),
    new NEWSPointDecimator(), new NEWSStateDecimator(), new SimpleMarkerDecimator(),
    new XYPointDecimator(), new SummedValueXYSeriesDecimator(),
    new SummedValueMultiXYSeriesDecimator(), new TraceResidencyDecimator()
];

export let InternalDecimatorMap: { [index: string]: IDecimator } = {};

decimatorList.forEach(function (decimator: any) {
    InternalDecimatorMap[decimator.getKey()] = decimator;
});
