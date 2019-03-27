import {
    ICss, IEvent, EventType, UIElement, IBuffer, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import {
    IFlameChartValue, IMinMaxValue, ITraceValue
} from '../../../interface/chart/series-data';
import {
    ILayer, ITraceValueLayer, RenderType, ICartesianChart
} from '../../../interface/chart/chart'
import { IFlameChartDecimator } from '../../../interface/chart/decimator'
import { FlameChartMergeRectDecimator } from '../decimator/decimator';
import { bisectBuffer, getSelectionName, SimpleBuffer } from '../../utilities';

import { PIXIHelper } from '../../pixi-helper';

import { ColorManager } from '../../color-manager';
import { SelectionHelper } from '../../selection';

import { D3Axis } from '../axis';
import { ID3Chart, D3Chart, createDecimatorWorker } from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';

import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';
import * as PIXI from 'pixi.js';

let seriesTypeName = 'chart-flame';

export class FlameChartSeries extends BaseSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return layer.renderType === RenderType.FlameChart;
    }

    protected _data: ITraceValue[];
    protected _backgroundData: IMinMaxValue[];
    protected _decimator: IFlameChartDecimator;
    protected _layer: ITraceValueLayer;
    protected _worker: Worker;

    protected _pixi: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    protected _pixiHelper: PIXIHelper;

    // store data by stack level for faster searching
    protected _allRects: IFlameChartValue[][] = [];

    protected getDataKey: (d: any) => number | string;
    protected getDataName: (d: any) => string;
    protected getDataStart: (d: any) => number;
    protected getDataDuration: (d: any) => number;

    protected _minHeight = 0;
    protected _stackHeight = 20;

    /**
     * used to generate a list of all rects that could be drawn
     */
    private generateRects(values: IBuffer<ITraceValue>): IFlameChartValue[][] {
        let rects = []
        let stack: ITraceValue[] = []; // used to represent the current stack state
        let len = values.length();

        // compute rects
        let assertStart = -Number.MAX_VALUE;
        for (let i = 0; i < len; i++) {
            let value = values.get(i);
            value.x = Number(value.x);
            let parent = stack[stack.length - 1];

            // pop stuff off the stack
            while (stack.length && Number(value.x) >= parent.x + parent.dx) {
                --stack.length;
                parent = stack[stack.length - 1];
            }

            let rect: IFlameChartValue = {
                traceValue: value,
                depth: stack.length
            }

            stack.push(value);
            if (rect.depth >= rects.length) {
                rects[rect.depth] = [];
            }
            rects[rect.depth].push(rect);

            console.assert(assertStart <= value.x,
                'Error flame chart start times are not sorted: ' + assertStart + ' and ' +
                value.x);
            assertStart = value.x;
        }
        return rects;
    }

    private getVisibleRects(xStart: number, xEnd: number,
        allRects: IFlameChartValue[][]): IFlameChartValue[] {

        let visibleRects: IFlameChartValue[] = [];
        if (!xStart || !xEnd) {
            this._allRects.forEach((stackData) => {
                visibleRects = visibleRects.concat(stackData);
            });
        } else {
            // assume rects are sorted in each stack level
            let findFirstInsertionIdx: (buffer: IBuffer<IFlameChartValue>, x: number) => number =
                bisectBuffer(function (val: IFlameChartValue) { return val.traceValue.x }).left;
            let findLastInsertionIdx: (buffer: IBuffer<IFlameChartValue>, x: number) => number =
                bisectBuffer(function (val: IFlameChartValue) { return val.traceValue.x }).right;

            allRects.forEach((stackData) => {
                let simpleBuffer = new SimpleBuffer(stackData);
                let startIdx = findFirstInsertionIdx(simpleBuffer, xStart);
                let endIdx = findLastInsertionIdx(simpleBuffer, xEnd);

                if (startIdx > 0) {
                    --startIdx;
                }
                let startValue = stackData[startIdx].traceValue;
                if (startValue.x + startValue.dx < xStart) {
                    ++startIdx;
                }

                if (startIdx < endIdx) {
                    visibleRects = visibleRects.concat(stackData.slice(startIdx, endIdx));
                }
            })
        }

        visibleRects.sort((a: IFlameChartValue, b: IFlameChartValue) => {
            return a.traceValue.x - b.traceValue.x;
        });
        return visibleRects;
    }

    private generateBackground(xScale: (value: any) => number, rects: IFlameChartValue[]): any {
        let background: any[] = [];

        let stack: IFlameChartValue[] = []; // used to represent the current stack state
        let currCoord = 0;
        for (let i = 0; i < rects.length; i++) {
            let value = rects[i]
            let parent = stack[stack.length - 1];

            // pop stuff off the stack
            while (stack.length && value.traceValue.x >= parent.traceValue.x + parent.traceValue.dx) {
                --stack.length;
                let parentEnd = parent.traceValue.x + parent.traceValue.dx;
                let coord = xScale(parentEnd);
                if (coord !== currCoord) {
                    background.push({
                        x: parentEnd,
                        min: 0,
                        max: stack.length
                    });
                    currCoord = coord;
                } else {
                    let back = background[background.length - 1];
                    if (stack.length > back.max) {
                        back.max = stack.length;
                    }
                }
                parent = stack[stack.length - 1];
            }

            stack.push(value);

            let coord = xScale(value.traceValue.x);
            let back = background[background.length - 1];
            if (coord !== currCoord || back === undefined) {
                background.push({
                    x: value.traceValue.x,
                    min: 0,
                    max: stack.length
                });
                currCoord = coord;
            } else {
                if (stack.length > back.max) {
                    back.max = stack.length;
                }
            }
        }

        // clear anything left on the stack
        let parentValue = stack[stack.length - 1];

        // pop stuff off the stack
        while (stack.length) {
            --stack.length;
            let parentEnd = parentValue.traceValue.x + parentValue.traceValue.dx;
            let coord = xScale(parentEnd);
            if (coord !== currCoord) {
                background.push({
                    x: parentEnd,
                    min: 0,
                    max: stack.length
                });
                currCoord = coord;
            } else {
                let back = background[background.length - 1];
                if (stack.length > back.max) {
                    back.max = stack.length;
                }
            }
            parentValue = stack[stack.length - 1];
        }
        return background;
    }

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>, xAxis: D3Axis,
        yAxis: D3Axis, isXContinuous: boolean) {
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
            return d.dx;
        }

        let classes = self.getClassNames(seriesTypeName);
        self._d3svg.append('path')
            .classed(classes, true)
            .classed('background', true)
            .attr('fill', 'black')
            .attr('opacity', 0.2)
            .attr('stroke', 'black');

        self._d3svg.append('g')
            .attr('class', classes)
            .classed('segments', true);

        self._d3svg.append('g')
            .attr('class', classes)
            .classed('labels', true);

        // bind the appropriate renderer
        if (chart.getOptions().forceSvgRenderer) {
            self.render = D3SVGFlameChart.prototype.render.bind(this);
        } else {
            self.render = D3PIXIFlameChart.prototype.render.bind(this);
            self.addHover = D3PIXIFlameChart.prototype.addHover.bind(this);
            self.removeHover = D3PIXIFlameChart.prototype.removeHover.bind(this);
        }
    }

    public setData(layer: ILayer) {
        if (layer.data != this._data) {
            this._data = layer.data as ITraceValue[];
            this._allRects = this.generateRects(new SimpleBuffer(this._data));
        }
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
            self._decimator = self._layer.decimator as IFlameChartDecimator;
        }

        let xScale = xAxis.getScale();
        let yScale = yAxis.getScale();

        // get just the visible rects first
        let visibleRects = self.getVisibleRects(xStart, xEnd, self._allRects);
        if (self._layer.enableBackground) {
            self._backgroundData = self.generateBackground(xScale, visibleRects);
        }

        if (!self._decimator) {
            self._decimator = new FlameChartMergeRectDecimator();
        }
        if (self._layer.enableWebWorkers || self._d3Chart.getOptions().enableWebWorkers) {
            return new Promise<any>(function (resolve, reject) {
                self._worker = createDecimatorWorker(self._decimator, xStart, xEnd, self._d3XAxis,
                    self._d3YAxis, visibleRects, undefined, function (decimatedData: IFlameChartValue[]) {
                        self.setOutputData(decimatedData);
                        self._worker = null;
                        resolve();
                    }, function (error: any) {
                        self._worker = null;
                        // in this case we failed to create the worker
                        let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                            new SimpleBuffer(visibleRects));

                        self.setOutputData(decimatedData);
                        resolve();
                    });
            });
        } else {
            return new Promise<any>(function (resolve, reject) {
                self._decimator.initialize(xScale, xScale.invert, yScale);
                let decimatedData = self._decimator.decimateValues(xStart, xEnd,
                    new SimpleBuffer(visibleRects));

                self.setOutputData(decimatedData);
                resolve();
            });
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

        if (this._allRects.length > 1) {
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
        }
        return ret;
    }

    /** get the minimum graph height */
    public getRequiredHeight() {
        if (this._minHeight) {
            return this._minHeight;
        }
        let len = this._data.length;
        let stack = [];
        let maxDepth = 1;
        for (let i = 0; i < len; i++) {
            let value = this._data[i];
            let parent = stack[stack.length - 1];

            // pop stuff off the stack
            while (stack.length && this.getDataStart(value) >=
                this.getDataStart(parent) + this.getDataDuration(parent)) {
                --stack.length;
                parent = stack[stack.length - 1];
            }

            stack.push(value);
            maxDepth = Math.max(maxDepth, stack.length);
        }
        this._minHeight = maxDepth * this._stackHeight;
        return this._minHeight;
    }

    protected _selection: ITraceValue;
    protected configureHover(elem: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        value?: IFlameChartValue) {
        let self = this;
        if (!self._layer.disableHover) {
            elem
                .on('mouseenter', function () {
                    self._selection = value.traceValue;
                    if (value) {
                        self._d3Chart.onHover({
                            event: EventType.HoverStart,
                            selection: getSelectionName(self.getDataName(value.traceValue))
                        });
                    }
                })
                .on('mouseleave', function () {
                    if (value) {
                        self._d3Chart.onHover({
                            event: EventType.HoverEnd,
                            selection: getSelectionName(self.getDataName(value.traceValue))
                        });
                    }
                    self._selection = undefined;
                });
        }
        this._d3Elems.push(elem);
        self.configureItemInteraction(elem, value.decimatedValues);
    }

    protected getSegmentClasses(d: any) {
        let key = getSelectionName(this.getDataKey(d).toString());
        let name = getSelectionName(this.getDataName(d));

        if (key === name) {
            return key;
        }
        return key + ' ' + name;
    }

    protected renderBackground(): void {
        let self = this;

        // If there's already data remove it
        let xScale = self._d3XAxis.getScale();

        // Construct the D3 area for the graph
        let backgroundFunc = d3.area<IMinMaxValue>()
            .curve(d3.curveStepAfter)
            .x(function (d: IMinMaxValue) { return xScale(d.x); })
            .y0(function (d: IMinMaxValue) {
                return 0;
            })
            .y1(function (d: IMinMaxValue) {
                return d.max * self._stackHeight;
            });

        if (this._backgroundData) {
            let background = self._d3svg.select(this.getSelectionClasses(seriesTypeName) + '.background')
                .attr('d', backgroundFunc(this._backgroundData));

            this.configureItemInteraction(background);
        }
    }

    public render() { }
}

class D3SVGFlameChart extends FlameChartSeries {
    public render(): void {
        let self = this;
        this.renderBackground();

        let xScale = self._d3XAxis.getScale();

        // Build list of class names to apply
        let classes: string = this.getClassNames(seriesTypeName);
        if (this._layer.css) {
            for (let className in this._layer.css.classes) {
                classes += className + ' ';
            }
        }

        let segmentGroup = self._d3svg.select('.segments');
        segmentGroup.selectAll('*').remove();

        let labelGroup = self._d3svg.select('.labels');
        labelGroup.selectAll('*').remove();

        let outputData = this.getOutputData();
        let len = outputData.length();
        for (let i = 0; i < len; i++) {
            let decimatedValue = outputData.get(i);
            let value = decimatedValue.traceValue;
            let key = self.getDataKey(value).toString();
            let name = self.getDataName(value);

            let yStart = decimatedValue.depth * this._stackHeight;
            let xStart = xScale(self.getDataStart(value));
            let xEnd = xScale(self.getDataStart(value) + self.getDataDuration(value));
            let xWidth = xEnd - xStart;

            let segment = segmentGroup
                .append('rect')
                .attr('class', classes)
                .classed(self.getSegmentClasses(value), true)
                .attr('fill', self._d3Chart.getRenderer().getColorManager().
                    getColor(name))
                // .attr('stroke', 'black')
                // .attr('stroke-opacity', 0.5)
                .attr('x', xStart)
                .attr('width', xWidth)
                .attr('y', yStart)
                .attr('height', this._stackHeight);

            this.configureHover(segment, decimatedValue);

            if (xWidth > 50) {
                let labelBox = labelGroup.append('svg')
                    .attr('x', xStart)
                    .attr('width', xWidth)
                    .attr('y', yStart)
                    .attr('height', this._stackHeight);

                this.configureHover(labelBox, decimatedValue);

                labelBox.append('text')
                    .text(name)
                    .attr('fill', 'black')
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'central')
                    .attr('x', xWidth / 2)
                    .attr('y', this._stackHeight / 2);
            }
        }

        this.applyStyles();
    }
}

class D3PIXIFlameChart extends FlameChartSeries {
    protected _textMap: any;

    public addHover(selection: string) {
        if (selection) {
            let items = this._pixiHelper.getSelection(selection);
            if (items) {
                items.forEach(function (elem: any) {
                    elem._prevTint = elem.tint;
                    if (elem.tint) {
                        elem.tint = ColorManager.RgbToInt(
                            SelectionHelper.getHoverColor(
                                ColorManager.IntToHex(elem.tint)
                            ));
                    }
                    elem.alpha = 0x88;
                });
            }
            this._pixiHelper.render();
        }
    }

    public removeHover(selection: string) {
        let items = this._pixiHelper.getSelection(selection);
        if (items) {
            items.forEach(function (elem: any) {
                elem.tint = elem._prevTint;
                elem.alpha = 0xFF;
            });
        }
        this._pixiHelper.render();
    }

    public render(): void {
        if (!this._textMap) {
            this._textMap = {}
        }
        this.renderBackground();

        let segmentGroup = this._d3svg.select('.segments');
        segmentGroup.selectAll('*').remove();

        let labelGroup = this._d3svg.select('.labels');
        labelGroup.selectAll('*').remove();

        let classes: string = this.getClassNames(seriesTypeName);
        if (this._layer.css) {
            for (let className in this._layer.css.classes) {
                classes += className + ' ';
            }
        }

        if (!this._pixiHelper) {
            this._pixiHelper = new PIXIHelper(!this._d3Chart.getOptions().forceCanvasRenderer);
            this._pixi = this._pixiHelper.getRenderer();
        }

        this._pixiHelper.addPixiSvg(segmentGroup,
            classes, this._d3XAxis.getRangePixels(),
            this.getRequiredHeight());

        this._pixiHelper.clearSelections();

        let xScale = this._d3XAxis.getScale();
        let stage = new PIXI.Container();

        // create a dummy background rect for brush catching purposes
        let xStart = 0;
        let xEnd = xScale(Number.MAX_VALUE);
        let background = this._pixiHelper.createRectangleContainer(xStart, 0,
            xEnd, this._stackHeight, 0);
        background.alpha = 0;
        this.configureItemInteractionPIXI(background, undefined);
        stage.addChild(background);

        let outputData = this.getOutputData();
        let len = outputData.length();
        let chart = this._d3Chart.getElement() as ICartesianChart;
        for (let i = 0; i < len; i++) {
            let decimatedValue = outputData.get(i);
            let value = decimatedValue.traceValue;
            let key = this.getDataKey(value).toString()
            let name = this.getDataName(value);

            let yStart = decimatedValue.depth * this._stackHeight;
            let xStart = xScale(this.getDataStart(value));
            let xEnd = xScale(this.getDataStart(value) + this.getDataDuration(value));
            let xWidth = xEnd - xStart;

            let rect = this._pixiHelper.createRectangleContainer(xStart, yStart,
                xWidth, this._stackHeight,
                parseInt(this._d3Chart.getRenderer().getColorManager().
                    getColor(name).substring(1), 16));

            let selection = rect.children[0]; // only highlight the main rect

            this._pixiHelper.addSelection(getSelectionName(name), selection);
            this._pixiHelper.addSelection(getSelectionName(key), selection);

            // note click is handled by the configureItemInteractionPIXI call after this
            this._pixiHelper.addInteractionHelper(selection, undefined,
                undefined, undefined,
                this._layer.disableHover ? undefined : () => {
                    this._selection = value;
                    if (value) {
                        this._d3Chart.onHover({
                            event: EventType.HoverStart,
                            selection: getSelectionName(name)
                        });
                    }
                },
                this._layer.disableHover ? undefined : () => {
                    if (value) {
                        this._d3Chart.onHover({
                            event: EventType.HoverEnd,
                            selection: getSelectionName(name)
                        });
                    }
                    this._selection = undefined;
                }, undefined, chart, decimatedValue.decimatedValues);

            // this is flame chart specific handling for brush
            this.configureItemInteractionPIXI(selection, decimatedValue.decimatedValues);

            let text: PIXI.Text = this._textMap[name];
            if (!text) {
                text = this._pixiHelper.renderText(name, labelGroup);
                this._textMap[name] = text;
            }

            let textWidth = text.width;
            if (textWidth < rect.width) {
                let tSprite = new PIXI.Sprite(this._pixi.generateTexture(text));
                tSprite.x = (rect.width - text.width) * .5;
                tSprite.y = this._stackHeight * .5 - text.height * .5;
                rect.addChild(tSprite);
            }
            stage.addChild(rect);
        }
        this._pixi.resize(this._d3XAxis.getRangePixels(),
            this.getRequiredHeight());
        this._pixiHelper.render(stage);
    }
}

D3Chart.register(FlameChartSeries);