import {
    IEvent, IOptions, Alignment, EventType, Rect, UIElement, IContextMenuItem,
    ITooltipData, UIRenderer, UIType, ILegend, ILegendItem
} from '../../interface/ui-base';

import {
    IAxis, IScalingInfo, AxisType, RenderType, ILayer, IScalar, ICartesianChart,
    IChart, IRenderedAxis
} from '../../interface/chart/chart';
import { copy, getSelectionName } from '../utilities';
import {
    Brush, SVGRenderer, D3Legend, mergeKeys, Spinner
} from '../svg-helper';
import { D3Renderer } from '../renderer';

import { addCallbacks, ElementManager } from '../element-manager';
import { showContextMenu } from '../context-menu';
import { OneLineTooltip, CustomDivTooltip } from '../tooltip';

import { ICartesianSeriesPlugin } from '../../interface/chart/series';

import * as d3 from 'd3';

export let MAX_DISCRETE_WIDTH = 50;

// type D3Series = D3XYSeries | D3RectSeries | D3VerticalBarSeries | D3MinMaxSeries |
//     D3FlameChartSeries | D3MarkerSeries | D3FunctionSeries | D3XYGroupSeries;

export function getBoundedPixelValue(value: number, maxPixels: number) {
    return Math.floor(Math.min(Math.max(value, 0), maxPixels));
}

// Interface for scaling information. This will be set/get by
// IChartDataSource.ScalingInfo() to allow us to normalize all
// series in a chart/swimlane
export class ScalingInfo implements IScalingInfo {
    public baseScale: IScalar;
    public scalars: IScalar[];

    constructor(scalar: number = 1, units: string = '', maxRange: number = Number.MAX_VALUE) {
        this.baseScale = { maxRange: Number.MAX_VALUE, scalar: scalar, units: units };
        this.scalars = [];
    }

    /**
     * Get the unit string
     *
     * @return - the unit string
     */
    public getBaseUnit(): string {
        return this.baseScale.units;
    }

    /**
     * Get the base scalar
     *
     * @return - the base scalar
     */
    public getBaseScalar(): number {
        return this.baseScale.scalar;
    }

    /**
     * add a new range
     */
    public addScalar(scalar: IScalar) {
        this.scalars.push(scalar);
    }

    /**
     * Get the scalar list
     *
     * @return - the scalar list
     */
    public getScalars(): IScalar[] {
        return this.scalars;
    }
}

function getScalar(info: IScalingInfo, range: number): IScalar {
    if (!info) {
        return { scalar: 1, units: '', maxRange: 0 };
    }

    // there are ways to optimize this if we want, but probably don't need to yet
    // put the scales in a list and sort them by max range
    let scalars = [info.baseScale];
    if (info.scalars) {
        for (let i = 0; i < info.scalars.length; ++i) {
            scalars.push(info.scalars[i]);
        }
    }

    // sort descending by max range
    scalars.sort(function (a: IScalar, b: IScalar) {
        return b.maxRange - a.maxRange;
    });

    // find the scalar that applies and return it
    let i: number;
    for (i = 0; i < scalars.length; ++i) {
        if (scalars[i].maxRange < range) {
            break;
        }
    }

    return scalars[i - 1];
}

/**
 * Chart
 *
 * This class helps the user define a proper chart to pass to the renderer.
 */
export class Chart {
    /**
     * Help make sure the chart is set up correctly.
     * This should be called before rendering the chart.
     *
     * This will try to create axes and associate data with them when needed.
     */
    public static finalize(chart: ICartesianChart): boolean {
        addCallbacks(chart);

        // find the default X-Axis
        if (!chart.axes) {
            chart.axes = [];
        }

        let defaultXAxisIdx: number;
        for (let i = 0; i < chart.axes.length; ++i) {
            if (chart.axes[i].alignment === Alignment.Bottom ||
                chart.axes[i].alignment === Alignment.Top) {
                defaultXAxisIdx = i;
                break;
            }
        }
        if (defaultXAxisIdx === undefined) {
            let defaultXAxis = {
                axisDesc: {
                    scaleType: AxisType.Linear,
                    label: 'Values1',
                    scalingInfo: new ScalingInfo(1, '')
                },
                alignment: Alignment.Bottom
            }

            defaultXAxisIdx = chart.axes.length;
            chart.axes.push(defaultXAxis);
        }

        // find the default Y-Axis
        let defaultYAxisIdx: number;
        for (let i = 0; i < chart.axes.length; ++i) {
            if (chart.axes[i].alignment === Alignment.Left ||
                chart.axes[i].alignment === Alignment.Right) {
                defaultYAxisIdx = i;
                break;
            }
        }
        if (defaultYAxisIdx === undefined) {
            let defaultYAxis = {
                axisDesc: {
                    scaleType: AxisType.Linear,
                    label: '',
                    scalingInfo: new ScalingInfo(1, '')
                },
                alignment: Alignment.Left
            }

            defaultYAxisIdx = chart.axes.length;
            chart.axes.push(defaultYAxis);
        }

        let seriesList = chart.dataSets;
        for (let j = 0; j < seriesList.length; ++j) {
            let series = seriesList[j];
            if (!series.xAxisIdx || series.xAxisIdx === -1) {
                series.xAxisIdx = defaultXAxisIdx;
            }
            if (!series.yAxisIdx || series.yAxisIdx === -1) {
                series.yAxisIdx = defaultYAxisIdx;
            }
        }

        return true;
    }

    public static mergeCharts(category: string, title: string, chart1: ICartesianChart,
        chart2: ICartesianChart): ICartesianChart {
        if (chart1.isXContinuous !== chart2.isXContinuous) {
            throw 'Merge chart error - charts mix ordinal and continuous axes';
        }

        let ret: ICartesianChart = {
            type: UIType.Cartesian,
            category: category,
            title: title,
            dataSets: chart1.dataSets.concat(chart2.dataSets),
            axes: chart1.axes,
            isXContinuous: chart1.isXContinuous
        }

        Chart.finalize(ret);
        return ret;
    }
}

/** a helper class to render a group of charts together */
export class ChartGroup {
    static handleChartUpdate(charts: ICartesianChart[], chartOptions: IOptions[],
        stateObj: any, legends?: ILegend[]) {

        if (charts) {
            let legendsTop: ILegend[] = [];
            let legendsBottom: ILegend[] = [];
            if (legends) {
                for (let i = 0; i < legends.length; ++i) {
                    let legend = legends[i];
                    if (legend.alignment === Alignment.Top) {
                        legendsTop.push(legend);
                    } else if (legend.alignment === Alignment.Bottom) {
                        legendsBottom.push(legend);
                    }
                }
            }

            if (!stateObj.elemManager) {
                stateObj.elemManager = new ElementManager();
            }

            chartOptions.length = 0;
            for (let i = 0; i < charts.length; ++i) {
                let chart = charts[i];
                Chart.finalize(chart);
                for (let j = 0; j < chart.axes.length; ++j) {
                    if (chart.axes[j].alignment === Alignment.Bottom) {
                        if (i !== charts.length - 1) {
                            chart.axes[j].hidden = true;
                        } else {
                            chart.axes[j].hidden = false;
                        }
                    }
                }

                if (chart.legends) {
                    for (let j = 0; j < chart.legends.length; ++j) {
                        let chartLegend = chart.legends[j];
                        if (chartLegend.alignment === Alignment.Top ||
                            chartLegend.alignment === Alignment.Bottom) {
                            chart.legends.splice(j, 1);
                        }
                    }
                }

                chartOptions[i] = stateObj.sharedOptions;
                if (!chart.manager) {
                    stateObj.elemManager.addElement(chart, undefined, 'default', 'default');
                }
            }

            if (charts.length > 0) {
                let endIdx = charts.length - 1;
                chartOptions[endIdx] = stateObj.bottomOptions;

                // put top/bottom legends in the right place
                if (legendsTop.length > 0) {
                    if (!charts[0].legends) {
                        charts[0].legends = [];
                    }
                    charts[0].legends = charts[0].legends.concat(legendsTop);
                }
                if (legendsBottom.length > 0) {
                    if (!charts[endIdx].legends) {
                        charts[endIdx].legends = [];
                    }
                    charts[endIdx].legends = charts[endIdx].legends.concat(legendsBottom);
                }
            }
        }
    }

    static handleRenderOptionsUpdate(stateObj: any, baseOptions: IOptions,
        chartOptions: IOptions[]) {

        stateObj.sharedOptions = copy(baseOptions);
        stateObj.sharedOptions.topMargin = 1;
        stateObj.sharedOptions.bottomMargin = 1;
        stateObj.sharedOptions.disableAutoResizeWidth = true;

        stateObj.bottomOptions = copy(baseOptions);
        stateObj.bottomOptions.topMargin = 1;
        stateObj.bottomOptions.bottomMargin = 15;
        stateObj.bottomOptions.disableAutoResizeWidth = true;

        if (chartOptions && chartOptions.length !== 0) {
            let lastIdx = chartOptions.length - 1;
            for (let i = 0; i < lastIdx; ++i) {
                chartOptions[i] = stateObj.sharedOptions;
            }
            chartOptions[lastIdx] = stateObj.bottomOptions;
        }
    }

    static handleRemoveChart(chart: IChart) {
        if (chart.renderer) {
            chart.renderer.destroy(chart);
        }
        if (chart.manager) {
            chart.manager.removeElement(chart);
        }
    }
}

export interface ID3Chart {
    getTitle(): string;
    getOptions(): IOptions;
    getElement(): UIElement;
    getRenderer(): UIRenderer;
    getTooltip(): CustomDivTooltip;
    getContextMenuItems(): IContextMenuItem[];
    getGraphGroup(): any;
    getAnimateDuration(): number;

    onHover: (event: IEvent) => boolean;
    cursorEnter: () => boolean;
    cursorMove: () => boolean;
    cursorExit: () => boolean;
}

/**
 * Provides basic functionality (getters & setters) for an axis. This
 * class should not be used directly Classes should be derived from this one
 * to implement different types of axes.
 */
export class D3Axis implements IRenderedAxis {
    /** set the domain for this d3axis instance */
    private _domain: any[][];

    /** set the domain for this d3axis instance */
    private _keysPerDomain: number;

    /** whether this is a banded or continuous axis */
    private _isBanded: boolean;

    /** the graph width of this axis */
    private _axisPixels: number;

    /** The outer d3 axis that object that handles data manipulation */
    private _d3axes: (d3.Axis<number | { valueOf(): number } | string>)[];

    private _nestedAxes: d3.Selection<d3.BaseType, {}, d3.BaseType, any>[];

    /** the d3svg */
    private _d3svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** the d3svg */
    private _axisSVG: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** the d3svg */
    private _axisLabel: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** The axis as defined by the user */
    private _axis: IAxis;

    /** the rect for the positioning the axis */
    private _position: Rect;

    /** the rendered rect for the axis */
    private _renderedRect: Rect;

    protected cache = {
        pixels: -1,
        domain: new Array()
    }

    protected _formatter: (d: any) => string;

    /**
     * Create an axis
     *
     * @param renderAxis - the axis definition from the user
     */
    constructor(svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        renderAxis: IAxis, rect: Rect) {

        this._axis = renderAxis;
        this._position = rect;
        this._keysPerDomain = 1;
        this._axisPixels = 0;
        this._position = new Rect(0, 0, 0, 0);

        if (this._axis.axisDesc.scaleType === AxisType.Ordinal ||
            (this._axis.axisDesc.keys && this._axis.axisDesc.keys.length > 0)) {
            this._domain = [this._axis.axisDesc.keys];
            this._isBanded = true;
        } else {
            let range = renderAxis.axisDesc.range;
            if (!range || range.min === undefined) {
                this._domain = [];
            } else if (range) {
                this._domain = [[range.min, range.max]];
            }
        }

        this._d3axes = []
        switch (this._axis.alignment) {
            case Alignment.Left:
                this._d3axes.push(d3.axisLeft(d3.scaleLinear()));
                break;
            case Alignment.Right:
                this._d3axes.push(d3.axisRight(d3.scaleLinear()));
                break;
            case Alignment.Top:
                this._d3axes.push(d3.axisTop(d3.scaleLinear()));
                break;
            case Alignment.Bottom:
                this._d3axes.push(d3.axisBottom(d3.scaleLinear()));
                break;
        }
        this._d3svg = svg;

        let classes = 'axis';
        if (this._axis.css) {
            for (let className in this._axis.css.classes) {
                classes += ' ' + className;
            }
        }

        // create the svg for later use
        if (!this._axis.hidden) {
            this._axisSVG = this._d3svg.append('g')
                .classed(classes, true);

            if (this._axis.axisDesc.label && this._axis.axisDesc.label.length > 0) {
                this._axisLabel = this._d3svg.append('text')
                    .classed('lane-axis-label', true)
                    .style('text-anchor', 'middle')
                    .text(this._axis.axisDesc.label);
            }
        }
        this._formatter = function (d: any): any {
            return d;
        };
    }   // constructor

    /**
     * get the width of the axis
     */
    public setRangePixels(pixels: number): D3Axis {
        this._axisPixels = pixels;
        this.getScale().range([0, pixels]);
        return this;
    }

    /**
     * get the width of the axis
     */
    public getRangePixels(): number {
        return this._axisPixels;
    }

    /**
     * set the domain for this axis
     *
     * @param the domain of the axis
     */
    public setDomain(domain: any[], level: number = 0): D3Axis {
        this._domain[level] = domain;
        return this;
    }

    /**
     * append to the domain values for this axis
     *
     * @param the domain values of to add
     */
    public appendDomain(newVals: any[], level: number = 0): D3Axis {
        if (this._domain.length <= level) {
            this._domain[level] = [];
        }
        mergeKeys(this._domain[level], newVals);
        return this;
    }

    /**
     * set the domain for this axis
     *
     */
    public getDomain(level: number = 0): any[] {
        return this._domain[level];
    }

    /**
     * get axis levels, used only for nested banded axes
     */
    public getLevelCount() {
        return this._domain.length;
    }

    /**
     * if you have a banded range there may be multiple bars per domain entry
     *
     */
    public setKeysPerDomain(keyCount: number) {
        this._keysPerDomain = keyCount;
    }

    /**
     * get the user axis
     */
    public getAxis() {
        return this._axis;
    }

    public getPosition(): Rect {
        return this._position;
    }

    public setPosition(pos: Rect) {
        this._position = pos;
    }

    public getRenderedRect(): Rect {
        return this._renderedRect;
    }

    /**
     * get the d3 scale for the given level of this axis
     *
     * @return the d3 scale helper
    */
    public setScale(scale: d3.AxisScale<any>, level = 0): any {
        return this._d3axes[level].scale(scale);
    }

    /**
     * get the d3 scale for the given level of this axis
     *
     * @return the d3 scale helper
    */
    public getScale(level: number = 0): any {
        return this._d3axes[level].scale();
    }

    /**
     * get the name of the banded data currently closest to the mouse
     *
     * @return true if data exists, false if we are out of range
     */
    private getCurrentBand(xPixelOffset: number): string {
        // banded data doesn't account for offset
        // for non banded data the axis map function handles it
        let scaleBand = this.getScale();
        let domain = scaleBand.domain();
        let range = scaleBand.range();
        let width = range[1] - range[0];
        let barWidth = width / domain.length;

        if (xPixelOffset <= width) {
            let index = Math.round(xPixelOffset / barWidth - .5);
            return domain[index];
        }
        return undefined;
    }

    /**
     * Map a value in the range (pixels) to the domain
     *
     * @param coordinate - The value in the range to be mapped to the domain
     *
     * @return - The value in the domain
     */
    public mapCoordinateToValue(coordinate: number): any {
        // Mapping from the range (coordinates) to the domain (data values)
        // is easy for linear scales using d3.scale.invert() :o)
        return this._isBanded ? this.getCurrentBand(coordinate) :
            this.getScale().invert(coordinate);
    }   // MapCoordinateToValue

    /**
     * set that the axis is banded based on inspection
     */
    public setBanded(isBanded: boolean) {
        this._isBanded = isBanded;
    }

    /**
     * Return whether axis is banded (for bar graphs) or not
     * (for point graphs). Returns false for linear axes.
     *
     * @return - True if this is a banded ordinal axis
     */
    public isBanded(): boolean {
        return this._isBanded;
    }

    /**
     * Sets the range maximum (assumes that the range minimum is 0).
     * Creates the d3 scale and axis, completing the axis' initialization.
     * Assumes that the domain has been set.
     *
     * @param pixels - The max range for the axis.
     *
     * @return - The axis instance
     */
    private setLinearCommitRange(pixels: number): D3Axis {
        let self = this;
        this._axisPixels = pixels;

        // Note that we're *not* clamping the x Axis to the data!
        // Clamping results in bizzare stretching of the data when
        // the user attempts to pan past the limits of the data.
        let domain = self.getDomain();
        let min = domain ? domain[0] : 0;
        let max = domain ? domain[1] : 0;

        if (min === max) {
            max > 0 ? min = 0 : max = 0;
        }
        if (min > max) {
            console.log('Error no data for axis');
            min = 0;
            max = 1;
        }
        let scale = d3.scaleLinear().domain([min, max]).clamp(true);

        switch (self._axis.alignment) {
            case Alignment.Left:
            case Alignment.Right:
                this.setScale(scale.range([this._axisPixels, 0]));
                break;
            case Alignment.Top:
            case Alignment.Bottom:
                this.setScale(scale.range([0, this._axisPixels]));
                break;
        }

        return self;
    }   // setLinearCommitRange

    /**
     * Sets the range maximum (assumes that the range minimum is 0).
     * Creates the d3 scale and axis, completing the axis' initialization.
     * Assumes that the domain has been set.
     *
     * @param pixels - The max range for the axis.
     *
     * @return - The axis instance
     */
    private setLogrithmicCommitRange(pixels: number) {
        let self = this;

        this._axisPixels = pixels;

        // set the min to 1 for the range at least
        let min = self.getDomain()[0];
        let max = self.getDomain()[1];
        self.setDomain([Math.max(1e-9, min), max]);
        min = self.getDomain()[0];
        max = self.getDomain()[1];

        if (min > max) {
            console.log('Error no data for axis');
            min = 1;
            max = 2;
        }

        let scale = d3.scaleLog().base(10).domain([min, max]).clamp(true);

        switch (self._axis.alignment) {
            case Alignment.Left:
            case Alignment.Right:
                this.setScale(scale.range([this._axisPixels, 0]));
                break;
            case Alignment.Top:
            case Alignment.Bottom:
                this.setScale(scale.range([0, this._axisPixels]));
                break;
        }

        return this;
    }   // setLogrithmicCommitRange

    /**
     * Sets the range maximum (assumes that the range minimum is 0).
     * Creates the d3 scale and axis, completing the axis' initialization.
     * Assumes that the domain has been set.
     *
     * @param pixels - The max range for the axis.
     *
     * @return - The axis instance
     */
    private setBandCommitRange(pixels: number) {
        let self = this;

        this._axisPixels = Math.min(
            self.getDomain().length * self._keysPerDomain * MAX_DISCRETE_WIDTH,
            pixels);

        let scale = d3.scaleBand()
            .range([0, this._axisPixels])
            .padding(0.1)
            .align(0.5)
            .domain(self.getDomain());
        this.setScale(scale);

        for (let i = 1; i < self._domain.length; ++i) {
            this._d3axes[i] = d3.axisBottom(d3.scaleBand()
                .domain(self.getDomain(i))
                .range([0, self.getScale(i - 1).bandwidth()]));
        }
        return this;
    }   // setBandCommitRange

    /**
     * Sets the range maximum (assumes that the range minimum is 0).
     * Creates the d3 scale and axis, completing the axis' initialization.
     * Assumes that the domain has been set.
     *
     * @param pixels - The max range for the axis.
     *
     * @return - The axis instance
     */
    public commitRange(pixels: number): D3Axis {
        if (this.isBanded()) {
            this.setBandCommitRange(pixels);
        } else {
            switch (this._axis.axisDesc.scaleType) {
                case AxisType.Linear:
                    this.setLinearCommitRange(pixels);
                    break;
                case AxisType.Logarithmic:
                    this.setLogrithmicCommitRange(pixels);
                    break;
            }
        }

        return this;
    }   // CommitRange

    private renderNestedAxes(level: number, xOffset: number) {
        let alignment = this._axis.alignment;
        switch (alignment) {
            case Alignment.Bottom:
                if (level === this._d3axes.length - 1) {
                    return;
                }

                let yOffset = this._position.y + (this._d3axes.length - level - 2) * 30;
                let parentScale = this.getScale(level - 1);
                let parentDomain = parentScale.domain();
                for (let i = 0; i < parentDomain.length; ++i) {
                    let localXOffset = (parentScale(parentDomain[i]) + xOffset)

                    let axisSvg = this._d3svg.append('g')
                        .classed('nested-axis', true)
                        .attr('transform',
                            'translate(' + localXOffset + ', ' + yOffset + ')');

                    axisSvg.call(this._d3axes[level]);

                    this._nestedAxes.push(axisSvg);
                    this.renderNestedAxes(level + 1, localXOffset);
                }
                break;
        }
    }

    private addTooltipToHiddenYTicks() {
        let self = this;
        let ticks = this._axisSVG.selectAll('.tick')
            .append('title') // append title with text
            .text(function (d: any) {
                let text = d;
                let scalingInfo = self._axis.axisDesc.scalingInfo;
                if (scalingInfo && scalingInfo.baseScale) {
                    text += scalingInfo.baseScale.units;
                }
                return text;
            });
    }

    private removeOverlappingTicksAsc(axis: any, useTickFunc: (base: any, test: any) => boolean) {
        let ticks = this._axisSVG.selectAll('.tick').selectAll('text').nodes();
        if (ticks.length > 0) {
            let domain: any = {};

            // find the first tick with text
            let i = 0;
            let currTick = ticks[i] as any;
            for (; i < ticks.length && currTick.innerHTML.length === 0; ++i) {
                currTick = ticks[i];
            }
            domain[currTick.__data__] = true;

            // for all text nodes hide overlapping text
            while (i < ticks.length) {
                // this is the tick with text farthest from the origin
                let currTickRect = currTick.getBoundingClientRect();

                // remove all ticks that overlap with the current one
                for (++i; i < ticks.length; ++i) {
                    let tick = ticks[i] as any;
                    let testTickRect = tick.getBoundingClientRect();
                    if (tick.innerHTML.length !== 0 && useTickFunc(currTickRect, testTickRect)) {
                        break;
                    }
                }
                currTick = ticks[i];
                if (currTick) {
                    domain[currTick.__data__] = true;
                }
            }
            let requiresRerender = Object.keys(domain).length !== ticks.length;
            if (requiresRerender) {
                // rerender with only the visible ticks
                axis.tickFormat((d: any) => {
                    if (domain[d]) {
                        return this._formatter(d);
                    }
                });
                this._axisSVG.call(axis);
                axis.tickFormat(this._formatter);
            }
        }
    }

    private removeOverlappingTicksDesc(axis: any, useTickFunc: (base: any, test: any) => boolean) {
        let ticks = this._axisSVG.selectAll('.tick').selectAll('text').nodes();
        if (ticks.length > 0) {
            let domain: any = {};

            // find the first tick with text
            let i = ticks.length - 1;
            let currTick = ticks[i] as any;
            for (; i >= 0 && currTick.innerHTML.length === 0; --i) {
                currTick = ticks[i];
            }
            domain[currTick.__data__] = true;

            // for all text nodes hide overlapping text
            while (i >= 0) {
                // this is the tick with text farthest from the origin
                let currTickRect = currTick.getBoundingClientRect();

                // remove all ticks that overlap with the current one
                for (--i; i >= 0; --i) {
                    let tick = ticks[i] as any;
                    let testTickRect = tick.getBoundingClientRect();
                    if (tick.innerHTML.length !== 0 && useTickFunc(currTickRect, testTickRect)) {
                        break;
                    }
                }
                currTick = ticks[i];
                if (currTick) {
                    domain[currTick.__data__] = true;
                }
            }
            let requiresRerender = Object.keys(domain).length !== ticks.length;
            if (requiresRerender) {
                // rerender with only the visible ticks
                axis.tickFormat((d: any) => {
                    if (domain[d]) {
                        return this._formatter(d);
                    }
                });
                this._axisSVG.call(axis);
                axis.tickFormat(this._formatter);
            }
        }
    }

    private removeYOverlappingTicks(axis: any) {
        let testFunc = (base: any, test: any) => {
            return base.bottom < (test.top + 2);
        };

        if (this.isBanded()) {
            this.removeOverlappingTicksAsc(axis, testFunc);
        } else {
            this.removeOverlappingTicksDesc(axis, testFunc);
        }
    }

    private removeXOverlappingTicks(axis: any) {
        this.removeOverlappingTicksDesc(axis, (base: any, test: any) => {
            return base.left > (test.right + 5);
        });
    }

    public saveState() {
        this.cache.pixels = this.getRangePixels();
        this.cache.domain = this.getDomain();
    }

    public render() {
        let self = this;

        if (self._axis.hidden) {
            if (self._axisSVG) {
                self._axisSVG.remove();
            }
            return;
        }

        // check if we can just reposition and not rerender an axis
        let alignment = self._axis.alignment;
        let pixels = this.getRangePixels();
        let domain = this.getDomain();
        let requiresRender = this.cache.pixels !== pixels ||
            JSON.stringify(this.cache.domain) !== JSON.stringify(domain);

        self._nestedAxes = [];

        // bound the number of ticks based on available vertical space

        let scalingInfo: IScalingInfo;
        if (self._axis.axisDesc.scalingInfo) {
            scalingInfo = self._axis.axisDesc.scalingInfo
        } else {
            scalingInfo = new ScalingInfo();
        }
        if (self._axis.axisDesc.scaleType === AxisType.Ordinal) {
            this._formatter = function (d: any) {
                let ret: any = d;
                ret += scalingInfo.baseScale.units;
                return ret;
            };
        } else {
            let domain = self.getScale().domain();
            let range = domain[1] - domain[0];
            if (!isNaN(range)) {
                let scalar = getScalar(scalingInfo, range);
                switch (self._axis.axisDesc.scaleType) {
                    case AxisType.Linear:
                        this._formatter = function (d: number) {
                            if (self._axis.axisDesc.precision) {
                                return d3.format(',.' + self._axis.axisDesc.precision + 'f')(d * scalar.scalar) +
                                    scalar.units
                            } else {
                                return d3.format(',')(d * scalar.scalar) +
                                    scalar.units
                            }
                        }
                        break;
                }
            }
        }

        // Render the axis. This will update it if this isn't the first call
        if (self._axis.options) {
            if (self._axis.options.tickCount !== undefined) {
                self._d3axes[0].ticks(self._axis.options.tickCount);
            }
            if (self._axis.options.tickSizeInner !== undefined) {
                self._d3axes[0].tickSizeInner(self._axis.options.tickSizeInner);
            }
            if (self._axis.options.tickSizeOuter !== undefined) {
                self._d3axes[0].tickSizeOuter(self._axis.options.tickSizeOuter);
            }
            if (self._axis.options.tickMappingFunc) {
                this._formatter = self._axis.options.tickMappingFunc;
                self._d3axes[0].tickFormat(this._formatter);
            }
        }

        let node: any;
        let axisRect: any;
        let yOffset = 0;

        switch (alignment) {
            case Alignment.Left:
            case Alignment.Right:
                if (alignment === Alignment.Left) {
                    // the D3 left axis overlaps the data
                    self._axisSVG.attr('transform',
                        'translate(' + (self._position.x - 1) + ', ' + self._position.y + ')');
                } else {
                    self._axisSVG.attr('transform',
                        'translate(' + (self._position.x) + ', ' + self._position.y + ')');
                }

                if (requiresRender) {
                    self._axisSVG.call(self._d3axes[0]);
                    self.removeYOverlappingTicks(self._d3axes[0]);
                }

                node = self._axisSVG.node();
                axisRect = node.getBoundingClientRect();

                if (self._axisLabel) {
                    let x = -self._axisPixels / 2;

                    // Smaller the value, closer the text is to Axis
                    // Negative means left of the axis, positive means right of the axis
                    let rotate = -90;
                    let xOffSet = -axisRect.width - 10;
                    if (alignment === Alignment.Right) {
                        rotate = -rotate;
                        x = -x;
                    }

                    self._axisLabel
                        .attr('transform', 'translate(' + self._position.x + ', ' +
                            self._position.y + ') rotate(' + rotate + ')')
                        .attr('x', x)
                        .attr('y', 0)
                        .attr('dy', xOffSet + 'px');
                }
                self.addTooltipToHiddenYTicks();
                break;
            case Alignment.Top:
                // axis requires transformation to account for the non-zero X offset...
                self._axisSVG.attr('transform',
                    'translate(' + self._position.x + ', ' + (self._position.y) + ')');

                if (requiresRender) {
                    self._axisSVG.call(self._d3axes[0]);
                    self.removeXOverlappingTicks(self._d3axes[0]);
                }

                if (self._axisLabel) {
                    self._axisLabel
                        .attr('x', self._position.x)
                        .attr('y', self._position.y - (self._domain.length - 1) * 30 + 30)
                        .attr('dx', self._axisPixels / 2);
                }
                break;
            case Alignment.Bottom:
                let axisLevels = self.getLevelCount();
                if (axisLevels > 1) {
                    // todo don't require re-render with nested axes
                    requiresRender = true;
                    self._d3svg.selectAll('.nested-axis').remove();
                    self.renderNestedAxes(1, self._position.x);

                    // axis requires transformation to account for the non-zero y offset...
                    yOffset = (axisLevels - 2) * 30;
                }

                // axis requires transformation to account for the non-zero X offset...
                self._axisSVG.attr('transform',
                    'translate(' + self._position.x + ', ' + (self._position.y + yOffset) + ')');

                if (requiresRender) {
                    self._axisSVG.call(self._d3axes[0] as any);
                    if (self._axis.options &&
                        (self._axis.options.rotateText || self._axis.options.rotateTextDegrees)) {
                        let degrees = self._axis.options.rotateTextDegrees ?
                            self._axis.options.rotateTextDegrees : 65;
                        self._axisSVG.selectAll("text")
                            .style("text-anchor", "end")
                            .attr("dx", "-.8em")
                            .attr("dy", ".15em")
                            .attr("transform", "rotate(-" + degrees + ")");
                    } else {
                        this.removeXOverlappingTicks(self._d3axes[0]);
                    }
                }
                node = self._axisSVG.node();
                axisRect = node.getBoundingClientRect();
                if (self._axisLabel) {
                    self._axisLabel
                        .attr('x', self._position.x)
                        .attr('y', self._position.y + axisRect.height + 20)
                        .attr('dx', self._axisPixels / 2);
                }
                break;
        }

        let left = axisRect.left;
        let right = axisRect.right;
        let top = axisRect.top;
        let bottom = axisRect.bottom;

        if (self._axisLabel) {
            let labelNode: any = self._axisLabel.node();
            let labelRect = labelNode.getBoundingClientRect();
            left = Math.min(labelRect.left, left);
            right = Math.max(labelRect.right, right);
            top = Math.min(labelRect.top, top);
            bottom = Math.max(labelRect.bottom, bottom);
        }

        self._renderedRect = new Rect(left, top, right - left, bottom - top + yOffset);

        // for each axis cache the previous layout so we can avoid
        // rerendering if a simple translation is possible
        this.saveState();
    }
}

class D3Title {
    /** the d3svg */
    private _titleSvg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** the lane title offset from the y origin of the div */
    private _title: string;

    /** the class of this title for CSS purposes*/
    private _className: string;

    /** the size of the area */
    private _position: Rect;

    /** the rendered rect for the axis */
    private _renderedRect: Rect;

    constructor(svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        title: string, className: string, rect?: Rect) {
        this._title = title;
        this._position = rect;
        this._className = getSelectionName(className);

        if (this._title && this._title.length > 0) {
            this._titleSvg = svg.append('text')
                .classed(this._className, true)
                .text(this._title);

            let titleNode: any = this._titleSvg.node();
            let titleRect = titleNode.getBoundingClientRect();

            this._renderedRect = new Rect(titleRect.left, titleRect.top,
                titleRect.width, titleRect.height);
        }
    }

    public getPosition(): Rect {
        return this._position;
    }

    public setPosition(pos: Rect) {
        this._position = pos;
    }

    public getRenderedRect(): Rect {
        return this._renderedRect;
    }

    public render() {
        if (this._titleSvg) {
            let xOffset = this._position.x;
            let yOffset = this._position.y + (this._position.height / 2);
            this._titleSvg
                .attr('transform', 'translate(' + xOffset + ',' + yOffset + ')');

            let titleNode: any = this._titleSvg.node();
            let titleRect = titleNode.getBoundingClientRect();

            this._renderedRect = new Rect(titleRect.left, titleRect.top,
                titleRect.width, titleRect.height);
        }
    }
}

export class D3Chart extends SVGRenderer implements ID3Chart {
    private static MIN_GRAPH_HEIGHT = 20;

    private _graphSvg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    private _loadingView: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** list of title text */
    private _title: D3Title;

    /** list of legends */
    private _legends: D3Legend[];

    /** map user axes to d3 axes */
    private _axes: { [index: number]: D3Axis };

    /** a map of the series to the associated data */
    private _seriesMap: Map<ILayer, ICartesianSeriesPlugin>;

    /** the d3 scale used for brushes and tooltips */
    private _scaleAxis: D3Axis;

    /** Brush for this graph - Only defined if this graph can be zoomed */
    public _brush: Brush;

    /** Tooltip div id */
    private _hoverLine: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** a map of the series to the associated data */
    private _svgMap: WeakMap<Object, d3.Selection<any, any, d3.BaseType, any>>;

    /** the minimum height of the graph */
    private _minGraphHeight: number;

    /** the maximum width of the graph */
    private _maxGraphWidth: number;

    /** handle below graph to resize it vertically */
    private _bottomHandle: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** the tooltip object for the bottom handle because it covers the
     *  regular tooltip area */
    private _handleTooltip: CustomDivTooltip;

    /** the tooltip object */
    protected _brushTooltip: OneLineTooltip;

    private _xMin: number;
    private _xMax: number;

    private _zoom: d3.ZoomBehavior<Element, {}>;

    private _defaultXScale: any;
    private _defaultYScale: any;

    public onHover: (event: IEvent) => boolean;

    public cursorEnter: () => boolean;
    public cursorMove: () => boolean;
    public cursorExit: () => boolean;

    protected _contextMenuItems: IContextMenuItem[];

    /**
     * Append the div for this graph to the parent div. The div we create
     * will be filled when Render() is called
     *
     * @param parent - The div that will contain the div for this chart.
     *
     * @return - The chart instance
     */
    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        super();

        this._handleWidth = 10;

        this.DEFAULT_GRAPH_HEIGHT = 120;
        this.MIN_MARGIN = { TOP: 10, BOTTOM: 10, LEFT: 30, RIGHT: 30 };
        this._options.height = this.DEFAULT_GRAPH_HEIGHT;
        this._minGraphHeight = 0;

        this._svgMap = new WeakMap<Object, d3.Selection<d3.BaseType, {}, d3.BaseType, any>>();

        this._xMin = Number.MAX_VALUE;
        this._xMax = -Number.MAX_VALUE;

        this.initialize(element, renderer, parent);

        this._requiresRelayout = true;

        this._brushTooltip = new OneLineTooltip('brush', 'tooltip-t');
        this._brushTooltip
            .setPlaceTooltipLeftRight()
            .alwaysRecalcWidth(true)
            .setDelay(0);

        let self = this;

        this.onHover = function (event: IEvent) {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }
            let chart = self._element;
            event.caller = self._element;

            let hoverCallback = chart.onHover;
            if (hoverCallback) {
                hoverCallback(event);
            } else {
                self._renderer.hover(chart, event);
            }
            return true;
        }

        function onCursorChanged(event: IEvent) {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }

            let chart = self._element;

            let cursorCallback = chart.onCursorChanged;
            if (cursorCallback) {
                cursorCallback(event);
            } else {
                self.cursorChange(event);
            }
            return true;
        }

        let myPrevHoverItem: any; // used in callbacks
        function fireCursorEvent(event: IEvent): boolean {
            // Get mouse coordinates that are relative to the group for the chart
            let coords: number[] = d3.mouse(self.getGraphGroup().node());

            // Bound the x coordinate to the chart. Can't be less than 0
            // or greater than the graph width
            let xPixelOffset = getBoundedPixelValue(coords[0], self._graphRect.width);

            // in the numeric axis case get the time as pass it as X
            let xValue = self._scaleAxis.mapCoordinateToValue(xPixelOffset);
            if (self._scaleAxis.isBanded()) {
                let item = getSelectionName(xValue);
                if (event.event === EventType.CursorEnd && myPrevHoverItem !== undefined) {
                    self.onHover({
                        caller: self._element,
                        event: EventType.HoverEnd,
                        selection: myPrevHoverItem
                    });
                    myPrevHoverItem = undefined;
                } else if (item !== myPrevHoverItem) {
                    if (myPrevHoverItem) {
                        self.onHover({
                            caller: self._element,
                            event: EventType.HoverEnd,
                            selection: myPrevHoverItem
                        });
                    }
                    self.onHover({
                        caller: self._element,
                        event: EventType.HoverStart,
                        selection: item
                    });
                    myPrevHoverItem = item;
                }
            } else {
                // hover lines are specified by the time value so they appear in the appropriate
                // place regardless of the width of the graph
                event.xEnd = xValue;
                onCursorChanged(event);
            }
            return true;
        }
        this.cursorEnter = function (): boolean {
            return fireCursorEvent({ caller: self._element, event: EventType.CursorStart });
        }

        this.cursorMove = function (): boolean {
            return fireCursorEvent({ caller: self._element, event: EventType.CursorMove });
        }   // onHoverMove

        this.cursorExit = function (): boolean {
            return fireCursorEvent({ caller: self._element, event: EventType.CursorEnd });
        }

        if (!this._element.api) {
            this._element.api = {
                getOptions: () => {
                    return this.getOptions();
                }
            };
        }
    }

    public getContextMenuItems(): IContextMenuItem[] {
        return this._contextMenuItems;
    }
    public getTooltip(): CustomDivTooltip {
        return this._dataTooltip;
    }
    public getTitle(): string {
        return (this._element as IChart).title;
    }

    public getRenderer() {
        return this._renderer;
    }

    public contextMenu(menu: IContextMenuItem[], opts?: any) {
        let self = this;

        var openCallback: any,
            closeCallback: any;

        if (typeof opts === 'function') {
            openCallback = opts;
        } else {
            opts = opts || {};
            openCallback = opts.onOpen;
            closeCallback = opts.onClose;
        }

        // this gets executed when a contextmenu event occurs
        return function (data: any, index: number) {
            if ((self._element as ICartesianChart).brushContextMenuItems && self._brush) {
                self._brush.brushEnd();
            }
            if (openCallback) {
                openCallback();
            }
            // Get mouse coordinates that are relative to the group for the chart
            let coords: number[] = d3.mouse(self.getGraphGroup().node());

            // Bound the x coordinate to the chart. Can't be less than 0
            // or greater than the graph width
            let xPixelOffset = getBoundedPixelValue(coords[0], self._graphRect.width);
            let yPixelOffset = coords[1];

            // in the numeric axis case get the time as pass it as X
            let xValue = self._scaleAxis.mapCoordinateToValue(xPixelOffset);
            let yValue = self._axes[1].mapCoordinateToValue(yPixelOffset);
            showContextMenu(d3.event, { x: xValue, y: yValue }, menu)
        };
    };

    /**
     * hover event
     *
     * @param element to fire the hover event on
     * @param event the event to pass to the renderer
     */
    public cursorChange(event: IEvent): void {
        if (!this._options.disableHover) {
            switch (event.event) {
                case EventType.CursorStart:
                    if (this._hoverLine) {
                        this._hoverLine
                            .style('display', '');
                    }
                    break;
                case EventType.CursorMove:
                    this.updateHover(event);
                    break;
                case EventType.CursorEnd:
                    if (this._hoverLine) {
                        this._hoverLine
                            .style('display', 'none');
                    }
                    break;
            }
        }
    }

    private onZoomChanged(event: IEvent) {
        let chart = this._element;
        let cb = chart.onZoom;
        if (cb) {
            cb(event);
        } else {
            this.zoom(event);
        }
    }

    private updateD3ZoomState(xStart: number, xEnd: number, yStart: number, yEnd: number) {
        // this updates our DOM to know what the zoom values are for this chart
        // if the user is using native zoom functionality
        let xScalar = (this._defaultXScale(this._defaultXScale.domain()[1]) -
            this._defaultXScale(this._defaultXScale.domain()[0])) /
            (this._defaultXScale(xEnd) - this._defaultXScale(xStart));
        let x = -this._defaultXScale(xStart) * xScalar;

        this.getGraphGroup().call(d3.zoom().transform, d3.zoomIdentity.translate(x, 0)
            .scale(xScalar));
        if (this._options.enableXYZoom) {
            let yScalar = (this._defaultYScale(this._defaultYScale.domain()[1]) -
                this._defaultYScale(this._defaultYScale.domain()[0])) /
                (this._defaultYScale(yEnd) - this._defaultYScale(yStart));
            let y = -this._defaultYScale(yStart) * yScalar;

            this.getGraphGroup().call(d3.zoom().transform, d3.zoomIdentity.translate(0, y)
                .scale(yScalar));
        }
    }
    /**
     * zoom event
     *
     * @param element to fire the zoom event on
     * @param event the event to pass to the renderer
     */
    public zoom(event: IEvent): void {
        if (event.event !== EventType.Zoom) {
            throw 'Error passing a non zoom event to zoom function'
        }

        if (!this._scaleAxis.isBanded()) {
            if (this._options.disableZoomViewUpdate) {
                // when showing zoom as overlay we just use the brush so move the
                // brush to the right spot
                let xScale = this._scaleAxis.getScale();
                this._brush.disableCallbacks();
                if (this._options.enableXYZoom) {
                    let yScale = this._axes[1].getScale();
                    this._brush.brushMove([
                        [xScale(event.xStart), yScale(event.yStart)],
                        [xScale(event.xEnd), yScale(event.yEnd)]
                    ]);
                } else {
                    this._brush.brushMove([xScale(event.xStart), xScale(event.xEnd)]);
                }

                this._brush.enableCallbacks();
            } else {
                this.updateD3ZoomState(event.xStart, event.xEnd, event.yStart, event.yEnd);
                // render this chart using the new start/end values
                this.render(event);
            }
            this._options.xStart = event.xStart;
            this._options.xEnd = event.xEnd;
            this._options.yStart = event.yStart;
            this._options.yEnd = event.yEnd;
        }
    }

    /**
     * brush event
     * @param event the event to pass to the renderer
     */
    public brush(event: IEvent): void {
        let yAxis = this._axes[1];
        let coords: d3.BrushSelection;
        if (this._options.enableXYZoom) {
            let xStart: number = this._scaleAxis.getScale()(event.xStart);
            let xEnd: number = this._scaleAxis.getScale()(event.xEnd);
            let yStart: number = event.yStart ? yAxis.getScale()(event.yStart) : 0;
            let yEnd: number = event.yEnd ? yAxis.getScale()(event.yEnd) : yAxis.getRangePixels();
            coords = [[xStart, yStart], [xEnd, yEnd]];
        } else {
            let start: number = this._scaleAxis.getScale()(event.xStart);
            let end: number = this._scaleAxis.getScale()(event.xEnd);
            coords = [start, end];
        }

        if (this._brush) {
            switch (event.event) {
                // this implemention doesn't need the SelectionStart and
                // actually doesn't work with it
                case EventType.BrushStart:
                    if (event.caller !== this._element) {
                        this._brush.disableCallbacks();
                        this._brush.brushStart(coords);
                        this._brush.enableCallbacks();
                    }
                    this._brush.moveToFront();
                    break;
                case EventType.BrushMove:
                    if (event.caller !== this._element) {
                        this._brush.disableCallbacks();
                        this._brush.brushMove(coords);
                        this._brush.enableCallbacks();
                    }
                    break;
                case EventType.BrushEnd:
                    // if we are showing the zoom as the overlay we just
                    // leave the brush on top
                    if (!this._options.showSelectionAsOverlay) {
                        if (!this._options.forceBrushToFront) {
                            this._brush.moveToBack();
                        }
                        this._brush.disableCallbacks();
                        this._brush.brushEnd();
                        this._brush.enableCallbacks();
                    }
                    break;
            }
        }
    }

    public getGraphGroup(): any {
        return this._svg.select('.graphGroup');
    }

    /**
     * get tooltip for the graph
     *
     * @return -The chart instance.
     */
    public getTooltipData(event: IEvent): ITooltipData[] {
        let chart = this._element as ICartesianChart;
        let tooltipList: ITooltipData[] = [];

        let groupMap: { [index: string]: ITooltipData } = {};

        // Request the data for each series
        for (let seriesIdx = 0; seriesIdx < chart.dataSets.length; ++seriesIdx) {
            let layer = chart.dataSets[seriesIdx];

            let d3Series = this._seriesMap.get(layer);
            if (d3Series) {
                let seriesTooltipList = d3Series.getTooltipMetrics(this._element, event);
                for (let i = 0; i < seriesTooltipList.length; ++i) {
                    let seriesTooltip = seriesTooltipList[i];

                    // merge data if they have the same group name
                    if (groupMap.hasOwnProperty(seriesTooltip.group)) {
                        let groupTooltip = groupMap[seriesTooltip.group];
                        for (let key in seriesTooltip.metrics) {
                            groupTooltip.metrics[key] = seriesTooltip.metrics[key];
                        }
                    } else {
                        groupMap[seriesTooltip.group] = seriesTooltip;
                        tooltipList.push(seriesTooltip);
                    }
                }
            }
        }
        return tooltipList;
    }

    /**
     * Fill the tooltip div with information about values in this chart.
     *
     * @param xPixelOffset - tooltip location
     */
    private populateTooltip(xPixelOffset: number, yPixelOffset: number): void {
        let chart = this._element as IChart;
        let title = chart.title ? chart.title : '';

        let x = this._scaleAxis.mapCoordinateToValue(xPixelOffset);
        let yStart = this._axes[1].mapCoordinateToValue(yPixelOffset);
        let yEnd = this._axes[1].mapCoordinateToValue(yPixelOffset - 1);
        let xPrev: any;
        if (this._scaleAxis.isBanded()) {
            if (x === undefined) {
                return;
            }
            title += ' for ' + x;
        } else {
            xPrev = this._scaleAxis.mapCoordinateToValue(xPixelOffset - 1);
            if (this._scaleAxis.getAxis().options &&
                this._scaleAxis.getAxis().options.tickMappingFunc) {
                title += ' at ' + this._scaleAxis.getAxis().options.tickMappingFunc(x) +
                    this._scaleAxis.getAxis().axisDesc.scalingInfo.baseScale.units;
            } else {
                let domain = this._scaleAxis.getScale().domain();
                let scalar = getScalar(this._scaleAxis.getAxis().axisDesc.scalingInfo,
                    domain[1] - domain[0]);;

                let timeStr: string = (x * scalar.scalar).toLocaleString();
                title += ' at ' + timeStr + scalar.units;
            }
        }

        let ttList: ITooltipData[] = [];
        if (this._scaleAxis.isBanded()) {
            ttList = this.getTooltipData({ selection: x });
        } else {
            ttList = this.getTooltipData({ xEnd: x });
        }

        let cb = chart.onTooltip;
        if (cb) {
            let data: any = {
                tooltip: this._dataTooltip,
                defaultData: ttList
            };

            this._dataTooltip.setData(title, []);

            if (this._scaleAxis.isBanded()) {
                cb({
                    caller: this._element, selection: x, data: data,
                    defaultTitle: title, defaultClass: this
                });
            } else {
                cb({
                    caller: this._element, xStart: xPrev, xEnd: x, yStart: yStart,
                    yEnd: yEnd, data: data,
                    defaultTitle: title, defaultClass: this
                });
            }
        } else {
            this._dataTooltip.setData(title, ttList);
        }

    }   // _PopulateTooltip

    /**
     * configure our selection brush
     */
    private configureBrush(): void {
        let self = this;
        let yAxis = self._axes[1];

        function getX(coords: any[]) {
            return self._options.enableXYZoom ? coords[0][0] : coords[0];
        }
        function getX1(coords: any[]) {
            return self._options.enableXYZoom ? coords[1][0] : coords[1];
        }
        function getY(coords: any[]) {
            return self._options.enableXYZoom ? coords[0][1] : undefined;
        }
        function getY1(coords: any[]) {
            return self._options.enableXYZoom ? coords[1][1] : undefined;
        }

        // a generic callback to handle brush selection events
        function onBrushCallback(coords: any[], eventType: EventType): boolean {
            let chart = self._element;
            let options: IEvent = {
                event: eventType,
                caller: chart
            };

            if (coords) {
                options.xStart = self._scaleAxis.mapCoordinateToValue(getX(coords));
                options.xEnd = self._scaleAxis.mapCoordinateToValue(getX1(coords));
                options.yStart = yAxis.mapCoordinateToValue(getY(coords));
                options.yEnd = yAxis.mapCoordinateToValue(getY1(coords));
            }

            let cb = chart.onBrush;
            if (cb) {
                cb(options);
            } else {
                self.brush(options);
            }
            return coords !== null;
        }

        let updateBrushTooltip = function (coords: number[]) {
            if (coords === null) {
                return;
            }

            if (self._options.enableXYZoom && !yAxis.isBanded()) {
                if (self._scaleAxis.getAxis().options &&
                    self._scaleAxis.getAxis().options.tickMappingFunc) {
                    let func = self._scaleAxis.getAxis().options.tickMappingFunc;
                    self._brushTooltip.setData('Selection',
                        '(' + func(self._scaleAxis.mapCoordinateToValue(getX(coords))) + ', ' + yAxis.mapCoordinateToValue(getY(coords)) + ') - ' +
                        '(' + func(self._scaleAxis.mapCoordinateToValue(getX1(coords))) + ', ' + yAxis.mapCoordinateToValue(getY1(coords)) + ')');
                } else {
                    let domain = self._scaleAxis.getScale().domain();
                    let scalar = getScalar(self._scaleAxis.getAxis().axisDesc.scalingInfo,
                        domain[1] - domain[0]);

                    let xStart = self._scaleAxis.mapCoordinateToValue(getX(coords));
                    let xEnd = self._scaleAxis.mapCoordinateToValue(getX1(coords));
                    let yStart = yAxis.mapCoordinateToValue(getY(coords));
                    let yEnd = yAxis.mapCoordinateToValue(getY1(coords));
                    self._brushTooltip.setData('Selection',
                        '(' + (xStart * scalar.scalar).toLocaleString() + scalar.units + ', ' + yStart.toLocaleString() + ') - ' +
                        '(' + (xEnd * scalar.scalar).toLocaleString() + scalar.units + ', ' + yEnd.toLocaleString() + ')');
                }
            } else {
                if (self._scaleAxis.getAxis().options &&
                    self._scaleAxis.getAxis().options.tickMappingFunc) {
                    let func = self._scaleAxis.getAxis().options.tickMappingFunc;
                    self._brushTooltip.setData('Selection',
                        func(self._scaleAxis.mapCoordinateToValue(getX(coords))) + ' - ' +
                        func(self._scaleAxis.mapCoordinateToValue(getX1(coords))));
                } else {
                    let domain = self._scaleAxis.getScale().domain();
                    let scalar = getScalar(self._scaleAxis.getAxis().axisDesc.scalingInfo,
                        domain[1] - domain[0]);

                    let start = self._scaleAxis.mapCoordinateToValue(getX(coords));
                    let end = self._scaleAxis.mapCoordinateToValue(getX1(coords));
                    self._brushTooltip.setData('Selection',
                        (start * scalar.scalar).toLocaleString() + scalar.units + ' - ' +
                        (end * scalar.scalar).toLocaleString() + scalar.units + ' = ' +
                        ((end - start) * scalar.scalar).toLocaleString() + scalar.units);
                }
            }
        }

        let brushStart = function (coords: number[]): boolean {
            self._brush.moveToFront();
            updateBrushTooltip(coords);
            self._dataTooltip.onMouseLeave(d3.event);
            self._brushTooltip.onMouseEnter(d3.event);
            self._brushTooltip.onMouseMove(d3.event);
            return onBrushCallback(coords, EventType.BrushStart);
        }

        let brushMove = function (coords: number[]): boolean {
            updateBrushTooltip(coords);
            self._dataTooltip.onMouseLeave(d3.event);
            self._brushTooltip.onMouseMove(d3.event);

            // when moving with overlay for zoomed region dynamically update all
            // related graphs when this region is moved
            if (self._options.disableZoomViewUpdate) {
                if (onBrushCallback(coords, EventType.BrushEnd)) {
                    self.onZoomChanged({
                        event: EventType.Zoom,
                        xStart: self._scaleAxis.mapCoordinateToValue(getX(coords)),
                        xEnd: self._scaleAxis.mapCoordinateToValue(getX1(coords)),
                        yStart: yAxis.mapCoordinateToValue(getY(coords)),
                        yEnd: yAxis.mapCoordinateToValue(getY1(coords)),
                        caller: self._element
                    });
                }
                return true;
            } else {
                return onBrushCallback(coords, EventType.BrushMove);
            }
        }

        let brushEnd = function (coords: number[]): boolean {
            self._brushTooltip.onMouseLeave(d3.event);

            let brushContextMenuItems = (self._element as ICartesianChart).brushContextMenuItems;
            if (coords && brushContextMenuItems) {
                let contextMenuItems = [];
                if (!self._scaleAxis.isBanded()) {
                    contextMenuItems.push({
                        title: 'Zoom',
                        action(elem: any, data: any, index: any) {
                            self.onZoomChanged({
                                event: EventType.Zoom,
                                xStart: data.xStart,
                                xEnd: data.xEnd,
                                caller: data.caller
                            });
                            onBrushCallback(coords, EventType.BrushEnd);
                        }
                    });
                }

                for (let i = 0; i < brushContextMenuItems.length; ++i) {
                    let bcmi = brushContextMenuItems[i];
                    contextMenuItems.push({
                        title: bcmi.title,
                        action(elem: any, data: any, index: any) {
                            bcmi.action(elem, data, index);
                            onBrushCallback(coords, EventType.BrushEnd);
                        }
                    });
                }

                showContextMenu(d3.event.sourceEvent,
                    {
                        event: EventType.BrushEnd,
                        xStart: self._scaleAxis.mapCoordinateToValue(getX(coords)),
                        xEnd: self._scaleAxis.mapCoordinateToValue(getX1(coords)),
                        yStart: yAxis.mapCoordinateToValue(getY(coords)),
                        yEnd: yAxis.mapCoordinateToValue(getY1(coords)),
                        caller: self._element
                    },
                    contextMenuItems);
            } else if (onBrushCallback(coords, EventType.BrushEnd) &&
                !self._scaleAxis.isBanded()) {
                self.onZoomChanged({
                    event: EventType.Zoom,
                    xStart: self._scaleAxis.mapCoordinateToValue(getX(coords)),
                    xEnd: self._scaleAxis.mapCoordinateToValue(getX1(coords)),
                    yStart: yAxis.mapCoordinateToValue(getY(coords)),
                    yEnd: yAxis.mapCoordinateToValue(getY1(coords)),
                    caller: self._element
                });
            } else {
                let menus = document.getElementsByClassName('context-menu');
                if (menus.length > 0) {
                    (menus[0] as any).style.display = 'none';
                }
            }
            // when moving with overlay for zoomed region leave the brush on top
            if (self._options.showSelectionAsOverlay) {
                if (!self._options.forceBrushToFront) {
                    self._brush.moveToBack();
                }
            }

            return true;
        }

        let enableOrdinalBrushSelection = self._scaleAxis.getAxis().options &&
            self._scaleAxis.getAxis().options.enableOrdinalBrushSelection;
        // if we are a not banded the x-axis is zoomable so enable
        // the selection brush
        if (!self._scaleAxis.isBanded() || enableOrdinalBrushSelection) {
            self.getGraphGroup().select('.brush').remove();

            self._brush = new Brush()
                .setXY(self._options.enableXYZoom)
                .setTarget(self.getGraphGroup().append('g').attr('class', 'brush'))
                .setStartCallback(brushStart)
                .setMoveCallback(brushMove)
                .setEndCallback(brushEnd)
                .setRect(self._graphRect)
                .ready();
            self._brush.moveToBack();
        }
    }

    /**
     * configure a tooltip to be rendered after rendering data
     */
    protected configureTooltip(): void {
        let self = this;

        // Create the tooltip
        // delay is 0 because the tooltip crosses divs and with a delay it causes
        // flashing
        this._dataTooltip = new CustomDivTooltip(self._tooltipId, 'tooltip-t');
        this._dataTooltip
            .setTarget(self.getGraphGroup())
            .setTarget(self._bottomHandle)
            .setAnalyticsName(self._tooltipAnalyticsName)
            .setPlaceTooltipLeftRight()
            .alwaysRecalcWidth(true)
            .setDelay(self._options.tooltipDelay ? self._options.tooltipDelay : 0);

        if (!this._options.disableTooltip) {
            this._dataTooltip
                .setEnterCallback(showTooltipValues)
                .setMoveCallback(showTooltipValues);
        }
        // All further processing occurs in the callbacks
        return;

        // Show a tooltip value - Displays information about the chart series
        // based on the position of the mouse, and displays a line on all
        // graphs which share the same group name
        function showTooltipValues(): boolean {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }

            let result: boolean = true;

            // Get mouse coordinates that are relative to the group for the chart
            let coords: number[] = d3.mouse(self.getGraphGroup().node());

            // Bound the x coordinate to the chart. Can't be less than 0
            // or greater than the graph width
            let xPixelOffset = getBoundedPixelValue(coords[0], self._graphRect.width);
            let yPixelOffset = coords[1];
            // Fill the tooltip with information about this chart
            self.populateTooltip(xPixelOffset, yPixelOffset);

            return result;
        }   // showTooltipValues
    }   // tooltipRequested

    /** add a selection from all of the elements */
    public addHover(selection: any) {
        if (selection) {
            this._seriesMap.forEach(function (d3Series: ICartesianSeriesPlugin) {
                d3Series.addHover(selection);
            });
        }
    }

    /** remove a selection from all of the elements */
    public removeHover(selection: any) {
        this._seriesMap.forEach(function (d3Series: ICartesianSeriesPlugin) {
            d3Series.removeHover(selection);
        });
    }

    /**
     * Display the line for the current mouse position. We pass around the
     * scaled X value (the X axis domain value) instead of the X pixel offset
     * (the X axis range value) so we can deal with graphs that have different
     * widths.
     *
     * @param xValue - The X value that maps to the mouse position in the graph
     *   the mouse is currently over.
     */
    private updateHover(event: IEvent): void {
        if (this._hoverLine) {
            let scale = this._scaleAxis.getScale();

            if (!this._scaleAxis.isBanded()) {
                let xValue = event.xEnd;

                // From the left margin, calcuate the pixel offset cooresponding
                // to the value
                let xPixelOffset: number = scale(xValue) + this._options.leftMargin;

                if (!isNaN(xPixelOffset)) {
                    if (typeof (xValue) !== 'number') {
                        // discrete axis, adjust as tick is in middle of discrete value
                        xPixelOffset += scale.bandwidth() / 2;
                    }

                    this._hoverLine
                        .attr('transform', function () {
                            return 'translate(' + xPixelOffset + ',0)';
                        });
                }
            }
        }
    }   // updateHoverLine

    private configureCursorTracking(): void {
        let self = this;

        let graphGroup = self.getGraphGroup();
        if (!graphGroup.select('.overlay').node()) {
            let overlay = graphGroup
                .append('rect')
                .attr('class', 'overlay')
                .attr('fill', 'none')
                .attr('pointer-events', 'all');

            // move the overlay to the back so it's behind everyhing
            var firstChild = (overlay.node() as any).parentNode.firstChild;
            if (firstChild) {
                (overlay.node() as any).parentNode.insertBefore(overlay.node(), firstChild);
            }
        }

        graphGroup.select('.overlay')
            .attr('width', self._graphRect.width)
            .attr('height', self._graphRect.height);

        // All further processing occurs in the callbacks
        return;
    }   // configureHoverLine

    private getLegendPositions(): { [index: string]: ILegend } {
        let chart = this._element as ICartesianChart;
        let legendByAlignment: { [index: string]: ILegend } = {};

        let legends = chart.legends;
        if (legends) {
            for (let legendIdx = 0; legendIdx < legends.length; ++legendIdx) {
                let legend = legends[legendIdx];
                legendByAlignment[legend.alignment] = legend;
            }
        }
        return legendByAlignment;
    }

    static SERIES_RENDERERS: any[] = [];
    public static register(seriesRenderer: any) {
        D3Chart.SERIES_RENDERERS.push(seriesRenderer);
    }

    private addToD3SeriesMap(layer: ILayer,
        graphSvg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>): ICartesianSeriesPlugin {
        let chart = this._element as ICartesianChart;
        let d3Series: ICartesianSeriesPlugin;

        let xAxis = this._axes[layer.xAxisIdx];
        let yAxis = this._axes[layer.yAxisIdx];
        let isXContinuous = chart.isXContinuous;

        for (let i = 0; i < D3Chart.SERIES_RENDERERS.length; ++i) {
            let SeriesRenderer = D3Chart.SERIES_RENDERERS[i];
            if (SeriesRenderer.canRender(layer)) {
                d3Series = new SeriesRenderer(this, layer, graphSvg, xAxis, yAxis, isXContinuous);
                break;
            }
        }


        if (d3Series) {
            this._svgMap.set(d3Series, graphSvg);
            this._seriesMap.set(layer, d3Series);
        }
        return d3Series;
    }

    public createHandles() {
        super.createHandles();

        let self = this;

        // create handles here then their positions are updated in the render call
        if (!self._options.disableResizeBottom) {
            self._bottomHandle = self._svg.append('rect')
                .attr('opacity', 0)
                .attr('height', self._handleWidth)
                .attr('cursor', 'ns-resize')
                .classed('chart-handle horizontal bottom', true)
                .call(d3.drag()
                    .on('start', function () {
                        SVGRenderer.IS_RESIZING = true;
                    })
                    .on('drag', function () {
                        if (d3.event.dy === 0) {
                            return;
                        }
                        let laneHeight = Math.max(D3Chart.MIN_GRAPH_HEIGHT,
                            self._options.height + d3.event.dy);

                        let options = {
                            height: laneHeight,
                            xStart: self._options.xStart,
                            xEnd: self._options.xEnd,
                            animateDuration: 0
                        };

                        // rerender the graph
                        self.render(options);
                    })
                    .on('end', function () {
                        SVGRenderer.IS_RESIZING = false;
                    })
                );
        }
    }

    private updateGraphRect() {
        let self = this;

        if (!self._options.width) {
            let node: any = this._parent.node();
            if (node) {
                this._svgRect.width = node.getBoundingClientRect().width;
            }
        } else {
            this._svgRect.width = this._options.width;
        }

        self._graphRect.x = self._options.leftMargin;
        self._graphRect.y = self._options.topMargin;
        self._graphRect.height = self._options.height;
        self._graphRect.width = self._svgRect.width - (self._options.leftMargin + self._options.rightMargin);

        if (self._svgRect.width < (self._options.leftMargin + self._options.rightMargin)) {
            console.log('Error margins too wide for graph');
        }
        if (self._minGraphHeight) {
            self._graphRect.height = Math.max(self._minGraphHeight, self._graphRect.height);
        }
        if (self._maxGraphWidth) {
            self._graphRect.width = Math.min(self._maxGraphWidth, self._graphRect.width);
        }
    }

    public createLayout() {
        let self = this;
        let chart = self._element as ICartesianChart;

        self._requiresRelayout = false;

        // relayout so remove everything
        if (this._svg) {
            this._svg.selectAll('*')
                .remove();
        }

        // this sets graph rect max width so banded charts can shrink it if necessary
        this.updateGraphRect();

        // keep these in case we have to adjust the graph width
        self._legends = [];
        self._axes = [];
        self._svgMap = new WeakMap<Object, d3.Selection<d3.BaseType, {}, d3.BaseType, any>>();
        self._seriesMap = new Map<ILayer, ICartesianSeriesPlugin>();
        let leftRightAxes: D3Axis[] = [];

        // Render the lane title, if present

        let leftTitleWidth = 0;
        if (!self._options.hideRowTitle) {
            let laneTitle = chart.title ? chart.title : '';
            self._title = new D3Title(self._svg, laneTitle, 'lane-title');
            let titleRect = self._title.getRenderedRect();
            leftTitleWidth = titleRect ? titleRect.width : 0;
        }

        if (!self._options.disableBackground) {
            self._backgroundSVG = this._svg
                .append('rect')
                .classed('chart-background', true);
        }

        // create place holders for the axes
        for (let i = 0; i < chart.axes.length; ++i) {
            let axis = chart.axes[i];
            let d3Axis = new D3Axis(this._svg, axis,
                new Rect(this._options.leftMargin, 0, 0, 0));

            this._axes[i] = d3Axis;
            if (axis.alignment === Alignment.Left ||
                axis.alignment === Alignment.Right) {
                leftRightAxes.push(d3Axis);
            }
        }

        // create the legends
        let legends = self.getLegendPositions();
        for (let key in legends) {
            let legend = new D3Legend(self._svg, legends[key], chart.title);
            self._legends.push(legend);
        }

        // check if this is a continuous or a banded/ordinal graph
        let isXBanded = false;
        let layers = chart.dataSets;

        if (layers.length === 0) {
            return;
        }

        // create the lane for the data series to share
        // put graph last so it's on top for selections
        self._graphSvg = this._svg.append('g').attr('class', 'graphGroup').append('svg');

        let ySum = 0;
        for (let seriesIdx = 0; seriesIdx < layers.length; ++seriesIdx) {
            // create the new series and map it to the correct render axes
            let layer = layers[seriesIdx];

            let xD3Axis = self._axes[layer.xAxisIdx];
            let d3Series = self.addToD3SeriesMap(layer, self._graphSvg);

            if (!d3Series) {
                continue;
            }

            if (!d3Series.isXContinuousSeries()) {
                if (chart.isXContinuous) {
                    throw 'Error cannot render continuous and banded data in one chart';
                } else {
                    isXBanded = true;
                }
            }

            self._minGraphHeight = Math.max(d3Series.getRequiredHeight(), self._minGraphHeight);

            // Compute the ranges for the Y Axis
            let isStacked = (layer.renderType & RenderType.Stacked) !== 0;

            // Compute the ranges for the X Axis
            if (isXBanded) {
                let keys = d3Series.getDiscreteXValues(isStacked);

                // TODO FIX HARDCORD FOR BAR CHARTS
                let series = d3Series as any;
                if (series['getBarsPerDomain'] && series['getLevelKeys']) {
                    // right now only bar series have multiple keys, we could extend this
                    // by making other datatypes support it.  We would then move the
                    // code that computes the keys for each object and creates the extra
                    // axes up to this level.

                    // Right now rendering of these even happens in the barseries
                    xD3Axis.setKeysPerDomain(series['getBarsPerDomain'](isStacked));
                    let levelKeys = series['getLevelKeys']();
                    for (let levelIdx = 0; levelIdx < levelKeys.length; ++levelIdx) {
                        xD3Axis.appendDomain(levelKeys[levelIdx], levelIdx);
                    }
                } else {
                    xD3Axis.appendDomain(keys);
                }

                xD3Axis.setBanded(true);
            } else {
                let xMinMax = d3Series.getXMinMax();

                let xAxisRange = xD3Axis.getDomain();
                if (xAxisRange) {
                    xD3Axis.setDomain([
                        Math.min(xAxisRange[0], xMinMax[0] ? xMinMax[0] : Number.MAX_VALUE),
                        Math.max(xAxisRange[1], xMinMax[1] ? xMinMax[1] : -Number.MAX_VALUE)]);
                } else {
                    xD3Axis.setDomain([xMinMax[0], xMinMax[1]]);
                }
                self._xMin = Math.min(xMinMax[0], self._xMin);
                self._xMax = Math.max(xMinMax[1], self._xMax);
            }

            let yD3Axis = self._axes[layer.yAxisIdx];
            if (chart.axes[layer.yAxisIdx].axisDesc.scaleType === AxisType.Ordinal ||
                !d3Series.isYContinuousSeries()) {

                let keys = d3Series.getDiscreteYValues();
                let oldKeys = yD3Axis.getDomain();
                if (oldKeys) {
                    mergeKeys(oldKeys, keys);
                } else {
                    yD3Axis.setDomain(keys);
                }
                yD3Axis.setBanded(true);
            } else {
                let yRange: number[] = d3Series.getYMinMax();

                let yAxisRange = yD3Axis.getDomain();
                if (yAxisRange) {
                    yD3Axis.setDomain(
                        [Math.min(yAxisRange[0], yRange[0] ? yRange[0] : Number.MAX_VALUE),
                        Math.max(yAxisRange[1], yRange[1] ? yRange[1] : -Number.MAX_VALUE)]);
                } else {
                    yD3Axis.setDomain(yRange);
                }
                yAxisRange = yD3Axis.getDomain();
                if (yD3Axis.getAxis().options && yD3Axis.getAxis().options.enableZeroOffset) {
                    if (yAxisRange[0] > 0 && yAxisRange[1] > 0) {
                        yAxisRange[0] = 0;
                    } else if (yAxisRange[0] < 0 && yAxisRange[1] < 0) {
                        yAxisRange[1] = 0;
                    }
                }
            }
        }

        // set up x axes using computed x domain
        let bottomAxis: D3Axis;
        let topAxis: D3Axis;

        for (let axisIdx in self._axes) {
            let alignment = self._axes[axisIdx].getAxis().alignment;
            if (alignment === Alignment.Top ||
                alignment === Alignment.Bottom) {
                let d3Axis = self._axes[axisIdx];
                d3Axis.commitRange(self._graphRect.width);
                if (alignment === Alignment.Bottom && !bottomAxis) {
                    bottomAxis = d3Axis;
                }
                if (alignment === Alignment.Top && !topAxis) {
                    topAxis = d3Axis;
                }
            }
        }

        // set up the scale axis, right now we only support a bottom axis
        if (bottomAxis) {
            self._scaleAxis = bottomAxis;
        } else if (topAxis) {
            self._scaleAxis = topAxis;
        }

        self._graphRect.width = self._scaleAxis.getRangePixels();
        if (self._scaleAxis.isBanded()) {
            self._maxGraphWidth = self._graphRect.width;
        }

        // setup y axes
        for (let i = 0; i < leftRightAxes.length; ++i) {
            let d3YAxis = leftRightAxes[i];

            let presetRange = d3YAxis.getAxis().axisDesc.range;
            if (presetRange && presetRange.min !== undefined) {
                d3YAxis.setDomain([presetRange.min, presetRange.max]);
            }

            if (!this._options.disableAutoResizeHeight && d3YAxis.isBanded()) {
                // self._minGraphHeight = Math.max(d3YAxis.getDomain().length * 15, self._minGraphHeight);
            }
        }

        // auto resize left/right margins if needed
        if (!this._options.disableAutoResizeWidth) {
            let rightMarginWidth = 0;
            let leftMarginWidth = 0;

            // add in left/right spacing due to axes
            let leftAxisWidth = 0;
            let rightAxisWidth = 0;
            for (let i = 0; i < leftRightAxes.length; ++i) {
                let d3YAxis = leftRightAxes[i];

                // just do commit so you can guess the values, the layout happens
                // in updateLayout
                d3YAxis.commitRange(self._options.height);
                d3YAxis.render();

                let axisWidth = 0;
                if (d3YAxis.getRenderedRect()) {
                    axisWidth = d3YAxis.getRenderedRect().width + self.AXIS_PADDING.X;
                }

                if (d3YAxis.getAxis().alignment === Alignment.Right) {
                    rightAxisWidth += axisWidth;
                } else {
                    leftAxisWidth += axisWidth;
                }
            }

            rightMarginWidth = Math.max(rightAxisWidth, rightMarginWidth);
            leftMarginWidth = Math.max(leftAxisWidth, leftMarginWidth);

            // add in left/right spacing due to legends
            // guess the size of the legend.  We could render and then
            // get actual legend but self is much faster with lots of data
            let legendChars = 0;
            for (let seriesIdx = 0; seriesIdx < layers.length; ++seriesIdx) {
                let layer: ILayer = layers[seriesIdx];
                let decimationChars = 0;

                if ((layer as any).decimator) {
                    decimationChars = (layer as any).decimator.getName().length;
                }

                let d3Series = self._seriesMap.get(layer);
                for (let i = 0; i < layer.data.length; ++i) {
                    let nameChars = d3Series.getName().length;
                    if (d3Series.hasOwnProperty('getMaxNameLength')) {
                        nameChars = (d3Series as any).getMaxNameLength();
                    }
                    legendChars = Math.max(nameChars + decimationChars, legendChars);
                }
            }

            let legendWidth: number = 0;
            for (let legendIdx = 0; legendIdx < self._legends.length; ++legendIdx) {
                let d3Legend = self._legends[legendIdx];
                legendWidth = legendChars * 8 + 10;

                if (d3Legend.getAlignment() === Alignment.Left) {
                    leftMarginWidth += Math.max(legendWidth, leftTitleWidth);
                }
                if (d3Legend.getAlignment() === Alignment.Right) {
                    rightMarginWidth += legendWidth;
                }
            }

            // check if the axes need to be wider which means we need to
            // replot the graphs to fit into a smaller width
            if (!legends.hasOwnProperty(Alignment.Left.toString())) {
                leftMarginWidth += leftTitleWidth;
            }

            if (leftMarginWidth > self._options.leftMargin ||
                rightMarginWidth > self._options.rightMargin) {
                self._options.leftMargin = Math.max(leftMarginWidth, self._options.leftMargin);
                self._options.rightMargin = Math.max(rightMarginWidth, self._options.rightMargin);
                self._requiresRelayout = true;
            }

            if (self._requiresRelayout) {
                self.createLayout();
                return;
            }
        }

        if (!self._scaleAxis.isBanded()) {
            self._defaultXScale = self._scaleAxis.getScale().copy();
            self._defaultYScale = self._axes[1].getScale().copy();

            if (!this._options.disableZoomViewUpdate && !self._options.disableZoomMouseWheel &&
                !this._options.enableXYZoom) {
                let onZoom = function () {
                    let xScale = d3.event.transform.rescaleX(self._defaultXScale);

                    let event = {
                        event: EventType.Zoom,
                        xStart: xScale.domain()[0],
                        xEnd: xScale.domain()[1],
                        caller: self._element
                    };
                    self.onZoomChanged(event);
                }
                self._zoom = d3.zoom()
                    .scaleExtent([1, Number.MAX_SAFE_INTEGER])
                    .on('zoom', onZoom)
                self.getGraphGroup().call(self._zoom);
            }
        }
    }

    /**
      * this sets the graph height to the options.height and grows
      * the svg height as other elements are added.
      */
    private updateLayout(options: IOptions) {
        let self = this;

        self.updateGraphRect();

        // special case when graph width is capped by max graph width
        self._options.rightMargin = self._svgRect.width -
            (self._graphRect.x + self._graphRect.width);

        // handle all the elements from top to bottom
        // adjust where the legends are drawn
        if (this._legends) {
            for (let legendIdx = 0; legendIdx < this._legends.length; ++legendIdx) {
                let d3Legend = this._legends[legendIdx];

                if (d3Legend.getAlignment() === Alignment.Top) {
                    d3Legend.setPosition(new Rect(self._graphRect.x,
                        self._options.topMargin, self._graphRect.width, 0));
                    if (!d3Legend.getRenderedRect()) {
                        d3Legend.setItems([{
                            key: 'dummy', color: 'white',
                            opacity: '1', shape: 'rect'
                        }]);
                        d3Legend.render();
                        d3Legend.setItems([]);
                    }
                    self._graphRect.y += d3Legend.getRenderedRect().height;
                }
            }
        }

        for (let key in self._axes) {
            let d3Axis = self._axes[key];

            if (d3Axis.getAxis().alignment === Alignment.Top) {
                d3Axis.commitRange(self._graphRect.width);
                if (!d3Axis.getAxis().hidden) {
                    d3Axis.setPosition(new Rect(self._graphRect.x, self._graphRect.y));
                    d3Axis.render();
                    self._graphRect.y += d3Axis.getRenderedRect().height;
                }
            }
        }

        // update the graph div translation if required
        self.getGraphGroup()
            .attr('transform', 'translate(' + self._graphRect.x + ',' + self._graphRect.y + ')');

        self._svgRect.height = self._graphRect.y + self._graphRect.height;
        let left = self._graphRect.x;
        let leftAxisWidth = 0;
        let rightAxisWidth = 0;
        // adjust where the axes are drawn
        for (let key in self._axes) {
            let d3Axis = self._axes[key];
            let rect: Rect;

            switch (d3Axis.getAxis().alignment) {
                case Alignment.Left:
                    rect = new Rect(self._graphRect.x - leftAxisWidth, self._graphRect.y);
                    d3Axis.commitRange(self._graphRect.height);
                    break;
                case Alignment.Right:
                    rect = new Rect(self._graphRect.x + self._graphRect.width + rightAxisWidth,
                        self._graphRect.y);
                    d3Axis.commitRange(self._graphRect.height);
                    break;
                case Alignment.Bottom:
                    rect = new Rect(self._graphRect.x,
                        self._graphRect.y + self._graphRect.height);
                    d3Axis.commitRange(self._graphRect.width);
                    break;
            }

            // weird thing here when we do an update layout to fix legend spacing we
            // need to make sure the scale is right for any zoomed state
            let xScale = self._scaleAxis.getScale();
            if (self._scaleAxis.getAxis().axisDesc.scaleType === AxisType.Logarithmic &&
                self._options.xStart < 1) {
                self._options.xStart = 1;
                xScale.domain([self._options.xStart, self._options.xEnd]);
            }
            if (!this._options.disableZoomViewUpdate &&
                self._options.hasOwnProperty('xStart') && self._options.xStart !== undefined &&
                self._options.hasOwnProperty('xEnd') && self._options.xEnd !== undefined) {
                xScale.domain([self._options.xStart, self._options.xEnd]);
            }

            if (this._options.enableXYZoom) {
                let yAxis = self._axes[1];
                let yScale = yAxis.getScale();
                if (yAxis.getAxis().axisDesc.scaleType === AxisType.Logarithmic &&
                    self._options.yStart < 1) {
                    self._options.yStart = 1;
                    yScale.domain([self._options.yEnd, self._options.yStart]);
                }
                if (!this._options.disableZoomViewUpdate &&
                    self._options.hasOwnProperty('yStart') && self._options.yStart !== undefined &&
                    self._options.hasOwnProperty('yEnd') && self._options.yEnd !== undefined) {
                    yScale.domain([options.yEnd, options.yStart]);
                }
            }

            if (!d3Axis.getAxis().hidden) {
                d3Axis.setPosition(rect);
                d3Axis.render();

                let width = d3Axis.getRenderedRect().width;
                switch (d3Axis.getAxis().alignment) {
                    case Alignment.Left:
                        leftAxisWidth += width + self.AXIS_PADDING.X;
                        left = left - width;
                        break;
                    case Alignment.Right:
                        rightAxisWidth += width + self.AXIS_PADDING.X
                        break;
                    case Alignment.Bottom:
                        self._svgRect.height += d3Axis.getRenderedRect().height;
                        break;
                }
            }
        }

        // adjust lane title
        if (self._title && self._title.getRenderedRect()) {
            let titleXOffset = self._graphRect.x - leftAxisWidth -
                self._title.getRenderedRect().width - 10;
            titleXOffset = Math.max(0, titleXOffset);

            self._title.setPosition(new Rect(titleXOffset, self._graphRect.y, 0,
                self._graphRect.height));
            self._title.render();
        }

        // adjust where the legends are drawn
        if (this._legends) {
            for (let legendIdx = 0; legendIdx < this._legends.length; ++legendIdx) {
                let d3Legend = this._legends[legendIdx];

                switch (d3Legend.getAlignment()) {
                    case Alignment.Left:
                        d3Legend.setPosition(new Rect(0, self._graphRect.y, 0, self._graphRect.height));
                        break;
                    case Alignment.Right:
                        d3Legend.setPosition(
                            new Rect(self._graphRect.x + self._graphRect.width +
                                rightAxisWidth + self.LEGEND_PADDING.X,
                                self._graphRect.y, 0, self._graphRect.height));
                        break;
                    case Alignment.Bottom:
                        d3Legend.setPosition(new Rect(self._graphRect.x,
                            self._svgRect.height + self.LEGEND_PADDING.Y.BOTTOM,
                            self._graphRect.width, 0));

                        if (!d3Legend.getRenderedRect()) {
                            d3Legend.setItems([{
                                key: 'dummy', color: 'white',
                                opacity: '1', shape: 'rect'
                            }]);
                            d3Legend.render();
                            self._svgRect.height += self.LEGEND_PADDING.Y.BOTTOM +
                                d3Legend.getRenderedRect().height;
                            d3Legend.setItems([]);
                        } else {
                            d3Legend.render();
                            self._svgRect.height += self.LEGEND_PADDING.Y.BOTTOM +
                                d3Legend.getRenderedRect().height;
                        }
                        break;
                }

                // render called in the acutal render function for legends since
                // we have to render the items before we can get their coloring
            }
        }
        if (this._hoverLine) {
            this._hoverLine.remove();
        }
        this._hoverLine = this._svg.append('line')
            .attr('class', 'hover-line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', this._graphRect.y - this._options.topMargin)
            .attr('y2', this._graphRect.y + this._graphRect.height +
                this._options.bottomMargin)
            .attr('stroke', '#222222')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none')
            .style('display', 'none');

        // update the svg height/width
        self._svgRect.height += self._options.bottomMargin;
        self._svg
            .attr('width', self._svgRect.width)
            .attr('height', self._svgRect.height);

        self._graphSvg
            .on('mouseover', self.cursorEnter)
            .on('mousemove', self.cursorMove)
            .on('mouseout', self.cursorExit)
            .attr('width', self._graphRect.width)
            .attr('height', self._graphRect.height);

        // update the background to hide anything behind the chart
        if (self._backgroundSVG) {
            self._backgroundSVG
                .attr('x', left)
                .attr('y', 0)
                .attr('width', self._svgRect.x + self._svgRect.width - left)
                .attr('height', self._svgRect.height);
        }

        self.updateHandles();
    }

    /**
      * this sets the total view height to the options.height and shrinks
      * the graph height so the view fits into the specified number of pixels
      * so we start subtracing height from the graph.  Other margins are ok..
      */
    private updateLayoutToFit(options: IOptions) {
        // update the svg height/width
        let self = this;

        self.updateGraphRect();

        // update the svg height/width
        self._svgRect.height = this._options.height;

        self._graphRect.height -= self._options.topMargin;
        self._graphRect.height -= self._options.bottomMargin;

        /////////////////////////////////////////////////////////////////
        // draw the top stuff and shrink the useable graph size
        /////////////////////////////////////////////////////////////////
        if (this._legends) {
            for (let legendIdx = 0; legendIdx < this._legends.length; ++legendIdx) {
                let d3Legend = this._legends[legendIdx];

                if (d3Legend.getAlignment() === Alignment.Top) {
                    d3Legend.setPosition(new Rect(self._graphRect.x,
                        self._options.topMargin, self._graphRect.width, 0));
                    if (!d3Legend.getRenderedRect()) {
                        d3Legend.setItems([{
                            key: 'dummy', color: 'white',
                            opacity: '1', shape: 'rect'
                        }]);
                        d3Legend.render();
                        d3Legend.setItems([]);
                    }
                    self._graphRect.y += d3Legend.getRenderedRect().height;
                    self._graphRect.height -= d3Legend.getRenderedRect().height;
                }
            }
        }

        for (let key in self._axes) {
            let d3Axis = self._axes[key];

            if (d3Axis.getAxis().alignment === Alignment.Top) {
                d3Axis.commitRange(self._graphRect.width);
                if (!d3Axis.getAxis().hidden) {
                    d3Axis.setPosition(new Rect(self._graphRect.x, self._graphRect.y));
                    d3Axis.render();
                    self._graphRect.y += d3Axis.getRenderedRect().height;
                    self._graphRect.height -= d3Axis.getRenderedRect().height;
                }
            }
        }

        // update the graph div translation if required
        self.getGraphGroup()
            .attr('transform', 'translate(' + self._graphRect.x + ',' + self._graphRect.y + ')');

        /////////////////////////////////////////////////////////////////
        // draw the bottom stuff and shrink the useable graph size
        /////////////////////////////////////////////////////////////////
        for (let legendIdx = 0; legendIdx < this._legends.length; ++legendIdx) {
            let d3Legend = this._legends[legendIdx];

            if (d3Legend.getAlignment() === Alignment.Bottom) {
                d3Legend.setPosition(new Rect(self._graphRect.x,
                    self._svgRect.height + self.LEGEND_PADDING.Y.BOTTOM,
                    self._graphRect.width, 0));

                if (!d3Legend.getRenderedRect()) {
                    d3Legend.setItems([{
                        key: 'dummy', color: 'white',
                        opacity: '1', shape: 'rect'
                    }]);
                    d3Legend.render();
                    d3Legend.setItems([]);
                } else {
                    d3Legend.render();
                }
                self._graphRect.height -= self.LEGEND_PADDING.Y.BOTTOM +
                    d3Legend.getRenderedRect().height;
                d3Legend.setPosition(new Rect(self._graphRect.x,
                    self._svgRect.height - d3Legend.getRenderedRect().height -
                    self.LEGEND_PADDING.Y.BOTTOM,
                    self._graphRect.width, 0));
                d3Legend.render();
            }
        }

        for (let key in self._axes) {
            let d3Axis = self._axes[key];
            let rect: Rect;

            if (d3Axis.getAxis().alignment === Alignment.Bottom) {
                rect = new Rect(self._graphRect.x,
                    self._graphRect.y + self._graphRect.height);
                d3Axis.commitRange(self._graphRect.width);

                if (!d3Axis.getAxis().hidden) {
                    d3Axis.setPosition(rect);
                    d3Axis.render();

                    let width = d3Axis.getRenderedRect().width;
                    self._graphRect.height -= d3Axis.getRenderedRect().height;
                    rect = new Rect(self._graphRect.x,
                        self._graphRect.y + self._graphRect.height);
                    d3Axis.setPosition(rect);
                    d3Axis.render();
                    break;
                }
            }
        }

        // adjust where the vertical axes are drawn.  The size of these may be
        // shrunk based on bottom axes
        let left = self._graphRect.x;
        let leftAxisWidth = 0;
        let rightAxisWidth = 0;
        for (let key in self._axes) {
            let d3Axis = self._axes[key];
            let rect: Rect;
            let width: number;

            switch (d3Axis.getAxis().alignment) {
                case Alignment.Left:
                    rect = new Rect(self._graphRect.x, self._graphRect.y);
                    d3Axis.commitRange(self._graphRect.height);
                    d3Axis.setPosition(rect);
                    d3Axis.render();
                    width = d3Axis.getRenderedRect().width;
                    leftAxisWidth += width;
                    left = left - width;
                    break;
                case Alignment.Right:
                    rect = new Rect(self._graphRect.x + self._graphRect.width,
                        self._graphRect.y);
                    d3Axis.commitRange(self._graphRect.height);
                    d3Axis.setPosition(rect);
                    d3Axis.render();
                    width = d3Axis.getRenderedRect().width;
                    rightAxisWidth += width;
                    break;
            }
        }

        // adjust lane title
        if (self._title.getRenderedRect()) {
            let titleXOffset = self._graphRect.x - leftAxisWidth -
                self._title.getRenderedRect().width - 10;
            titleXOffset = Math.max(0, titleXOffset);

            self._title.setPosition(new Rect(titleXOffset, self._graphRect.y, 0,
                self._graphRect.height));
            self._title.render();
        }

        // adjust where the legends are drawn
        for (let legendIdx = 0; legendIdx < this._legends.length; ++legendIdx) {
            let d3Legend = this._legends[legendIdx];

            switch (d3Legend.getAlignment()) {
                case Alignment.Left:
                    d3Legend.setPosition(new Rect(0, self._graphRect.y, 0, 0));
                    break;
                case Alignment.Right:
                    d3Legend.setPosition(
                        new Rect(self._graphRect.x + self._graphRect.width +
                            rightAxisWidth + self.LEGEND_PADDING.X,
                            self._graphRect.y, 0, 0));
                    break;
            }

            // render called in the acutal render function for legends since
            // we have to render the items before we can get their coloring
        }

        if (this._hoverLine) {
            this._hoverLine.remove();
        }
        this._hoverLine = this._svg.append('line')
            .attr('class', 'hover-line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', this._graphRect.y - this._options.topMargin)
            .attr('y2', this._graphRect.y + this._graphRect.height +
                this._options.bottomMargin)
            .attr('stroke', '#222222')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none')
            .attr('transform', function () {
                return 'translate(-10,0)';
            });

        self._svg
            .attr('width', self._svgRect.width)
            .attr('height', self._svgRect.height);

        // update the background to hide anything behind the chart
        if (self._backgroundSVG) {
            self._backgroundSVG
                .attr('x', left)
                .attr('y', 0)
                .attr('width', self._svgRect.x + self._svgRect.width - left)
                .attr('height', self._svgRect.height);
        }

        self.updateHandles();
    }

    private addZoomContextMenuItem(title: string, func: () => void) {
        let self = this;

        let zoomMenuItem = {
            title: title,
            action: function (elem: any, data: any, index: number) {
                func();
            },
            disabled: false // optional, defaults to false
        };

        self._contextMenuItems.push(zoomMenuItem);
    }

    private updateZoomFunctions() {
        let self = this;

        // how much of left and right to remove percent-wise when zooming
        let zoomInFactor = .3;

        // zoom out scale is computed to make sure zoom in->zoom out gives you origial view
        let percentageOfNewViewVsOldRange = (1 - zoomInFactor * 2);
        let zoomOutFactor = zoomInFactor / percentageOfNewViewVsOldRange;

        let xStart = self._options.xStart ? self._options.xStart : self._xMin;
        let xEnd = self._options.xEnd ? self._options.xEnd : self._xMax;
        let range = xEnd - xStart;

        let element = self._element as IChart;
        if (!element.api) {
            element.api = {}
        }

        element.api.zoomReset = function () {
            let zoomEvent = {
                caller: self._element,
                event: EventType.Zoom,
                xStart: undefined,
                xEnd: undefined,
                yStart: undefined,
                yEnd: undefined
            };
            self.onZoomChanged(zoomEvent);
        }

        element.api.zoomIn = function () {
            let zoomEvent = {
                caller: self._element,
                event: EventType.Zoom,
                xStart: xStart + range * zoomInFactor,
                xEnd: xEnd - range * zoomInFactor,
                yStart: self._options.yStart,
                yEnd: self._options.yEnd
            };
            self.onZoomChanged(zoomEvent);
        }

        let zoomOutStart = xStart - range * zoomOutFactor;
        let zoomOutEnd = xEnd + range * zoomOutFactor;
        element.api.zoomOut = function () {
            let zoomEvent = {
                caller: self._element,
                event: EventType.Zoom,
                xStart: self._xMin > zoomOutStart ? self._xMin : zoomOutStart,
                xEnd: self._xMax < zoomOutEnd ? self._xMax : zoomOutEnd,
                yStart: self._options.yStart,
                yEnd: self._options.yEnd
            };
            self.onZoomChanged(zoomEvent);
        }
    }

    private createZoomMenuItems() {
        let self = this;
        let element = self._element as IChart;
        if (!element.api) {
            element.api = {}
        }

        let canZoomOut = !(self._options.xStart === undefined && self._options.xEnd === undefined) &&
            ((self._options.xStart && self._options.xStart !== self._xMin) ||
                (self._options.xEnd && self._options.xEnd !== self._xMax));
        if (canZoomOut) {
            self.addZoomContextMenuItem('Reset Zoom', element.api.zoomReset);
        }

        if (canZoomOut) {
            // range only exists if we are already zoomed in
            self.addZoomContextMenuItem('Zoom Out', element.api.zoomOut);
        }

        if (!self._options.disableZoomViewUpdate) {
            self.addZoomContextMenuItem('Zoom In', element.api.zoomIn);
        }
    }

    private updatePanFunctions() {
        let self = this;

        let element = self._element as IChart;
        if (!element.api) {
            element.api = {}
        }

        element.api.panLeft = function () {
            console.log('Either start or end is undefined for pannning');
        }
        element.api.panRight = function () {
            console.log('Either start or end is undefined for pannning');
        }

        // both start end have to be defined to pan
        if (self._options.xStart && self._options.xEnd) {
            let xStart = self._options.xStart ? self._options.xStart : self._xMin;
            let xEnd = self._options.xEnd ? self._options.xEnd : self._xMax;
            let range = xEnd - xStart;

            let panAmount = range / 10;

            let panLeftStart = self._options.xStart - panAmount;
            let panLeftEnd = self._options.xEnd - panAmount;
            if (panLeftStart < self._xMin) {
                panLeftStart = self._xMin;
                panLeftEnd = self._xMin + range;
            }

            element.api.panLeft = function () {
                let zoomEvent = {
                    caller: self._element,
                    event: EventType.Zoom,
                    xStart: panLeftStart,
                    xEnd: panLeftEnd
                };
                self.onZoomChanged(zoomEvent);
            }

            let panRightStart = self._options.xStart + panAmount;
            let pandRightEnd = self._options.xEnd + panAmount;
            if (pandRightEnd > self._xMax) {
                panRightStart = self._xMax - range;
                pandRightEnd = self._xMax;
            }
            element.api.panRight = function () {
                let zoomEvent = {
                    caller: self._element,
                    event: EventType.Zoom,
                    xStart: panRightStart,
                    xEnd: pandRightEnd
                };
                self.onZoomChanged(zoomEvent);
            }
        }
    }

    /**
     * Render the graph
     *
     * @param the options to render
     */
    public render(options?: IOptions) {
        let self = this;
        let chart = self._element as ICartesianChart;

        if (chart.dataSets.length === 0) {
            throw 'Error no data in the chart';
        }

        // load the graph layout parameters
        self.loadOptions(options);

        // update the layout of things that just need to be moved/resized
        if (this._options.fitToWindow) {
            self.updateLayoutToFit(options);
        } else {
            self.updateLayout(options);
        }

        // clear context menu
        self._contextMenuItems = [];

        // set the new axis domain so it can scale the data correctly
        if (!self._scaleAxis.isBanded()) {
            self.updatePanFunctions();
            self.updateZoomFunctions();
            self.createZoomMenuItems();

            let xScale = self._scaleAxis.getScale();
            let yScale = self._axes[1].getScale();
            if (self._scaleAxis.getAxis().axisDesc.scaleType === AxisType.Logarithmic &&
                self._options.xStart < 1) {
                self._options.xStart = 1;
                xScale.domain([self._options.xStart, self._options.xEnd]);
            }
            if (!this._options.disableZoomViewUpdate &&
                self._options.hasOwnProperty('xStart') && self._options.xStart !== undefined &&
                self._options.hasOwnProperty('xEnd') && self._options.xEnd !== undefined) {
                xScale.domain([self._options.xStart, self._options.xEnd]);
            } else {
                xScale.domain(self._scaleAxis.getDomain());
            }
            this.updateD3ZoomState(xScale.domain()[0], xScale.domain()[1], yScale.domain()[0], yScale.domain()[1]);

            self._scaleAxis.render();
        }

        if (chart.contextMenuItems) {
            for (let i = 0; i < chart.contextMenuItems.length; ++i) {
                self._contextMenuItems.push(chart.contextMenuItems[i]);
            }
        }

        if (self._options.enableSaveAsImage) {
            let saveImageItem = {
                title: 'Save As Image',
                action: function (elem: any, data: any, index: number) {
                    self.saveImage();
                },
                disabled: false // optional, defaults to false
            };

            self._contextMenuItems.push(saveImageItem);
        }
        self._element.api.saveImage = self.saveImage;
        self._element.api.createImage = self.createImage;

        if (self._contextMenuItems.length > 0) {
            self.getGraphGroup()
                .on('contextmenu', self.contextMenu(self._contextMenuItems,
                    self._dataTooltip ? self._dataTooltip.onMouseLeave : undefined));
        }

        // enable brush for selection.  Last so it's on top.
        if (!self._options.disableBrush) {
            self.configureBrush();
        }
        self.configureCursorTracking();

        let legendItems: ILegendItem[] = [];

        // create a spinner so user knows data is loading
        if (self._loadingView) {
            self._loadingView.remove();
        }
        let radius = 10;
        let diameter = 20;
        self._loadingView = self._svg
            .append('g')
            .classed('progress-group', true)
            .attr('transform', 'translate(' + (self._graphRect.x + radius) + ',' +
                (self._graphRect.y + radius) + ')')
            .attr('pointer-events', 'none');

        if (!self._options.disableProgressSpinner) {
            new Spinner(self._loadingView,
                new Rect(self._graphRect.x, self._graphRect.y, diameter, diameter));
        }

        self._loadingView
            .append('text')
            .attr('x', radius)
            .attr('y', 2)
            .text('Loading...');

        for (let legendIdx = 0; legendIdx < self._legends.length; ++legendIdx) {
            let d3Legend = self._legends[legendIdx];
            d3Legend.render();
        }

        // first render before creating promises as that may take some time
        let layers = (self._element as ICartesianChart).dataSets;
        for (let seriesIdx = 0; seriesIdx < layers.length; ++seriesIdx) {
            let layer: ILayer = layers[seriesIdx];
            let d3Series = this._seriesMap.get(layer);
            // if we are using webworkers then rendered the last data in the new
            // zoom state so the user has some context.  If not using webworkers
            // skip this to just re-render as soon as possible
            if (d3Series && layer.enableWebWorkers) {
                d3Series.setData(layer);
                d3Series.render();
            }
        }

        let dataPromises: Promise<any>[] = [];
        for (let seriesIdx = 0; seriesIdx < layers.length; ++seriesIdx) {
            let layer: ILayer = layers[seriesIdx];

            let d3Series = this._seriesMap.get(layer);
            if (d3Series) {
                dataPromises.push(d3Series.decimateData(self._options.xStart, self._options.xEnd,
                    this._axes[layer.xAxisIdx], this._axes[layer.yAxisIdx]));
            }
        }

        Promise.all(dataPromises).then(function () {
            for (let seriesIdx = 0; seriesIdx < layers.length; ++seriesIdx) {
                let layer: ILayer = layers[seriesIdx];

                let d3Series = self._seriesMap.get(layer);
                if (d3Series) {
                    // check if we need to dynamically update the axis
                    if (layer.yAxisIdx !== undefined) {
                        let d3YAxis = self._axes[layer.yAxisIdx];
                        if (d3YAxis && d3YAxis.getAxis().enableDynamicRange) {
                            let scale = d3YAxis.getScale();

                            // TODO FIX HARDCODE FOR XYSERIES
                            if (d3Series instanceof XYSeries || d3Series instanceof XYGroupSeries) {
                                let domain: number[] = d3Series.getRenderedYRange();

                                // set the range for the data
                                scale.domain(domain);
                                d3YAxis.setDomain(domain);
                                d3YAxis.render();
                            }
                        }
                    }

                    d3Series.render();

                    if (!layer.hideInLegend) {
                        legendItems = legendItems.concat(d3Series.getLegendInfo());
                    }
                }
            }
            // add in a legend if requested
            for (let legendIdx = 0; legendIdx < self._legends.length; ++legendIdx) {
                let d3Legend = self._legends[legendIdx];

                if (d3Legend.getAlignment() === Alignment.Top ||
                    d3Legend.getAlignment() === Alignment.Bottom) {
                    let oldRowCount = d3Legend.getRows();
                    d3Legend.addItems(legendItems);
                    d3Legend.render();

                    let newRowCount = d3Legend.getRows();
                    if (oldRowCount !== newRowCount) {
                        if (self._options.fitToWindow) {
                            self.render(options);
                            return;
                        } else {
                            self.updateLayout(options);
                        }
                    }
                } else {
                    d3Legend.addItems(legendItems);
                    d3Legend.render();
                }
            }

            if (self._options.forceBrushToFront) {
                self._brush.moveToFront();
            }
            if (self._loadingView) {
                self._loadingView.remove();
                self._loadingView = undefined;
            }
        });
    }
}

import * as DecimatorWorker from 'worker-loader?inline&fallback=false!./decimator/worker';
import { XYSeries } from './series/xy';
import { XYGroupSeries } from './series/xy-group';

export function createDecimatorWorker(decimator: any, xStart: number, xEnd: number, xAxis: D3Axis,
    yAxis: D3Axis, values: any, names: any, resolve: any, reject: any): any {

    let worker: Worker;

    try {
        worker = new DecimatorWorker();
    } catch (error) {
        worker = new Worker('ui-widget-toolkit-decimator-worker.js');
    }
    let message: any = {
        decimatorName: decimator.getKey(),
        xDomain: xAxis.getScale().domain(),
        xRange: xAxis.getRangePixels(),
        xAxis: copy(xAxis.getAxis()),
        xStart: xStart,
        xEnd: xEnd,
        values: values,
        names: names
    };

    delete message.xAxis.options;

    if (yAxis !== undefined) {
        message.yDomain = yAxis.getScale().domain();
        message.yRange = yAxis.getRangePixels();
        message.yAxis = copy(yAxis.getAxis());
        delete message.yAxis.options;
    }

    worker.postMessage(message);
    worker.addEventListener("message", function (msg: any) {
        worker.terminate();
        resolve(msg.data);
    });
    worker.onerror = function (error) {
        worker.terminate();
        reject(error);
    }

    return worker;
}

D3Renderer.register(UIType.Cartesian, D3Chart);