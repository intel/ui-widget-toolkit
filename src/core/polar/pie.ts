import { IEvent, IOptions, ITooltipData, UIType, UIElement } from '../../interface/ui-base';
import { IPolarSegment } from '../../interface/chart/decimator';
import { IPolarChart, IPieChart } from '../../interface/chart/chart';
import { getSelectionName } from '../utilities';
import * as d3 from 'd3';

import { D3Renderer } from '../renderer';
import { D3Polar } from './base';

export class D3Pie extends D3Polar {
    protected _arcData: IPolarSegment[];
    protected _renderData: IPolarSegment[];

    public getTooltipData(event: IEvent): ITooltipData[] {
        let pieChart = this._element as IPieChart;

        if (pieChart.data && pieChart.data.hasOwnProperty(event.selection)) {
            let units = (this._element as IPolarChart).units ? (this._element as IPolarChart).units : '';
            let tooltipMetrics: { [index: string]: string } = {};
            tooltipMetrics[event.selection] = pieChart.data[event.selection] + units;

            let ttList: ITooltipData[] = [{ source: pieChart, group: '', metrics: tooltipMetrics }];
            return ttList;
        }
        return [];
    }

    private getRenderData(): IPolarSegment[] {
        if (!this._renderData) {
            let self = this;
            this._renderData = Array.prototype.slice.call(this.getLegendData())
                .sort(function (a: any, b: any) {
                    if (self.getDataValue(a) > self.getDataValue(b)) {
                        return -1;
                    }
                    if (self.getDataValue(a) < self.getDataValue(b)) {
                        return 1;
                    }
                    return 0;
                });

            let total = 0;
            for (let i = 0; i < this._renderData.length; ++i) {
                total += this._renderData[i].rawData.value;
            }
            if (total > 0) {
                let percentToAngle = 2 * Math.PI;
                let sum = 0;
                let percentScalar = 1 / total;
                for (let i = 0; i < this._renderData.length; ++i) {
                    let percentage = this._renderData[i].rawData.value * percentScalar;
                    this._renderData[i].startAngle = sum * percentToAngle;
                    this._renderData[i].endAngle = (percentage + sum) * percentToAngle;
                    sum = percentage + sum;
                }
            }
        }
        return this._renderData;
    }

    protected getLegendData(): IPolarSegment[] {
        if (!this._arcData) {
            let pieChart = this._element as IPieChart;
            if (pieChart.colors) {
                for (let key in pieChart.colors) {
                    this._renderer.getColorManager().setColor(key, pieChart.colors[key]);
                }
            }

            this._arcData = [];
            for (let key in pieChart.data) {
                this._arcData.push({
                    outerRadius: 1,
                    innerRadius: pieChart.innerRadius ? pieChart.innerRadius : 0,
                    startAngle: 0,
                    endAngle: 0,
                    depth: 1,
                    rawData: { key: key, value: pieChart.data[key] }
                });
            }
        }
        return this._arcData;
    }

    protected renderData() {
        let self = this;

        let polarChart = this._element as IPolarChart;
        let classFunc = function (d: any) {
            let classes = self.getSegmentClasses(d.rawData);
            if (polarChart.category) {
                classes = getSelectionName(polarChart.category) + ' ' + classes;
            }
            if (polarChart.title) {
                classes = getSelectionName(polarChart.title) + ' ' + classes;
            }
            return classes;
        };

        let arcData: IPolarSegment[] = this.getRenderData();
        let colorMgr = self._renderer.getColorManager();
        let animateDuration = self.getAnimateDuration();
        let pieUpdate = self._graphArea.selectAll('.arc').data(arcData);

        let arcPath = pieUpdate
            .enter()
            .append('path')
            .attr('class', classFunc)
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.5)
            .attr('fill', function (d: any) {
                return colorMgr.getColor(self.getDataName(d.rawData))
            })
            .transition('open')
            .duration(animateDuration)
            .attrTween('d', function (d: any) {
                let start = d3.interpolate(0, d.startAngle);
                let end = d3.interpolate(0, d.endAngle);
                return function (t) {
                    d.startAngle = start(t);
                    d.endAngle = end(t);
                    return self.arc(d);
                }
            });

        pieUpdate
            .attr('d', function (d: any) {
                return self.arc(d);
            });
    }

    /**
     * Render the given element
     *
     * @param the options to render
     */
    public render(options: IOptions) {
        super.render(options);

        // configure to tooltip and selection on hover over arcs
        let arcs = this._svg.selectAll('.arc');
        if (!this._options.disableTooltip) {
            this.configureTooltip(arcs);
        }
        this.configureSegmentHover(arcs);
    }
};
D3Renderer.register(UIType.Pie, D3Pie);