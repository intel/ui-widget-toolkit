import { Alignment, EventType, IEvent, Rect, UIType } from '../../interface/ui-base';

import {
    IAxis, IScalingInfo, AxisType, IScalar, IRenderedAxis
} from '../../interface/chart/axis';

import { mergeKeys, SVGRenderer } from '../svg-helper';
import { D3Renderer } from '../renderer';
import { CustomDivTooltip } from '../tooltip';
import { showContextMenu } from '../context-menu';
import { D3Chart, getBoundedPixelValue } from './chart';

import * as d3 from 'd3';

export let MAX_DISCRETE_WIDTH = 50;

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

export function getScalar(info: IScalingInfo, range: number): IScalar {
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


        if (this._axis.axisDesc.scaleType === AxisType.Ordinal ||
            (this._axis.axisDesc.keys && this._axis.axisDesc.keys.length > 0)) {
            this._domain = [this._axis.axisDesc.keys];
            this._isBanded = true;
        } else {
            this._domain = [];
            let range = renderAxis.axisDesc.range;
            if (range && range.min !== undefined && range.max !== undefined) {
                this.setDomain([range.min, range.max]);
            }
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
        this.getScale().domain(domain);
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
        let domain = self._d3axes[0].scale().domain();
        let min = (domain ? domain[0] : 0) as number;
        let max = (domain ? domain[1] : 0) as number;

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

        let domain = self._d3axes[0].scale().domain();
        let min = (domain ? domain[0] : 0) as number;
        let max = (domain ? domain[1] : 0) as number;

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
                case AxisType.Logarithmic:
                    this.setLogrithmicCommitRange(pixels);
                    break;
                case AxisType.Linear:
                default:
                    this.setLinearCommitRange(pixels);
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
        this.cache.domain = this.getScale().domain();
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
        let domain = this._d3axes[0].scale().domain();
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
                        self._d3axes[0].tickFormat(this._formatter);
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

                node = self._axisSVG.node();
                axisRect = node.getBoundingClientRect();

                if (self._axisLabel) {
                    self._axisLabel
                        .attr('x', self._position.x)
                        .attr('y', self._position.y - axisRect.height - 20)
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

class D3AxisWrapper extends D3Chart {

    constructor(element: IAxis, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        // TODO DEEP COPY
        let wrapper = (element as any);
        wrapper.axes = [element];
        wrapper.dataSets = [];

        if (element.alignment === Alignment.Left || element.alignment === Alignment.Right) {
            console.log('Error: cannot render standalone left/right axes');
        } else {
            super(element, renderer, parent);

            this._hasBottomHandle = false;
            this._options.bottomMargin = this._options.bottomMargin ? this._options.bottomMargin : 1;
            this._options.height = 0;
            if (!element.axisDesc.range) {
                console.log('Error: standalone axis must have a specified range, defaulting to 0-100')
                this._xMin = 0;
                this._xMax = 100;
            } else {
                this._xMin = element.axisDesc.range.min;
                this._xMax = element.axisDesc.range.max;
            }
        }
    }

    public updateHandles() {
        let self = this;

        // update handle positions
        self._svg.select('.chart-handle.bottom')
            .attr('x', this._options.leftMargin + this._handleWidth)
            .attr('y', self._graphRect.y + self._graphRect.height)
            .attr('width', self._graphRect.width - this._handleWidth - this._handleWidth);

        // update handle positions
        self._svg.select('.chart-handle.left')
            .attr('x', this._options.leftMargin)
            .attr('y', 0)
            .attr('height', self._svgRect.height);

        // update handle positions
        self._svg.select('.chart-handle.right')
            .attr('x', self._svgRect.width - this._options.rightMargin - this._handleWidth)
            .attr('y', 0)
            .attr('height', self._svgRect.height);
    }

    protected configureCursorTracking(): void {
        let graphGroup = this._svg;
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
            .attr('width', this._svgRect.width)
            .attr('height', this._svgRect.height);

        // All further processing occurs in the callbacks
        return;
    }   // configureHoverLine

    protected addHoverline() {
        if (this._hoverLine) {
            this._hoverLine.remove();
        }
        this._hoverLine = this._svg.append('line')
            .attr('class', 'hover-line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', this._svgRect.height)
            .attr('stroke', '#222222')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none')
            .style('display', 'none');

        this._svg
            .on('mouseover', this.cursorEnter)
            .on('mousemove', this.cursorMove)
            .on('mouseout', this.cursorExit)
    }

    protected configureBrush(): void {
        this.configureBrushHelper(this._svg);
        this._svg.select('.brush')
            .attr('transform', `translate(${this._options.leftMargin}, 0)`);
    }

    protected configureZoom(): void {
        this.configureZoomHelper(this._svg);
    }

    protected updateZoom(xStart: number, xEnd: number, yStart: number, yEnd: number) {
        this.updateZoomHelper(this._svg, xStart, xEnd, yStart, yEnd);
    }

    protected configureContextMenu(): void {
        this._svg.on('contextmenu', this.contextMenu(this._contextMenuItems,
            this._dataTooltip ? this._dataTooltip.onMouseLeave : undefined));
    }

    protected configureTooltip(): void {
        let self = this;

        // Create the tooltip
        // delay is 0 because the tooltip crosses divs and with a delay it causes
        // flashing
        this._dataTooltip = new CustomDivTooltip(self._tooltipId, 'tooltip-t');
        this._dataTooltip
            .setTarget(self._svg)
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
}
D3Renderer.register(UIType.Axis, D3AxisWrapper);