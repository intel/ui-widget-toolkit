import {
    ICss, IEvent, UIElement, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import { IMinMaxValue } from '../../../interface/chart/series-data';
import { ILayer, RenderType } from '../../../interface/chart/chart'
import { getSelectionName } from '../../utilities';
import { D3Axis } from '../axis';
import { ID3Chart, D3Chart } from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';

import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';

let seriesTypeName = 'chart-min-max-value';

export class MinMaxSeries extends BaseSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return (layer.renderType & RenderType.MinMaxValue) !== 0;
    }

    protected _data: IMinMaxValue[];

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        super(chart, layer, xAxis, yAxis, false, svg);
        this.setData(layer);
    }

    public setData(layer: ILayer) {
        this._data = layer.data as IMinMaxValue[];
    }

    public isYContinuousSeries() {
        return true;
    }

    public getCss(): ICss {
        return undefined;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        let xMap = function (d: any): string[] {
            return [d.x];
        }

        let keys: { [index: string]: boolean } = {};
        for (let i = 0; i < this._data.length; ++i) {
            keys[this._data[i].x] = true;
        }
        return Object.keys(keys);
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        return [];
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        return [];
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        let yMinMax: number[] = [0, 0];
        if (this._data.length > 0) {
            yMinMax[0] = d3.min(this._data,
                function (value: IMinMaxValue): number {
                    return value.min;
                });

            yMinMax[1] = d3.max(this._data,
                function (value: IMinMaxValue): number {
                    return value.max;
                });
            yMinMax[0] = yMinMax[0] > 0 ? 0 : yMinMax[0];
        }
        return yMinMax;
    }

    /** decimate the data for the series or series group
     * @param xScale function to scale from values to x coord
     * @param yScale function to scale from values to y coord
     */
    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        let self = this;
        return new Promise<any>(function (resolve, reject) {
            self.setOutputData(self._data);
            resolve();
        });
    }

    /** get information for the legend to render */
    public getLegendInfo(): ILegendItem[] {
        let legendItems: ILegendItem[] = [];

        // disable legends for now
        // for (let i = 0; i < this._d3Elems.length; ++i) {
        //     let key = this._data[i].x;

        //     // there are default for area
        //     let colorAttr = 'fill';
        //     let shape = 'rect';
        //     legendItems.push({
        //         key: key,
        //         color: this._d3Elems[i].style(colorAttr) ? this._d3Elems[i].style(colorAttr) : this._d3Elems[i].attr(colorAttr),
        //         opacity: this._d3Elems[i].style('opacity') ? this._d3Elems[i].style('opacity') : this._d3Elems[i].attr('opacity'),
        //         shape: shape
        //     });
        // }
        return legendItems;
    }
    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let tooltipData: ITooltipData = { source: elem, group: '', metrics: {} };
        let yScalar = this.getYScalingInfo().baseScale.scalar;
        let yUnit = this.getYScalingInfo().baseScale.units;

        for (let index = 0; index < this._data.length; ++index) {
            let minMaxValue = this._data[index];
            if (minMaxValue.x === event.selection) {
                if (minMaxValue.min) {
                    tooltipData.metrics['Min'] =
                        (minMaxValue.min * yScalar).toFixed(2) + yUnit;
                }
                if (minMaxValue.max) {
                    tooltipData.metrics['Max'] =
                        (minMaxValue.max * yScalar).toFixed(2) + yUnit;
                }
                if (minMaxValue.y) {
                    tooltipData.metrics['Avg'] =
                        (minMaxValue.y * yScalar).toFixed(2) + yUnit;
                }
            }
        }
        return [tooltipData];
    }

    public render(): void {
        let self = this;

        for (let i = 0; i < this._d3Elems.length; ++i) {
            this._d3Elems[i].remove();
        }
        this._d3Elems = [];

        // If there's already data remove it
        let xScale = self._d3XAxis.getScale();
        let yScale = self._d3YAxis.getScale();

        // Build list of class names to apply
        let classes: string = this.getClassNames(seriesTypeName);
        if (this._layer.css) {
            for (let className in this._layer.css.classes) {
                classes += className + ' ';
            }
        }

        let color = self._d3Chart.getRenderer().getColorManager().getColor(self.getName());
        if (this._layer.css && this._layer.css.style &&
            this._layer.css.style.hasOwnProperty('color')) {
            color = this._layer.css.style['color'];
        }

        function xMap(d: IMinMaxValue) {
            return xScale(d.x) + xScale.bandwidth() / 2;
        }
        function yMap(d: IMinMaxValue) {
            if (d.y === undefined) {
                return d.y;
            }
            return yScale(d.y);
        }
        function yMinMap(d: IMinMaxValue) {
            if (d.min === undefined) {
                return d.min;
            }
            return yScale(d.min);
        }
        function yMaxMap(d: IMinMaxValue) {
            if (d.max === undefined) {
                return d.max;
            }
            return yScale(d.max);
        }

        // Append the circle onto the SVG
        //
        // Note that the circle color can be specified two ways; as an
        // SVG attribute, and as an inline style. Unfortunately, the SVG
        // attribute doesn't override styles specified by CSS classes. So we
        // use an inline style instead.

        let classFunc = function (d: any) {
            return getSelectionName(d.x);
        };
        let getRadius = function (d: any) {
            return d.y ? 2.5 : 0;
        }
        // add none so we don't actually select old stuff laying around
        let elem = self._d3svg.selectAll(this.getSelectionClasses(seriesTypeName)).data(this._data);
        elem
            .enter()
            .append('circle')
            .attr('class', classFunc)
            .classed(classes + ' chart-min-max-value', true)
            .attr('r', getRadius)
            .attr('cx', xMap)
            .attr('cy', yMap)
            .attr('fill', color)
            .attr('stroke', color)
            .each(function (d, i) {
                self._d3Elems.push(d3.select(this));
            })

        // Appending lines onto the SVG
        //
        // Note that here we hardcode the CSS class for min max value
        // Each line is appended independently and it overlays its corresponding average value 'circle',
        // because it is added after the circle. To change the overlay, change the order of rendering

        let animateDuration = self._d3Chart.getAnimateDuration();
        elem = self._d3svg.selectAll('.chart-min-max-value-line' + this.getSelectionClasses(seriesTypeName))
            .data(this._data)
            .enter()
            .append('line')
            .attr('class', classFunc)
            .classed(classes + ' chart-min-max-value-line', true)
            .attr('x1', xMap)      // x position of the first end of the line
            .attr('x2', xMap)      // x position of the second end of the line
            .attr('fill', color)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .attr('y1', yMap)       // y position of the bottom of the line
            .attr('y2', yMap)       // y position of the bottom of the line
            .each(function (d, i) {
                self._d3Elems.push(d3.select(this));
            })

        elem
            .transition()
            .duration(animateDuration)
            .attr('y1', yMinMap)   // y position of the bottom of the line
            .attr('y2', yMaxMap);  // y position of the top of the line

        this._d3Elems.push(elem);
        this._d3Chart.getOptions().disableBrush = true;
        this.configureItemInteraction(elem);

        this.applyStyles();
    }
}
D3Chart.register(MinMaxSeries);