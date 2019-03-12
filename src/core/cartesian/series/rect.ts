import {
    ICss, IEvent, UIElement, IBuffer, ITooltipData, ILegendItem, Alignment
} from '../../../interface/ui-base';
import {
    IXYRect
} from '../../../interface/chart/series-data';
import {
    RenderType, ILayer, IXYLayer, IRectSeries
} from '../../../interface/chart/chart'
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';
import { SimpleBuffer } from '../../utilities';

import { getKeys } from '../../svg-helper';
import {
    ID3Chart, D3Axis, D3Chart
} from '../chart';

import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';

let seriesTypeName = 'chart-rect';

export class RectSeries extends BaseSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return layer.data[0] && layer.data[0].hasOwnProperty('rects');
    }

    protected _data: IRectSeries;
    protected _values: IBuffer<IXYRect>;
    protected _classes: string;
    protected _layer: IXYLayer;
    protected _description: any;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>, xAxis: D3Axis, yAxis: D3Axis,
        isXContinuous: boolean) {

        super(chart, layer, xAxis, yAxis, isXContinuous, svg);

        // Build list of class names to apply
        this.setData(layer);
    }

    public setData(layer: ILayer) {
        this._data = layer.data[0] as IRectSeries;
        this._description = (layer.data[0] as IRectSeries).description;
        this._values = new SimpleBuffer(this._data.rects);
        this._classes = this.getClassNames(seriesTypeName);
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

    /** return the name of the series */
    public getName() {
        return this._data.name ? this._data.name : '';
    }

    /** check if this series is continuous */
    public isYContinuousSeries() {
        if (this._data.rects.length) {
            return !(isNaN((this._data.rects)[0].y) ||
                isNaN((this._data.rects)[0].y1));
        }
        return true;
    }

    public getCss(): ICss {
        return this._data.css;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        let xMap = function (d: any): string[] {
            return [d.x, d.x1];
        }

        let keys = getKeys(this._data.rects, xMap);
        return keys;
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        let yMap: (d: any) => any = function (d: any) {
            return [d.y, d.y1];
        }

        let keys = getKeys(this._data.rects, yMap);
        return keys.reverse();
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        let xMinMax: number[] = [Number.MAX_VALUE, Number.MIN_VALUE];
        let length = this._values.length();
        for (let i = 0; i < length; ++i) {
            xMinMax[0] = Math.min(xMinMax[0], this._values.get(i).x);
            xMinMax[1] = Math.max(xMinMax[1], this._values.get(i).x);
            xMinMax[0] = Math.min(xMinMax[0], this._values.get(i).x1);
            xMinMax[1] = Math.max(xMinMax[1], this._values.get(i).x1);
        }
        let scalar = this.getXScalingInfo().baseScale.scalar;
        xMinMax[0] = xMinMax[0] * scalar;
        xMinMax[1] = xMinMax[1] * scalar;

        return xMinMax;
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        let yMinMax: number[] = [Number.MAX_VALUE, Number.MIN_VALUE];

        let length = this._values.length();
        for (let i = 0; i < length; ++i) {
            yMinMax[0] = Math.min(yMinMax[0], this._values.get(i).y);
            yMinMax[1] = Math.max(yMinMax[1], this._values.get(i).y);
            yMinMax[0] = Math.min(yMinMax[0], this._values.get(i).y1);
            yMinMax[1] = Math.max(yMinMax[1], this._values.get(i).y1);
        }
        return yMinMax;
    }

    /** decimate the data for the series or series group
     * @param xAxis representation of x-axis
     * @param yAxis representation of y-axis
     */
    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        return new Promise<any>(function (resolve, reject) {
            resolve();
        });
    }

    /** fill in tooltip information  */
    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        return [];
    }

    /** get information for the legend to render */
    public getLegendInfo(): ILegendItem[] {
        let legendItems: ILegendItem[] = [];
        return legendItems;
    }

    /** maps a data value to a pixel value */
    protected xMap: (d: any) => number;
    protected yMap: (d: any) => number;


    /** render all of the data in the series
     * @param svg the svg to draw the data in
     */
    public render(): void {
        let self = this;

        self._d3Elems = [];

        // If there's already data remove it
        let xScale = self._d3XAxis.getScale();
        let yScale = self._d3YAxis.getScale();

        let xSeriesOffset = xScale.bandwidth ? xScale.bandwidth() / 2 : 0;
        let ySeriesOffset = yScale.bandwidth ? yScale.bandwidth() / 2 : 0;

        self.xMap = function (value: any) {
            return xScale(value) + xSeriesOffset;
        }
        self.yMap = function (value: any) {
            let yValue = yScale(value);
            if (yValue === undefined) {
                yValue = 0;
            }
            return yValue + ySeriesOffset;
        }

        let selectName = this.getSelectionClasses(seriesTypeName);

        let color: string;
        if (self._data.css) {
            color = self._data.css.style['color'];
        }
        if (!color) {
            color = self._d3Chart.getRenderer().getColorManager().getColor(self.getName());
        }

        let dataUpdate = self._d3svg.selectAll(selectName).data(this._data.rects);
        dataUpdate
            .enter()
            .append('rect')
            .classed(this._classes, true)
            .attr('fill', self._layer.renderType === RenderType.Area ? color : 'none')
            .attr('stroke', color)
            .each(function (d: any) {
                self.configureItemInteraction(d3.select(this));
            })
            .attr('x', function (d: any) { return self.xMap(d.x); })
            .attr('width', function (d: any) { return self.xMap(d.x1) - self.xMap(d.x); })
            .attr('y', function (d: any) { return self.yMap(d.y1); })
            .attr('height', function (d: any) { return self.yMap(d.y) - self.yMap(d.y1); })
            .each(function () {
                self._d3Elems.push(d3.select(this));
            })

        dataUpdate
            .attr('x', function (d: any) { return self.xMap(d.x); })
            .attr('width', function (d: any) { return self.xMap(d.x1) - self.xMap(d.x); })
            .attr('y', function (d: any) { return self.yMap(d.y1); })
            .attr('height', function (d: any) { return self.yMap(d.y) - self.yMap(d.y1); })

        if (this._description) {
            let text = self._d3svg.selectAll(self.getSelectionClasses(seriesTypeName) + '.' + self._layer.data[0].name).filter('text').data(this._data.rects);
            text.exit().remove();
            let enter = text.enter()
                .append('text')
                .classed(self._classes, true)
                .classed(self._layer.data[0].name, true)
                .text(function (d: any) { return self._description.text })
                .attr('dy', '-.5em')
                .attr('fill', color);

            let translate = (d: any) => {
                switch (self._description.alignment) {
                    case Alignment.Top:
                        return `translate(${self.xMap(d.x)}, ${self.yMap(d.y1)})`
                    case Alignment.Bottom:
                        return `translate(${self.xMap(d.x)}, ${self.yMap(d.y)})`
                    case Alignment.Left:
                        return `translate(${self.xMap(d.x)}, ${self.yMap(d.y)}) rotate(-90)`
                    case Alignment.Right:
                    default:
                        return `translate(${self.xMap(d.x1)}, ${self.yMap(d.y1)}) rotate(90)`
                }
            }
            enter.attr('transform', translate);
            text.attr('transform', translate);
        }
        self.applyStyles();
    }
}
D3Chart.register(RectSeries);