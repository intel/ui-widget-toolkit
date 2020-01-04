import {
    ICss, IEvent, UIElement, ITooltipData, ILegendItem
} from '../../../interface/ui-base';
import { ICandlestickValue } from '../../../interface/chart/series-data';
import { ILayer, RenderType } from '../../../interface/chart/chart'
import { getSelectionName } from '../../utilities';
import { D3Axis } from '../axis';
import { ID3Chart, D3Chart } from '../chart';
import { addClickHelper } from '../../svg-helper';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';

import { BaseSeries } from './baseSeries';

import * as d3 from 'd3';

export class BoxPlotSeries extends BaseSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return (layer.renderType & RenderType.BoxPlot) !== 0;
    }

    protected _data: ICandlestickValue[];

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        super(chart, layer, xAxis, yAxis, false, svg);
        this.setData(layer);
    }

    public setData(layer: ILayer) {
        this._data = layer.data as ICandlestickValue[];
    }

    public isYContinuousSeries() {
        return true;
    }

    public getCss(): ICss {
        return undefined;
    }

    /** get all discrete x values */
    public getDiscreteXValues(): string[] {
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
                function (value: ICandlestickValue): number {
                    return value.min;
                });

            yMinMax[1] = d3.max(this._data,
                function (value: ICandlestickValue): number {
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

        addClickHelper(elem, self._layer.onClick, self._layer.onDoubleClick,
            self._contextMenuItems, self._d3Chart.getTooltip(),
            self._d3Chart.getElement(), value);
    }

    public getTooltipMetrics(elem: UIElement, event: IEvent): ITooltipData[] {
        let tooltipData: ITooltipData = { source: elem, group: '', metrics: {} };
        let yScalar = this.getYScalingInfo().baseScale.scalar;
        let yUnit = this.getYScalingInfo().baseScale.units;

        for (let index = 0; index < this._data.length; ++index) {
            let candleStickValue = this._data[index];
            if (candleStickValue.x === event.selection) {
                if (candleStickValue.min) {
                    tooltipData.metrics['Min'] =
                        (candleStickValue.min * yScalar).toFixed(2) + yUnit;
                }
                if (candleStickValue.max) {
                    tooltipData.metrics['Max'] =
                        (candleStickValue.max * yScalar).toFixed(2) + yUnit;
                }
                if (candleStickValue.y) {
                    tooltipData.metrics['y'] =
                        (candleStickValue.y * yScalar).toFixed(2) + yUnit;
                }
                if (candleStickValue.entry) {
                    tooltipData.metrics['entry'] =
                        (candleStickValue.entry * yScalar).toFixed(2) + yUnit;
                }

                if (candleStickValue.exit) {
                    tooltipData.metrics['exit'] =
                        (candleStickValue.exit * yScalar).toFixed(2) + yUnit;
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

        this.initializeContextMenuItems();

        // If there's already data remove it
        let xScale = self._d3XAxis.getScale();
        let yScale = self._d3YAxis.getScale();

        // Build list of class names to apply
        let classes: string = this.getClassNames('chart-box-plot');
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

        let classFunc = function (d: any) {
            return getSelectionName(d.x);
        };

        let animateDuration = self._d3Chart.getAnimateDuration();

        // Appending lines onto the SVG
        //
        // Note that here we hardcode the CSS class for min max value
        // Each line is appended independentlyand it overlays its corresponding average value 'circle',
        // because it is added after the circle. To change the overlay, change the order of rendering

        let xOffset = xScale.bandwidth() / 2;
        let xOffset2 = xScale.bandwidth() / 4;
        this._data.forEach((data) => {
            let xStart = xScale(data.x);
            let x = xStart + xOffset;
            let y = yScale(data.y);
            let verticalLine = self._d3svg
                .append('line')
                .attr('class', classFunc(data))
                .classed(classes + ' chart-box-plot-line', true)
                .attr('x1', x)      // x position of the first end of the line
                .attr('x2', x)      // x position of the second end of the line
                .attr('fill', color)
                .attr('stroke', color)
                .attr('stroke-width', 1)
                .attr('y1', y)       // y position of the bottom of the line
                .attr('y2', y);       // y position of the bottom of the line

            verticalLine
                .transition()
                .duration(animateDuration)
                .attr('y1', yScale(data.min))   // y position of the bottom of the line
                .attr('y2', yScale(data.max));  // y position of the top of the line

            this._d3Elems.push(verticalLine);
            this.configureItemInteraction(verticalLine);

            // add none so we don't actually select old stuff laying around
            let box = self._d3svg
                .append('rect')
                .attr('x', xStart)
                .attr('width', xScale.bandwidth)
                .attr('class', classFunc(data) + ' chart-box')
                .classed(classes, true)
                .attr('stroke', color)
                .attr('fill', 'white')
                .attr('y', y)
                .attr('height', 0);

            let yEntry = yScale(data.entry);
            let yExit = yScale(data.exit);
            let yRectTop = data.entry > data.exit ? yEntry : yExit;
            box
                .transition()
                .duration(animateDuration)
                .attr('y', yRectTop)   // y position of the bottom of the line
                .attr('height', Math.abs(yEntry - yExit));  // y position of the top of the line

            this._d3Elems.push(box);
            this.configureHover(box, data);

            let renderHorizontalLines = (end: number, offset: number) => {
                let endLine = self._d3svg
                    .append('line')
                    .attr('class', classFunc(data))
                    .classed(classes + ' chart-box-plot-line', true)
                    .attr('x1', x - offset)      // x position of the first end of the line
                    .attr('x2', x + offset)      // x position of the second end of the line
                    .attr('fill', color)
                    .attr('stroke', color)
                    .attr('stroke-width', 1)
                    .attr('y1', y)       // y position of the bottom of the line
                    .attr('y2', y);       // y position of the bottom of the line

                endLine
                    .transition()
                    .duration(animateDuration)
                    .attr('y1', yScale(end))   // y position of the bottom of the line
                    .attr('y2', yScale(end));  // y position of the top of the line

                this._d3Elems.push(endLine);
                this.configureItemInteraction(endLine);
            }
            renderHorizontalLines(data.min, xOffset2);
            renderHorizontalLines(data.max, xOffset2);
            renderHorizontalLines(data.y, xOffset);
        });

        this._d3Chart.getOptions().disableBrush = true;

        this.applyStyles();
    }
}
D3Chart.register(BoxPlotSeries);