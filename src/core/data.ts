import {
    IXYValue, ISummaryValue, IMinMaxValue, ICandlestickValue
} from '../interface/chart/series-data';

/**
* XYValue
*
* Class for simple data that will be rendered as part of a chart
*/
export class XYValue implements IXYValue {
    /** Specifies the independent axis co-ordinate */
    public x: any;
    /** Specifies the dependent axis co-ordinate */
    public y: any;

    /**
     * Creates a XYValue instance
     *
     * @param x the independent axis coordinate
     * @param y the dependent axis coordinate
     */
    constructor(x: any, y: any) {
        this.x = x;
        this.y = y;
    }
}   // XYValue

/**
 * MinMaxValue
 *
 * Class for candlestick data that will be rendered as part of a chart
 */
export class MinMaxValue implements IMinMaxValue {
    /** Specifies the axis co-ordinate */
    public x: any;
    /** Specifies the minimum value of metric for the axis co-ordinate */
    public min: number;
    /** Specifies the maximum value of metric for the axis co-ordinate */
    public max: number;
    /** Specifies the misc value of metric for the axis co-ordinate */
    public y: number;

    /**
     * Creates a MinMaxValue instance
     *
     * @param key - the axis co-ordinate which will be x co-ordinate
     * @param min - the minimum value of metric for the axis co-ordinate
     * @param max - the maximum value of metric for the axis co-ordinate
     * @param misc - a misc value of metric for the axis co-ordinate
     */
    constructor(x: any, min: number, max: number, misc: number) {
        this.x = x;
        this.min = min;
        this.max = max;
        this.y = misc;
    }
}   // MinMaxValue

/**
 * CandlestickValue
 *
 * Class for candlestick data that will be rendered as part of a chart
 */
export class CandlestickValue implements ICandlestickValue {
    /** Specifies the axis co-ordinate */
    public x: any;
    /** Specifies the minimum value of metric for the axis co-ordinate */
    public min: any;
    /** Specifies the maximum value of metric for the axis co-ordinate */
    public max: any;
    /** Specifies the entry value of metric for the axis co-ordinate */
    public entry: any;
    /** Specifies the exit value of metric for the axis co-ordinate */
    public exit: any;

    /**
     * Creates a CandlestickValue instance
     *
     * @param x - the axis co-ordinate which will be x co-ordinate
     * @param min - the minimum value of metric for the axis co-ordinate
     * @param max - the maximum value of metric for the axis co-ordinate
     * @param entry - the entry value of metric for the axis co-ordinate
     * @param exit - the exit value of metric for the axis co-ordinate
     */
    constructor(x: any, min: number, max: number, entry: number, exit: number) {
        this.x = x;
        this.min = min;
        this.max = max;
        this.entry = entry;
        this.exit = exit;
    }
}   // CandlestickValue

/**
 * SummaryValue class
 */
export class SummaryValue implements ISummaryValue {
    /** the description of this value */
    public key: string;

    /** the description of this value */
    public data: { [index: string]: number };

    /**
     * SummaryValue class
     *
     * @param primaryKey - key for the data
     * @param value - value for this key
     * @param secondaryKey - optional secondary key for the data
     */
    constructor(key: string,
        value: { [index: string]: number } = {}) {
        this.key = key;
        this.data = value;
    }

    /**
     * Value getter
     *
     * @returns add a value to this key
     */
    public addValue(key: string, value: number): SummaryValue {
        let data: any = this.data;

        if (data.hasOwnProperty(key)) {
            data[key] += value;
        } else {
            data[key] = value;
        }
        return this;
    }
} // class SummaryValue