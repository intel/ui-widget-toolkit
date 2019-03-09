import {
    ICss, IEvent, UIElement, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import { ISummaryValue } from '../../../interface/chart/series-data';
import { RenderType, ILayer } from '../../../interface/chart/chart'

import { ICartesianSeriesPlugin } from '../../../interface/chart/series';
import { getSelectionName } from '../../utilities';

import { addClickHelper } from '../../svg-helper';
import {
    ID3Chart, D3Chart, D3Axis, MAX_DISCRETE_WIDTH
} from '../chart';
import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';

export class VerticalBarSeries extends BaseSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return (layer.renderType & RenderType.Bar) !== 0;
    }

    protected _data: ISummaryValue[];
    protected _colors: { [index: string]: string };

    protected _hasLevels: boolean;
    protected _stackData: any[];
    protected _levelKeys: { [index: string]: boolean }[];
    protected _levelKeyList: string[][];
    protected _leafData: { [index: string]: { [index: string]: number }[] };

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        super(chart, layer, xAxis, yAxis, false, svg);
        if (layer.colors) {
            this._colors = layer.colors;
        } else {
            this._colors = {};
        }
        this._levelKeys = [];
        this._levelKeyList = [];
        this._leafData = {};

        this.setData(layer);
    }

    public setData(layer: ILayer) {
        this._data = layer.data as ISummaryValue[];
    }

    public isYContinuousSeries() {
        return true;
    }

    public getCss(): ICss {
        return undefined;
    }

    public getMaxName(): string {
        let name = '';
        this._levelKeyList.forEach((level) => {
            level.forEach((str) => {
                name = str.length > name.length ? str : name;
            })
        })
        return name;
    }

    public getLevelKeys(): string[][] {
        return this._levelKeyList;
    }

    // walk over the leafs in using a preorder traversal, get the keys for each
    // level and annotate the data with the path to that leaf data
    private static formatDataPerLevelHelper(levelKeys: { [index: string]: boolean }[],
        levelKeyList: string[][], leafData: { [index: string]: { [index: string]: number }[] },
        parentKeys: string[], value: ISummaryValue, level: number) {

        if (levelKeys.length <= level) {
            levelKeys[level] = {};
            levelKeyList[level] = [];
        }

        let myKeys = [];
        for (let j = 0; j < parentKeys.length; ++j) {
            myKeys[j] = parentKeys[j];
        }

        if (value.key) {
            myKeys.push(value.key);
            if (!levelKeys[level].hasOwnProperty(value.key)) {
                levelKeys[level][value.key] = true;
                levelKeyList[level].push(value.key);
            }
        }

        if (Array.isArray(value.data)) {
            for (let i = 0; i < value.data.length; ++i) {
                VerticalBarSeries.formatDataPerLevelHelper(levelKeys, levelKeyList, leafData,
                    myKeys, value.data[i], level + 1);
            }
        } else {
            let dataLevel = level + 1;
            if (levelKeys.length <= dataLevel) {
                levelKeys[dataLevel] = {};
                levelKeyList[dataLevel] = []
            };

            let data = value.data as any;
            for (let key in data) {
                if (key !== 'key' && key !== 'keys' &&
                    !levelKeys[dataLevel].hasOwnProperty(key)) {
                    levelKeys[dataLevel][key] = true;
                    levelKeyList[dataLevel].push(key);
                }
            }
            data.keys = myKeys;
            data.key = value.key;
            if (!leafData[value.key]) {
                leafData[value.key] = [];
            }
            leafData[value.key].push(data);
        }
    }

    // walk over the leafs in using a preorder traversal, get the keys for each
    // level and annotate the data with the path to that leaf data.  Then stack the leaf data
    public formatDataPerLevel(): void {
        this._levelKeys = [];
        this._levelKeyList = [];
        this._leafData = {};
        for (let i = 0; i < this._data.length; ++i) {
            VerticalBarSeries.formatDataPerLevelHelper(this._levelKeys,
                this._levelKeyList, this._leafData, [], this._data[i], 0);
        }

        this._stackData = [];

        let keys = this._levelKeyList[this._levelKeyList.length - 1];
        let stack = d3.stack().keys(keys);
        for (let key in this._leafData) {
            this._stackData.push(stack(this._leafData[key]));
        }
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        let keys: { [index: string]: boolean } = {};

        this._hasLevels = true;
        if (this._data.length === 1) {
            let params = this._data[0].data;
            let paramCount = Object.keys(params).length;
            this._hasLevels = paramCount === 1;
            this._hasLevels = this._hasLevels || (paramCount === 3 &&
                this._data[0].data.hasOwnProperty('key') &&
                this._data[0].data.hasOwnProperty('keys'));
        }

        if (this._hasLevels || this._layer.renderType & RenderType.Stacked) {
            this.formatDataPerLevel();
            for (let i = 0; i < this._data.length; ++i) {
                keys[this._data[i].key] = true;
            }
        } else {
            this._levelKeyList[0] = [];
            for (let i = 0; i < this._data.length; ++i) {
                for (let key in this._data[i].data as { [index: string]: number }) {
                    if (key !== 'key' && key !== 'keys') {
                        keys[key] = true;
                        this._levelKeyList[0].push(key);
                    }
                }
            }
            this._levelKeys[0] = keys;
        }
        return Object.keys(keys);
    }

    private static getBarsPerDomainHelper(value: ISummaryValue, isStacked: boolean): number {
        let ret: number = 0;
        if (Array.isArray(value.data)) {
            for (let i = 0; i < value.data.length; ++i) {
                ret += VerticalBarSeries.getBarsPerDomainHelper(value.data[i], isStacked)
            }
        } else {
            let data = value.data as { [index: string]: number };
            if (isStacked) {
                ret = 1;
            } else {
                for (let key in data) {
                    if (key !== 'key' && key !== 'keys') {
                        ++ret;
                    }
                }
            }
        }
        return ret;
    }

    // walk over the leafs in using a preorder traversal, get the # of
    // bars for each top level domain
    public getBarsPerDomain(isStacked: boolean): number {
        let maxBars = 0;
        if (this._data.length === 1 && !isStacked) {
            maxBars = 1;
        } else {
            for (let i = 0; i < this._data.length; ++i) {
                maxBars = Math.max(maxBars, VerticalBarSeries.getBarsPerDomainHelper(this._data[i], isStacked));
            }
        }
        return maxBars;
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        return [];
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        return [];
    }

    private static getYMinMaxHelper(yMinMax: number[], value: ISummaryValue, isStacked: boolean) {
        if (Array.isArray(value.data)) {
            for (let i = 0; i < value.data.length; ++i) {
                VerticalBarSeries.getYMinMaxHelper(yMinMax, value.data[i], isStacked)
            }
        } else {
            let data = value.data as { [index: string]: number };
            if (isStacked) {
                let val = 0;
                for (let key in data) {
                    if (key !== 'key' && key !== 'keys') {
                        val += data[key];
                    }
                }
                yMinMax[0] = Math.min(val, yMinMax[0])
                yMinMax[1] = Math.max(val, yMinMax[1])
            } else {
                for (let key in data) {
                    if (key !== 'key' && key !== 'keys') {
                        yMinMax[0] = Math.min(data[key], yMinMax[0])
                        yMinMax[1] = Math.max(data[key], yMinMax[1])
                    }
                }
            }
        }
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        let isStacked = (this._layer.renderType & RenderType.Stacked) !== 0;

        let yMinMax: number[] = [0, 0];
        for (let i = 0; i < this._data.length; ++i) {
            VerticalBarSeries.getYMinMaxHelper(yMinMax, this._data[i], isStacked);
        }

        return yMinMax;
    }

    /** decimate the data for the series or series group
     * @param xAxis representation of x-axis
     * @param yAxis representation of y-axis
     */
    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        let self = this;
        return new Promise<any>(function (resolve, reject) {
            self.setOutputData(self._data);
            resolve();
        });
    }

    public getTooltipMetricHelper(tooltipList: ITooltipData[], elem: UIElement,
        event: IEvent, value: ISummaryValue) {
        if (Array.isArray(value.data)) {
            for (let i = 0; i < value.data.length; ++i) {
                this.getTooltipMetricHelper(tooltipList, elem, event, value.data[i]);
            }
        } else {
            let yScalar = this.getYScalingInfo().baseScale.scalar;
            let yUnit = this.getYScalingInfo().baseScale.units;
            let data: any = value.data;
            if (data.keys[0] === event.selection) {
                let parentKeys = '';
                for (let keyIdx = 1; keyIdx < data.keys.length; ++keyIdx) {
                    // start at 1 because 0 is already in the tooltip as it's the selection
                    parentKeys += data.keys[keyIdx] + '-';
                }
                if (parentKeys.length > 0) {
                    parentKeys = parentKeys.substring(0, parentKeys.length - 1);
                }

                let tooltipData: ITooltipData = { source: elem, group: parentKeys, metrics: {} };
                for (let key in data) {
                    if (key !== 'key' && key !== 'keys') {
                        tooltipData.metrics[key] =
                            (data[key] * yScalar).toFixed(2) +
                            yUnit
                    }
                }
                tooltipList.push(tooltipData);
            }
        }
    }

    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let tooltipList: ITooltipData[] = [];
        let yScalar = this.getYScalingInfo().baseScale.scalar;
        let yUnit = this.getYScalingInfo().baseScale.units;

        // stacked bars
        if (this._hasLevels || this._layer.renderType & RenderType.Stacked) {
            for (let i = 0; i < this._data.length; ++i) {
                this.getTooltipMetricHelper(tooltipList, elem, event, this._data[i]);
            }
        } else {
            let tooltipData: ITooltipData = { source: elem, group: '', metrics: {} };
            for (let dataIdx = 0; dataIdx < this._data.length; ++dataIdx) {
                let data = this._data[dataIdx].data as { [index: string]: number };
                for (let key in data) {
                    if (key === event.selection) {
                        tooltipData.metrics[key] = (data[key] * yScalar).toFixed(2) +
                            yUnit
                    }
                }
            }
            tooltipList.push(tooltipData);
        }
        return tooltipList;
    }

    private static getLegendInfoHelper(keys: { [index: string]: boolean } = {},
        value: ISummaryValue) {
        if (Array.isArray(value.data)) {
            for (let i = 0; i < value.data.length; ++i) {
                VerticalBarSeries.getLegendInfoHelper(keys, value.data[i])
            }
        } else {
            let data = value.data as { [index: string]: number };
            for (let key in data) {
                if (key !== 'key' && key !== 'keys') {
                    keys[key] = true;
                }
            }
        }
    }

    /** get information for the legend to render */
    public getLegendInfo(): ILegendItem[] {
        let legendItems: ILegendItem[] = [];

        let keys: { [index: string]: boolean } = {};
        for (let i = 0; i < this._data.length; ++i) {
            VerticalBarSeries.getLegendInfoHelper(keys, this._data[i]);
        }

        for (let key in keys) {
            let elem = this._d3svg.selectAll('.' + getSelectionName(key));
            legendItems.push({
                key: key,
                color: elem.style('fill') ? elem.style('fill') : elem.attr('fill'),
                opacity: elem.style('opacity') ? elem.style('opacity') : elem.attr('opacity'),
                shape: 'rect'
            });
        }
        return legendItems;
    }

    private configureHover(elem: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        value: any) {
        let self = this;
        (elem.node() as any)['__data__'] = value;
        elem
            .on('mouseenter', function () {
                self._d3Chart.cursorEnter();
            })
            .on('mouseleave', function () {
                self._d3Chart.cursorExit();
            });

        let contextMenuItems = self._layer.contextMenuItems ?
            self._d3Chart.getContextMenuItems().concat(self._layer.contextMenuItems) :
            self._d3Chart.getContextMenuItems();

        addClickHelper(elem, self._layer.onClick, self._layer.onDoubleClick, contextMenuItems,
            self._d3Chart.getTooltip(), self._d3Chart.getElement(), value);
    }

    /** render all of the data in the series
     * @param svg the svg to draw the data in
     */
    public render(): void {
        let self = this;

        for (let i = 0; i < self._d3Elems.length; ++i) {
            self._d3Elems[i].remove();
        }

        self._d3Elems = [];

        let yScale = self._d3YAxis.getScale();
        let domain = yScale.domain();

        let axisLevels = this._d3XAxis.getLevelCount();
        let scales = [];
        for (let i = 0; i < axisLevels; ++i) {
            scales.push(self._d3XAxis.getScale(i));
        }

        // Build list of class names to apply
        let classes = self.getClassNames('chart-bar');
        if (self._layer.css) {
            for (let className in self._layer.css.classes) {
                classes += className + ' ';
            }
        }

        // set up the shared things all types will need
        let isStacked: boolean = false;
        if (self._layer.renderType & RenderType.Stacked) {
            classes += ' chart-stacked';
            isStacked = true;
        }

        let color = self._d3Chart.getRenderer().getColorManager().getColor(self.getName());
        if (self._layer.css && self._layer.css.style &&
            self._layer.css.style.hasOwnProperty('color')) {
            color = self._layer.css.style['color'];
        }

        // now render the data
        let animateDuration = self._d3Chart.getAnimateDuration();
        let seriesData = self._data;
        if (seriesData.length > 0) {
            let data: any;
            let elemWidth = Math.min(
                scales[0].bandwidth(),
                MAX_DISCRETE_WIDTH);

            // first find zero which may be anywhere
            let yStart: number;
            if (domain[0] >= 0) {
                yStart = yScale(domain[0]);
            } else if (domain[1] <= 0) {
                yStart = yScale(domain[1]);
            } else if (domain[0] < 0 && domain[1] > 0) {
                yStart = yScale(0);
            }

            // in this case we have multiple data bars per domain
            let graphHeight = yScale.range()[0];
            if (isStacked) {
                for (let i = 0; i < this._stackData.length; ++i) {
                    let dataPerKey = this._stackData[i];
                    for (let j = 0; j < dataPerKey.length; ++j) {
                        let key = dataPerKey[j].key;
                        let sanitizedKey = getSelectionName(key);
                        if (!self._colors || !self._colors.hasOwnProperty(key)) {
                            self._colors[key] =
                                self._d3Chart.getRenderer().getColorManager().getColor(key);
                        }

                        for (let k = 0; k < dataPerKey[j].length; ++k) {
                            let leafData = dataPerKey[j][k];
                            let yMin = yScale(leafData[0]);
                            if (isNaN(leafData[1])) {
                                continue;
                            }
                            let yMax = yScale(leafData[1]);

                            // don't draw bars with 0 height
                            let parentKeys = '';
                            for (let keyIdx = 0; keyIdx < leafData.data.keys.length; ++keyIdx) {
                                parentKeys += ' ' + getSelectionName(leafData.data.keys[keyIdx])
                            }

                            let x = 0;
                            for (let level = 0; level < leafData.data.keys.length; ++level) {
                                x += scales[level](leafData.data.keys[level])
                            }

                            let elem = self._d3svg.append('rect')
                                .attr('x', x)
                                .attr('width', scales[leafData.data.keys.length - 1].bandwidth() - 1)
                                .attr('class', parentKeys + ' ' + sanitizedKey)
                                .classed(classes, true)
                                .attr('fill', self._colors[key])
                                .attr('y', yScale(domain[0]))
                                .attr('height', 0);

                            elem.transition('add')
                                .duration(animateDuration)
                                .attr('y', yMax)
                                .attr('height', yMin - yMax);

                            self.configureHover(elem, leafData.data);
                            self._d3Elems.push(elem);
                        }
                    }
                }
            } else {
                // this is just a helper to animate bars
                let renderBar = (elem: any, value: number) => {
                    let yOffset = yScale(value);
                    let y = 0;
                    let height = 0;
                    if (value > 0) {
                        y = yOffset;
                        height = yStart - yOffset;
                    } else {
                        y = yStart;
                        height = yOffset - yStart;
                    }

                    elem.transition('add')
                        .duration(animateDuration)
                        .attr('y', y)
                        .attr('height', height);
                }

                if (this._hasLevels) {
                    let keys = this._levelKeyList[this._levelKeyList.length - 1];
                    for (let i = 0; i < keys.length; ++i) {
                        let key = keys[i];
                        let sanitiedKey = getSelectionName(key);
                        if (!self._colors || !self._colors.hasOwnProperty(key)) {
                            self._colors[key] =
                                self._d3Chart.getRenderer().getColorManager().getColor(key);
                        }

                        for (let j = 0; j < self._data.length; ++j) {
                            let leafData = self._data[j] as any;
                            let groupName = leafData.key;
                            let sanitizedGroupName = getSelectionName(groupName);
                            if (!leafData.data.hasOwnProperty(key)) {
                                continue;
                            }

                            let x = 0;
                            for (let level = 0; level < leafData.data.keys.length; ++level) {
                                x += scales[level](leafData.data.keys[level])
                            }
                            x += scales[scales.length - 1](key);

                            let elem = self._d3svg.append('rect')
                                .attr('x', x)
                                .attr('width', scales[scales.length - 1].bandwidth())
                                .attr('class', sanitizedGroupName + ' ' + sanitiedKey)
                                .classed(classes, true)
                                .attr('fill', self._colors[key])
                                .attr('y', yStart)
                                .attr('height', 0);

                            renderBar(elem, (leafData.data as { [index: string]: number })[key]);

                            self.configureHover(elem, leafData);
                            self._d3Elems.push(elem);
                        }
                    }
                } else {
                    let summary: { [index: string]: number } =
                        (self._data[0] as ISummaryValue).data as { [index: string]: number };

                    for (let key in summary) {
                        if (key !== 'key' && key !== 'keys') {
                            let barColor = color;
                            if (self._colors && self._colors.hasOwnProperty(key)) {
                                barColor = self._colors[key];
                            }

                            let elem = self._d3svg.append('rect')
                                .attr('x', scales[0](key))
                                .attr('width', elemWidth)
                                .attr('class', getSelectionName(key))
                                .attr('fill', barColor)
                                .classed(classes, true)
                                .attr('y', yStart)
                                .attr('height', 0);

                            renderBar(elem, summary[key]);

                            let data: { [index: string]: number } = {};
                            data[key] = summary[key];
                            self.configureHover(elem, data);
                            self._d3Elems.push(elem);
                        }
                    }
                }
            }
        }

        let xAxis = self._d3XAxis.getAxis();
        if (xAxis.options && xAxis.options.enableOrdinalBrushSelection) {
            for (let i = 0; i < self._d3Elems.length; ++i) {
                self.configureItemInteraction(self._d3Elems[i]);
            }
        }
        self.applyStyles();
    }
}
D3Chart.register(VerticalBarSeries);