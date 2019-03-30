import {
    IEvent, UIElement, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import {
    ITraceValue
} from '../../../interface/chart/series-data';
import { IScalingInfo } from '../../../interface/chart/axis';
import {
    ILayer, RenderType, ITraceValueLayer, IXYLayer
} from '../../../interface/chart/chart'
import { ITraceResidencyDecimator } from '../../../interface/chart/decimator';
import {
    InternalDecimatorMap, TraceResidencyDecimator, TraceStateDecimator
} from '../decimator/decimator';
import { SimpleBuffer } from '../../utilities';
import { D3Axis } from '../axis';
import { ID3Chart, D3Chart, createDecimatorWorker } from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';
import { XYSeries } from './xy';

import * as d3 from 'd3';

export class TraceSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return layer.data[0] && layer.data[0].hasOwnProperty('dx') &&
            (((layer.renderType & RenderType.Area) !== 0 ||
                (layer.renderType & RenderType.Line) !== 0) ||
                (layer.renderType & RenderType.Stacked) !== 0);
    }

    protected _d3Chart: ID3Chart;
    protected _layer: ITraceValueLayer;
    protected _data: ITraceValue[];
    protected _d3SeriesList: XYSeries[];
    protected _isXContinuous: boolean;
    protected _worker: Worker;
    protected _svg: any;
    protected _xAxis: D3Axis;
    protected _yAxis: D3Axis;
    protected _states: string[];
    protected _isStackedArea: boolean;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        this._d3Chart = chart;
        this._isXContinuous = true;
        this._svg = svg;
        this._xAxis = xAxis;
        this._yAxis = yAxis;
        this._d3SeriesList = [];
        this.setData(layer as ITraceValueLayer);
    }

    public setData(layer: ITraceValueLayer) {
        this._layer = layer as ITraceValueLayer;

        let stateMap: { [index: string]: boolean } = {};
        let data = (this._layer as ITraceValueLayer).data;
        for (let i = 0; i < data.length; ++i) {
            stateMap[data[i].name] = true;
        }

        this._states = Object.keys(stateMap).sort((a, b) => { return a.localeCompare(b) });

        if (this._states.length === 1 && this._states[0] === 'undefined') {
            console.warn('Warning ITraceData does not have the name property: This is used for when rendering trace data');
        }

        this._isStackedArea = (this._layer.renderType & RenderType.Area) !== 0 ||
            (this._layer.renderType & RenderType.Stacked) !== 0;

        this._d3SeriesList = [];
        if (this._isStackedArea) {
            for (let i = 0; i < this._states.length; ++i) {
                let dataLayer: IXYLayer = {
                    renderType: layer.renderType | RenderType.Area,
                    interpolateType: layer.interpolateType,
                    data: [{
                        name: this._states[i]
                    }]
                }

                let series = new XYSeries(this._d3Chart, dataLayer, this._svg, this._xAxis,
                    this._yAxis, this._isXContinuous);
                this._d3SeriesList.push(series);
            }
        } else {
            let dataLayer: IXYLayer = {
                renderType: RenderType.Line,
                interpolateType: layer.interpolateType,
                data: [{
                    name: this._d3Chart.getTitle()
                }]
            }

            let series = new XYSeries(this._d3Chart, dataLayer, this._svg, this._xAxis,
                this._yAxis, this._isXContinuous);
            this._d3SeriesList.push(series);
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
        return true;
    }

    /** check if the y is continuous series */
    public isYContinuousSeries(): boolean {
        return this._isStackedArea;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        return [];
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        return this._states;
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        let xMinMax: number[] = [Number.MAX_VALUE, -Number.MAX_VALUE];

        let data = (this._layer as ITraceValueLayer).data;
        if (data.length > 0) {
            let end = data[data.length - 1];
            xMinMax = [data[0].x, end.x + end.dx];
        }

        return xMinMax;
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        return [0, 100];
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
        let decimator: ITraceResidencyDecimator | TraceStateDecimator;

        if (this._layer['decimator']) {
            decimator = this._layer['decimator'] as ITraceResidencyDecimator;
        } else {
            if (this._isStackedArea) {
                decimator = new TraceResidencyDecimator();
            } else {
                decimator = new TraceStateDecimator();
            }
        }

        let copyData = (output: any) => {
            if (this._isStackedArea) {
                for (let dataIdx = 0; dataIdx < self._d3SeriesList.length; ++dataIdx) {
                    self._d3SeriesList[dataIdx].setOutputData(output[dataIdx]);
                }
            } else {
                self._d3SeriesList[0].setOutputData(output);
            }
        }

        if ((self._layer.enableWebWorkers || self._d3Chart.getOptions().enableWebWorkers) &&
            InternalDecimatorMap[decimator.getKey()]) {
            return new Promise<any>(function (resolve, reject) {
                self._worker = createDecimatorWorker(decimator, xStart, xEnd, xAxis,
                    yAxis, self._layer.data, self._states, function (output: any[]) {
                        self._worker = null;
                        copyData(output);
                        resolve();
                    }, function (error: any) {
                        self._worker = null;

                        // if stacked a custom decimator would deal with all
                        // stacked data series in a pixel at once
                        decimator.initialize(xScale, xScale.invert, yScale, self._states);
                        let output = decimator.decimateValues(xStart, xEnd,
                            new SimpleBuffer(self._layer.data));

                        copyData(output);
                        resolve();
                    });
            });
        } else {
            return new Promise<any>(function (resolve, reject) {
                decimator.initialize(xScale, xScale.invert, yScale, self._states);
                let output = decimator.decimateValues(xStart, xEnd,
                    new SimpleBuffer(self._layer.data));

                copyData(output);
                resolve();
            })
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
            let dataLength: number = 0;
            this._d3SeriesList.forEach((data) => {
                dataLength = Math.max(dataLength, data.getOutputData().length());
            })

            yOffsets = Array.apply(null, Array(dataLength)).
                map(Number.prototype.valueOf, 0);

            for (let dataIdx = 0; dataIdx < this._d3SeriesList.length; ++dataIdx) {
                (this._d3SeriesList[dataIdx] as XYSeries).render(yOffsets);
            }
        }
    }
}

D3Chart.register(TraceSeries)