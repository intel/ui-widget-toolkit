import {
    IEvent, UIElement, IBuffer, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import { IXYValue } from '../../../interface/chart/series-data';
import { IXYStackedDecimator } from '../../../interface/chart/decimator';
import {
    IXYSeries, IScalingInfo, RenderType, ILayer
} from '../../../interface/chart/chart'

import { InternalDecimatorMap } from '../decimator/decimator';
import { SimpleBuffer } from '../../utilities';

import {
    ID3Chart, D3Chart, D3Axis, createDecimatorWorker
} from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';

import { XYSeries } from './xy';

import * as d3 from 'd3';

export class XYGroupSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        // not a bar chart, not a flame chart or markers and multiple layers of data
        let possible = ((layer.renderType & RenderType.Line) || (layer.renderType & RenderType.Area) ||
            (layer.renderType & RenderType.Scatter) || layer.renderType & RenderType.DirectionalArrow);

        let isXY = true;
        layer.data.forEach((dataSet: any) => {
            isXY = isXY && dataSet.hasOwnProperty('values');
        })
        return possible && isXY && layer.data.length > 1;
    }

    protected _d3Chart: ID3Chart;
    protected _layer: ILayer;
    protected _data: IXYSeries[];
    protected _d3SeriesList: XYSeries[];
    protected _isXContinuous: boolean;
    protected _worker: Worker;
    protected _svg: any;
    protected _xAxis: D3Axis;
    protected _yAxis: D3Axis;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        this._d3Chart = chart;
        this._isXContinuous = isXContinuous;
        this._svg = svg;
        this._xAxis = xAxis;
        this._yAxis = yAxis;
        this._d3SeriesList = [];
        this.setData(layer);
    }

    public setData(layer: ILayer) {
        this._layer = layer;
        if (layer.data.length !== this._d3SeriesList.length) {
            this._d3SeriesList = [];
            for (let i = 0; i < layer.data.length; ++i) {
                let series = new XYSeries(this._d3Chart, layer, this._svg, this._xAxis,
                    this._yAxis, this._isXContinuous);
                this._d3SeriesList.push(series);
            }
        }
        for (let i = 0; i < this._d3SeriesList.length; ++i) {
            this._d3SeriesList[i].setData(layer, i);
        }
    }

    public getName() {
        return '';
    }

    public getMaxNameLength(): number {
        let len: number = 0;
        for (let i = 0; i < this._d3SeriesList.length; ++i) {
            len = Math.max(len, this._d3SeriesList[i].getName().length);
        }
        return len;
    }

    /** check if the x is continuous series */
    public isXContinuousSeries(): boolean {
        return this._isXContinuous;
    }

    /** check if the y is continuous series */
    public isYContinuousSeries(): boolean {
        for (let i = 0; i < this._d3SeriesList.length; ++i) {
            if (!this._d3SeriesList[i].isYContinuousSeries()) {
                return false;
            }
        }
        return true;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        let keys: { [index: string]: boolean } = {};
        for (let i = 0; i < this._d3SeriesList.length; ++i) {
            let localKeys = this._d3SeriesList[i].getDiscreteXValues(isStacked);
            for (let j = 0; j < localKeys.length; ++j) {
                keys[localKeys[j]] = true;
            }
        }
        return Object.keys(keys);
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        let keys: { [index: string]: boolean } = {};
        for (let i = 0; i < this._d3SeriesList.length; ++i) {
            let localKeys = this._d3SeriesList[i].getDiscreteYValues();
            for (let j = 0; j < localKeys.length; ++j) {
                keys[localKeys[j]] = true;
            }
        }
        return Object.keys(keys);
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        let xMinMax: number[] = [Number.MAX_VALUE, -Number.MAX_VALUE];

        for (let i = 0; i < this._layer.data.length; ++i) {
            let localXMinMax = this._d3SeriesList[i].getXMinMax();
            if (!isNaN(localXMinMax[0])) {
                xMinMax[0] = Math.min(localXMinMax[0], xMinMax[0]);
            }
            if (!isNaN(localXMinMax[1])) {
                xMinMax[1] = Math.max(localXMinMax[1], xMinMax[1]);
            }
        }
        return xMinMax;
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        let yMinMax: number[] = [Number.MAX_VALUE, 0];
        for (let i = 0; i < this._d3SeriesList.length; ++i) {
            let localYMinMax = this._d3SeriesList[i].getYMinMax();

            yMinMax[0] = Math.min(localYMinMax[0], yMinMax[0]);

            if (this._layer.renderType & RenderType.Stacked) {
                yMinMax[1] = localYMinMax[1] + yMinMax[1];
            } else {
                yMinMax[1] = Math.max(localYMinMax[1], yMinMax[1]);
            }
        }
        return yMinMax;
    }

    /** get the minimum graph height */
    public getRequiredHeight() {
        return 0;
    }

    /** get the x scaling info for this series */
    public getXScalingInfo(): IScalingInfo {
        if (this._d3SeriesList.length > 0) {
            return this._d3SeriesList[0].getXScalingInfo();
        }
        return undefined;
    }

    /** get the y scaling info for this series */
    public getYScalingInfo(): IScalingInfo {
        if (this._d3SeriesList.length > 0) {
            return this._d3SeriesList[0].getXScalingInfo();
        }
        return undefined;
    }

    /** decimate the data for the series or series group */
    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        let self = this;
        if (self._worker) {
            self._worker.terminate();
            self._worker = null;
        }

        let xScale = xAxis.getScale();
        let yScale = yAxis.getScale();
        if (this.isXContinuousSeries() && (this._layer as any).decimator) {

            let inputNames: string[] = [];
            let inputValues: IBuffer<IXYValue>[] = [];
            for (let i = 0; i < this._layer.data.length; ++i) {
                let series = (this._layer.data as IXYSeries[])[i];
                inputNames.push(series.name);
                let values: IBuffer<IXYValue>;
                if (Array.isArray(series.values)) {
                    values = new SimpleBuffer(series.values);
                } else {
                    values = series.values;
                }
                inputValues.push(values);
            }

            let decimator = (this._layer as any).decimator as IXYStackedDecimator;
            if ((self._layer.enableWebWorkers || self._d3Chart.getOptions().enableWebWorkers) &&
                InternalDecimatorMap[decimator.getKey()]) {
                return new Promise<any>(function (resolve, reject) {
                    let values: IXYValue[][] = [];
                    for (let i = 0; i < inputValues.length; ++i) {
                        values[i] = inputValues[i].getData();
                    }
                    self._worker = createDecimatorWorker(decimator, xStart, xEnd, xAxis,
                        yAxis, values, inputNames, function (output: IXYValue[][]) {
                            self._worker = null;
                            for (let dataIdx = 0; dataIdx < self._d3SeriesList.length; ++dataIdx) {
                                self._d3SeriesList[dataIdx].setOutputData(output[dataIdx]);
                            }
                            resolve();
                        }, function (error: any) {
                            self._worker = null;

                            // if stacked a custom decimator would deal with all
                            // stacked data series in a pixel at once
                            decimator.initialize(xScale, xScale.invert, yScale, inputNames);

                            let output = decimator.decimateValues(xStart, xEnd, inputValues);
                            for (let dataIdx = 0; dataIdx < self._d3SeriesList.length; ++dataIdx) {
                                self._d3SeriesList[dataIdx].setOutputData(output[dataIdx]);
                            }
                            resolve();
                        });
                });
            } else {
                return new Promise<any>(function (resolve, reject) {
                    decimator.initialize(xScale, xScale.invert, yScale, inputNames);

                    let output = decimator.decimateValues(xStart, xEnd, inputValues);
                    for (let dataIdx = 0; dataIdx < self._d3SeriesList.length; ++dataIdx) {
                        self._d3SeriesList[dataIdx].setOutputData(output[dataIdx]);
                    }
                    resolve();
                })
            }
        } else {
            let promises: Promise<any>[] = [];
            for (let i = 0; i < this._d3SeriesList.length; ++i) {
                promises.push(this._d3SeriesList[i].decimateData(xStart, xEnd, xAxis, yAxis));
            }
            return Promise.all(promises);
        }
    }

    /** fill in tooltip information  */
    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let tooltipData: ITooltipData = { source: elem, group: '', metrics: {} };
        for (let dataIdx = 0; dataIdx < this._d3SeriesList.length; ++dataIdx) {
            let seriesTooltip = this._d3SeriesList[dataIdx].getTooltipMetrics(elem, event);
            // merge tooltip for group data
            for (let i = 0; i < seriesTooltip.length; ++i) {
                for (let key in seriesTooltip[i].metrics) {
                    tooltipData.metrics[key] = seriesTooltip[i].metrics[key];
                }
            }
        }
        return [tooltipData];
    }

    /** get information for the legend to render */
    public getLegendInfo(): ILegendItem[] {
        let legendItems: ILegendItem[] = [];
        for (let dataIdx = 0; dataIdx < this._d3SeriesList.length; ++dataIdx) {
            legendItems = legendItems.concat(this._d3SeriesList[dataIdx].getLegendInfo());
        }
        return legendItems;
    }

    /** handle on select events if we want to */
    public addHover(selection: string): void {
        for (let dataIdx = 0; dataIdx < this._d3SeriesList.length; ++dataIdx) {
            this._d3SeriesList[dataIdx].addHover(selection);
        }
    }

    /** handle on deselect events if we want to */
    public removeHover(selection: string): void {
        for (let dataIdx = 0; dataIdx < this._d3SeriesList.length; ++dataIdx) {
            this._d3SeriesList[dataIdx].removeHover(selection);
        }
    }

    /** render all of the data in the series
     * @param svg the svg to draw the data in
     * @param yOffsets for each data point in this element
     */
    public render(yOffsets?: number[]): void {

        if (this._d3SeriesList.length > 0) {
            let dataLength: number = this._d3SeriesList[0].getOutputData().length();
            yOffsets = Array.apply(null, Array(dataLength)).
                map(Number.prototype.valueOf, 0);

            for (let dataIdx = 0; dataIdx < this._d3SeriesList.length; ++dataIdx) {
                (this._d3SeriesList[dataIdx] as XYSeries).render(yOffsets);
            }
        }
    }

    public getRenderedYRange() {
        let domain = [0, -Number.MAX_VALUE];
        // find the range for the data
        if (this._d3SeriesList.length > 0) {
            let pixels = this._d3SeriesList[0].getOutputData().length();

            // might be faster to sum all data first for cache reasons?
            for (let i = 0; i < pixels; ++i) {
                let totalY = 0;
                for (let j = 0; j < this._d3SeriesList.length; ++j) {
                    let xySeries = this._d3SeriesList[j];
                    totalY += xySeries.getOutputData().get(i).y;
                }
                domain[0] = Math.min(totalY, domain[0]);
                domain[1] = Math.max(totalY, domain[1]);
            }
        }
        return domain;
    }
}
D3Chart.register(XYGroupSeries);