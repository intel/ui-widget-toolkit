import {
    ICss, IEvent, EventType, UIElement, IBuffer, ITooltipData,
    ILegendItem
} from '../../../interface/ui-base';
import {
    IXYValue, ITraceValue, IXYRect
} from '../../../interface/chart/series-data';
import {
    IXYSeries, RenderType, ILayer, IXYLayer, ITraceValueLayer
} from '../../../interface/chart/chart'

import {
} from '../decimator/decimator';
import { getSelectionName, SimpleBuffer, } from '../../utilities';

import { getKeys } from '../../svg-helper';
import { PIXIHelper } from '../../pixi-helper';

import { D3Axis } from '../axis';
import { ID3Chart, D3Chart, createDecimatorWorker } from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';

import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';
import * as PIXI from 'pixi.js';

let seriesTypeName = 'chart-heat-map';

/** render all of the data in the series
 * @param svg the svg to draw the data in
 */
export class BaseHeatMap extends BaseSeries implements ICartesianSeriesPlugin {
    protected _selectionClasses: string;
    protected _classes: string;

    protected _worker: Worker;
    protected _decimator: any;
    protected _selection: any;

    protected _pixi: PIXI.Renderer;
    protected _pixiHelper: PIXIHelper;
    protected _rectTexture: PIXI.Texture;

    public getXMinMax(): number[] {
        throw 'Error please override this function';
    }

    public getYMinMax(): number[] {
        throw 'Error please override this function';
    }

    public isXContinuousSeries(): boolean {
        throw 'Error please override this function';
    }

    public isYContinuousSeries(): boolean {
        throw 'Error please override this function';
    }

    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        throw 'Error please override this function';
    }

    public setData(layer: ILayer, index = 0) {
        throw 'Error please override this function';
    }

    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        throw 'Error please override this function';
    }

    /** return the name of the series */
    public getName(): string {
        throw 'Error please override this function';
    }

    protected initializeClasses() {
        // Build list of class names to apply
        this._classes = this.getClassNames(seriesTypeName);
        this._selectionClasses = this.getSelectionClasses(seriesTypeName);
    }

    protected applyStyles(): void {
        super.applyStyles();
        if (this._layer.css) {
            let styles: { [index: string]: any } = this._layer.css.style;
            if (styles) {
                for (let i = 0; i < this._d3Elems.length; ++i) {
                    for (let key in styles) {
                        this._d3Elems[i].style(key, styles[key]);
                    }
                }
            }
        }
    }  // applyStyles

    /** get information for the legend to render */
    public getLegendInfo(): ILegendItem[] {
        return [];
    }

    /** maps a data value to a pixel value */
    protected xMap: (d: any) => number;
    protected yMap: (d: any) => number;

    protected configureTooltip(rect: any) {
        let self = this;
        function showTooltipValues(value: any): boolean {
            self._d3Chart.getTooltip().setData(`${value.y}: ${value.x} ${value.value}`, []);
            return true;
        }

        self._d3Chart.getTooltip().setTarget(rect);
        this._d3Chart.getTooltip()
            .setEnterCallback(showTooltipValues)
            .setMoveCallback(showTooltipValues);
    }

    public render(): void {
        let self = this;

        this._d3Elems = [];

        this.initializeContextMenuItems();

        // If there's already data remove it
        if (!this.isXContinuousSeries()) {
            self._d3XAxis.getScale().padding(0);
            self._d3XAxis.render();
        }

        let xScale = self._d3XAxis.getScale().copy();
        if (xScale.clamp) {
            xScale.clamp(false);
        }

        // mess with our standard axes to get the heat map look
        let yAxis = self._d3YAxis;
        if (!this.isYContinuousSeries()) {
            let yHeight = this._d3Chart.getOptions().height;
            yAxis.getScale().padding(0);
            if (yAxis.getRangePixels() < yHeight) {
                yAxis.setRangePixels(yHeight);
            }
            yAxis.render();
        }

        let yScale = yAxis.getScale().copy();
        if (yScale.clamp) {
            yScale.clamp(false);
        }

        let colors: number[] = [];
        (this._layer as any).gradient.forEach((gradient: any) => {
            colors.push(parseInt(gradient.color.substring(1), 16));
        });
        let colorScale = d3.scaleQuantize()
            .domain(d3.extent((this._layer as any).gradient, (d: any) => {
                return d.key as number;
            }))
            .range(colors);

        // these functions are generic for the lines and areas
        // and stacked stuff

        let svg = self._d3Chart.getGraphGroup();

        let classes: string = this.getClassNames(seriesTypeName);
        if (this._layer.css) {
            for (let className in this._layer.css.classes) {
                classes += className + ' ';
            }
        }

        let yStart: number;
        let yHeight = yScale.bandwidth ? yScale.bandwidth() : undefined;
        let xStart: number;
        let xWidth = xScale.bandwidth ? xScale.bandwidth() : undefined;
        let layoutRect = (value: IXYRect, rect: PIXI.Sprite) => {
            if (value.y1 === undefined) {
                yStart = yScale(value.y);
            } else {
                yStart = yScale(value.y);
                yHeight = yScale(value.y1) - yStart;
            }

            if (value.x1 === undefined) {
                xStart = xScale(value.x);
            } else {
                xStart = xScale(value.x);
                xWidth = xScale(value.x1) - xStart;
            }

            rect.x = xStart;
            rect.y = yStart;
            rect.width = xWidth;
            rect.height = yHeight;
        }
        5
        let outputData = this.getOutputData() as IBuffer<IXYRect>;
        let len = outputData.length();

        let requiresRender = true;
        let stage: PIXI.Container;
        let foreignObject: d3.Selection<any, any, any, any>;

        // in this case just reuse the existing rectangles if we have
        // the exact right number
        if (this._pixiHelper) {
            foreignObject = svg.select(this._selectionClasses);
            stage = this._pixiHelper.getStage();
            if (stage) {
                let nodes = this._pixiHelper.getStage().children;
                if (nodes.length === len) {

                    for (let i = 0; i < len; i++) {
                        let value = outputData.get(i);
                        let rect = nodes[i] as PIXI.Sprite;
                        layoutRect(value, rect);
                    }
                    requiresRender = false;
                }
            }
        }

        if (requiresRender) {
            if (!this._pixiHelper) {
                // this creates new helpers
                this._pixiHelper = new PIXIHelper(!this._d3Chart.getOptions().forceCanvasRenderer);
                this._pixi = this._pixiHelper.getRenderer();

                let rectGraphic = new PIXI.Graphics();
                rectGraphic.beginFill(0xFFFFFF);
                rectGraphic.drawRect(0, 0, 1, 1); // draw rect)
                rectGraphic.endFill();
                this._rectTexture = this._pixi.generateTexture(rectGraphic, PIXI.SCALE_MODES.LINEAR, 8);
            }

            // TODO
            // we can reuse the old nodes, add/remove more if needed and
            // just recolor/resize/relayout them.  It likely is faster but
            // not a common use case

            // this creates a new blank canvas
            foreignObject = this._pixiHelper.addPixiSvg(svg,
                classes, this._d3XAxis.getRangePixels(),
                this._d3YAxis.getRangePixels());
            foreignObject.attr('cursor', 'pointer');

            this._pixiHelper.clearSelections();

            stage = new PIXI.Container();
            let chart = self._d3Chart.getElement();

            // unbind the tooltip from the chart
            this._d3Chart.getTooltip().releaseListeners();

            for (let i = 0; i < len; i++) {
                let value = outputData.get(i);

                // cache color rectangles
                let color: number = colorScale(value.value);
                var rect = new PIXI.Sprite(this._rectTexture);
                rect.tint = color;
                rect.x = xStart;
                rect.y = yStart;
                rect.width = xWidth;
                rect.height = yHeight;


                let selection = rect; // only highlight the main rect

                // this._pixiHelper.addSelection(getSelectionName(value.x), selection);
                // this._pixiHelper.addSelection(getSelectionName(value.y), selection);

                this._pixiHelper.addInteractionHelper(selection, this._d3Chart.getOptions(),
                    this._layer.onClick, this._layer.onDoubleClick, self._contextMenuItems,
                    () => {
                        this._selection = value;
                        if (value) {
                            this._d3Chart.onHover({
                                caller: chart,
                                event: EventType.HoverStart,
                                data: value,
                                selection: getSelectionName(value.y)
                            });
                        }
                    },
                    () => {
                        if (value) {
                            this._d3Chart.onHover({
                                caller: chart,
                                event: EventType.HoverEnd,
                                data: value,
                                selection: getSelectionName(value.y)
                            });
                        }
                        this._selection = undefined;
                    }, self._d3Chart.getTooltip(), chart, value, value);

                stage.addChild(rect);

                this.configureTooltip(rect);
                layoutRect(value, rect);
            }
        }

        let width = this._d3XAxis.getRangePixels();
        let height = this._d3YAxis.getRangePixels();
        foreignObject
            .attr('width', width)
            .attr('height', height); // just for legend
        this._pixi.resize(width, height);
        this._pixiHelper.render(stage);

        self.applyStyles();
    }
}

export class XYHeatMapSeries extends BaseHeatMap implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return (layer.renderType & RenderType.HeatMap) !== 0 &&
            layer.data[0] && (layer.data[0].hasOwnProperty('values'));
    }

    protected _data: IXYSeries;
    protected _values: IBuffer<IXYValue>;
    protected _layer: IXYLayer;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        super(chart, layer, xAxis, yAxis, false, svg);

        this.setData(layer);
    }

    /** exists so grouped XY can set the data instead of assuming it's*/
    public setData(layer: ILayer, index = 0) {
        this._data = layer.data[index] as IXYSeries;
        if (Array.isArray(this._data.values)) {
            this._values = new SimpleBuffer(this._data.values);
        } else {
            this._values = this._data.values;
        }

        this.initializeClasses();
    }

    protected applyStyles(): void {
        super.applyStyles();
        if (this._data.css) {
            let styles: { [index: string]: any } = this._data.css.style;
            if (styles) {
                for (let i = 0; i < this._d3Elems.length; ++i) {
                    for (let key in styles) {
                        this._d3Elems[i].style(key, styles[key]);
                    }
                }
            }
        }
    }  // applyStyles

    protected getDecimationName() {
        return this._layer.decimator ?
            getSelectionName(this._layer.decimator.getName()) : '';
    }

    /** return the name of the series */
    public getName() {
        return this._data.name ? this._data.name : '';
    }

    public isXContinuousSeries(): boolean {
        return false;
    }

    /** check if this series is continuous */
    public isYContinuousSeries() {
        return false;
    }

    public getCss(): ICss {
        return this._data.css;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        let xMap = function (d: any): string[] {
            return [d.x];
        }

        let keys = getKeys(this._data.values as IXYValue[], xMap);
        return keys;
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        let yMap: (d: any) => any = function (d: any) {
            return [d.y];
        }

        let keys = getKeys(this._data.values as IXYValue[], yMap);
        return keys.reverse();
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
        }

        let xScale = xAxis.getScale();
        let yScale = yAxis.getScale();

        if (!self._decimator) {
            // self._decimator = new FlameChartMergeRectDecimator();
        }
        if (self._layer.enableWebWorkers || self._d3Chart.getOptions().enableWebWorkers) {
            return new Promise<any>(function (resolve, reject) {
                self._worker = createDecimatorWorker(self._decimator, xStart, xEnd, self._d3XAxis,
                    self._d3YAxis, self._values.getData(), undefined, function (decimatedData: IXYRect[]) {
                        self.setOutputData(decimatedData);
                        self._worker = null;
                        resolve();
                    }, function (error: any) {
                        self._worker = null;
                        // in this case we failed to create the worker
                        let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                            self._values);

                        self.setOutputData(decimatedData);
                        resolve();
                    });
            });
        } else {
            return new Promise<any>(function (resolve, reject) {
                // self._decimator.initialize(xScale, xScale.invert, yScale);
                // let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                //     self._values);

                let decimatedData = self._values;
                self.setOutputData(decimatedData);
                resolve();
            });
        }
    }

    /** fill in tooltip information  */
    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let tooltipData: ITooltipData = { source: elem, group: '', metrics: {} };
        return [tooltipData];
    }
}
D3Chart.register(XYHeatMapSeries);

export class TraceHeatMapSeries extends BaseHeatMap implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return (layer.renderType & RenderType.HeatMap) !== 0 &&
            layer.data[0] && (layer.data[0].hasOwnProperty('dx'));
    }

    protected _values: IBuffer<ITraceValue>;
    protected _layer: ITraceValueLayer;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        super(chart, layer, xAxis, yAxis, true, svg);

        this.setData(layer);
    }

    /** exists so grouped XY can set the data instead of assuming it's*/
    public setData(layer: ILayer, index = 0) {
        if (Array.isArray(this._layer.data)) {
            this._values = new SimpleBuffer(this._layer.data);
        } else {
            this._values = this._layer.data;
        }

        this.initializeClasses();
    }

    public getName() {
        return '';
    }

    protected getDecimationName() {
        return this._layer.decimator ?
            getSelectionName(this._layer.decimator.getName()) : '';
    }

    public isXContinuousSeries(): boolean {
        return true;
    }

    /** check if this series is continuous */
    public isYContinuousSeries() {
        return false;
    }

    public getCss(): ICss {
        return this._layer.css;
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        let yMap: (d: any) => any = function (d: any) {
            return [d.y];
        }

        let keys = getKeys(this._layer.data, yMap);
        return keys.reverse();
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        let self = this;
        let xMinMax: number[] = [];
        if (this._layer.data.length > 0) {
            xMinMax.push(this._layer.data[0].x);
            xMinMax.push(d3.max(this._layer.data,
                function (value: ITraceValue, index: number,
                    arr: ITraceValue[]): number {
                    return value.x + value.dx;
                }));
        }
        return xMinMax;
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
        }

        let xScale = xAxis.getScale();
        let yScale = yAxis.getScale();

        if (!self._decimator) {
            // self._decimator = new FlameChartMergeRectDecimator();
        }
        if (self._layer.enableWebWorkers || self._d3Chart.getOptions().enableWebWorkers) {
            return new Promise<any>(function (resolve, reject) {
                self._worker = createDecimatorWorker(self._decimator, xStart, xEnd, self._d3XAxis,
                    self._d3YAxis, self._values.getData(), undefined, function (decimatedData: IXYRect[]) {
                        self.setOutputData(decimatedData);
                        self._worker = null;
                        resolve();
                    }, function (error: any) {
                        self._worker = null;
                        // in this case we failed to create the worker
                        let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                            self._values);

                        self.setOutputData(decimatedData);
                        resolve();
                    });
            });
        } else {
            return new Promise<any>(function (resolve, reject) {
                // self._decimator.initialize(xScale, xScale.invert, yScale);
                // let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                //     self._values);

                let decimatedData = self._layer.data;
                self.setOutputData(decimatedData);
                resolve();
            });
        }
    }

    /** fill in tooltip information  */
    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let tooltipData: ITooltipData = { source: elem, group: '', metrics: {} };
        return [tooltipData];
    }
}

D3Chart.register(TraceHeatMapSeries);