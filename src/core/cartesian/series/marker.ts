import {
    ICss, IEvent, EventType, UIElement, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import { ITraceValue } from '../../../interface/chart/series-data';
import { ILayer, IMarkerLayer, RenderType } from '../../../interface/chart/chart'

import { SimpleMarkerDecimator } from '../decimator/decimator';
import { getSelectionName, SimpleBuffer } from '../../utilities';

import {
    ID3Chart, D3Chart, D3Axis, createDecimatorWorker
} from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';
import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';

export class MarkerSeries extends BaseSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return (layer.renderType & RenderType.Marker) !== 0;
    }

    protected _data: ITraceValue[];
    protected _decimator: any;
    protected _layer: IMarkerLayer;
    protected _worker: Worker;

    protected getDataKey: (d: any) => number | string;
    protected getDataName: (d: any) => string;
    protected getDataStart: (d: any) => number;
    protected getDataDuration: (d: any) => number;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>, xAxis: D3Axis) {
        super(chart, layer, xAxis, undefined, true, svg);

        let self = this;

        this.setData(layer);

        self.getDataKey = function (d: any): string {
            return d.key;
        }
        self.getDataName = function (d: any): string {
            if (d && d.name) {
                return d.name;
            }
            return self.getDataKey(d).toString();
        }
        self.getDataStart = function (d: any): number {
            return d.x;
        }
        self.getDataDuration = function (d: any): number {
            return d.dx ? d.dx : 0;
        }
    }

    public setData(layer: ILayer) {
        this._data = layer.data as ITraceValue[];
    }

    protected getDecimationName() {
        return this._layer.decimator ?
            getSelectionName(this._layer.decimator.getName()) : '';
    }

    public isYContinuousSeries() {
        return false;
    }

    public getCss(): ICss {
        return undefined;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        return [];
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        return [];
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        let self = this;
        let xMinMax: number[] = [];
        if (this._data.length > 0) {
            xMinMax.push(self.getDataStart(this._data[0]));
            xMinMax.push(d3.max(this._data,
                function (value: ITraceValue, index: number,
                    arr: ITraceValue[]): number {
                    return self.getDataStart(value) + self.getDataDuration(value);
                }));
        }
        return xMinMax;
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        return [];
    }

    /** decimate the data for the series or series group
     * @param xAxis representation of x-axis
     * @param yAxis representation of y-axis
     */
    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        let self = this;
        if (self._worker) {
            self._worker.terminate();
            self._worker = null;
        }

        if (self._layer.decimator) {
            self._decimator = self._layer.decimator;
        } else {
            self._decimator = new SimpleMarkerDecimator(); ''
        }

        let xScale = xAxis.getScale();
        let yScale = yAxis.getScale();

        // get just the visible rects first
        if ((self._layer.enableWebWorkers || self._d3Chart.getOptions().enableWebWorkers) &&
            !self._decimator) {
            return new Promise<any>(function (resolve, reject) {
                self._worker = createDecimatorWorker(self._decimator, xStart, xEnd, self._d3XAxis,
                    self._d3YAxis, self._data, undefined, function (decimatedData: ITraceValue[]) {
                        self.setOutputData(decimatedData);
                        self._worker = null;
                        resolve();
                    }, function (error: any) {
                        self._worker = null;
                        // in this case we failed to create the worker
                        self._decimator.initialize(xScale, xScale.invert, yScale);
                        let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                            new SimpleBuffer(self._data));

                        self.setOutputData(decimatedData);
                        resolve();
                    });
            });
        } else {
            return new Promise<any>(function (resolve, reject) {
                self._decimator.initialize(xScale, xScale.invert, yScale);
                let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                    new SimpleBuffer(self._data));

                self.setOutputData(decimatedData);
                resolve();
            });
            // }
        }
    }

    /** get information for the legend to render */
    public getLegendInfo(): ILegendItem[] {
        return []
    }

    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let ret: any[] = [];

        if (this._selection) {
            let metrics: { [index: string]: number } = {};
            metrics[this.getDataName(this._selection)] = this.getDataDuration(this._selection);
            ret.push({ source: elem, group: '', metrics: metrics });
        }

        let tooltipData: ITooltipData = { source: elem, group: 'Stack', metrics: {} };

        for (let i = 0; i < this._data.length; ++i) {
            let traceVal = this._data[i];
            let start = this.getDataStart(traceVal);
            if (event.xEnd > start) {
                if (event.xEnd <= start + this.getDataDuration(traceVal)) {
                    tooltipData.metrics[this.getDataName(traceVal)] = '';
                }
            } else {
                break;
            }
        }
        ret.push(tooltipData);
        return ret;
    }

    private _selection: ITraceValue;
    private configureHover(elem: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        value?: ITraceValue) {
        let self = this;
        elem
            .on('mouseenter', function () {
                self._selection = value;
                if (value) {
                    self._d3Chart.onHover({
                        event: EventType.HoverStart,
                        selection: getSelectionName(self.getDataName(value))
                    });
                }
            })
            .on('mouseleave', function () {
                if (value) {
                    self._d3Chart.onHover({
                        event: EventType.HoverEnd,
                        selection: getSelectionName(self.getDataName(value))
                    });
                }
                self._selection = undefined;
            });
        self.configureItemInteraction(elem, value);
    }

    public render(): void {
        let self = this;

        // If there's already data remove it
        let xScale = self._d3XAxis.getScale();

        // Build list of class names to apply
        let classes: string = this.getClassNames('chart-marker');
        if (this._layer.css) {
            for (let className in this._layer.css.classes) {
                classes += className + ' ';
            }
        }

        let markerSeries = self._d3svg.selectAll(this.getSelectionClasses('chart-marker'));
        markerSeries.remove();

        let outputData = this.getOutputData();
        let len = outputData.length();
        for (let i = 0; i < len; i++) {
            let value = outputData.get(i);

            let xStart = xScale(self.getDataStart(value));
            let yStart = 0;
            let marker = self._d3svg
                .append('svg:image')
                .attr('xlink:href', self._layer.image)
                .attr('class', classes)
                .classed(self.getDataKey(value).toString(), true)
                .classed(self.getDataName(value), true)
                .attr('x', xStart)
                .attr('y', yStart);

            this.configureHover(marker, value);
        }

        this.applyStyles();
    }
}
D3Chart.register(MarkerSeries);