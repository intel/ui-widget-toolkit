
import {
    IEvent, IOptions, Alignment, EventType, ILegendItem,
    Rect, UIElement, ITooltipData
} from '../../interface/ui-base';
import { IXYValue } from '../../interface/chart/series-data';
import { IChart, IPolarChart } from '../../interface/chart/chart'
import { IPolarSegment } from '../../interface/chart/decimator';

import { getSelectionName } from '../utilities';
import { CustomDivTooltip } from '../tooltip';
import {
    addClickHelper, D3Legend, SVGRenderer
} from '../svg-helper';
import { D3Renderer } from '../renderer';

import * as d3 from 'd3';

export class D3Polar extends SVGRenderer {
    protected _radius: number;
    protected _center: IXYValue; // x, y coordianates of the polar graph center
    protected _hoverItem: any;
    protected _legend: D3Legend;
    protected _graphArea: d3.Selection<any, any, d3.BaseType, any>;

    /** the tooltip object */
    protected _dataTooltip: CustomDivTooltip;

    protected arc: d3.Arc<any, IPolarSegment>;
    protected getDataKey: (d: any) => number | string;
    protected getDataName: (d: any) => string;
    protected getDataValue: (d: any) => number;
    protected getDataDisplayValue: (d: any) => number;

    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        super();

        let self = this;
        self.DEFAULT_GRAPH_HEIGHT = 250;
        self.MIN_MARGIN = { TOP: 10, BOTTOM: 10, LEFT: 10, RIGHT: 10 };
        self._options.height = self.DEFAULT_GRAPH_HEIGHT;
        self._options.topMargin = self.MIN_MARGIN.TOP;
        self._options.leftMargin = self.MIN_MARGIN.LEFT;
        self._options.rightMargin = self.MIN_MARGIN.RIGHT;
        self._options.bottomMargin = self.MIN_MARGIN.BOTTOM;

        self.initialize(element, renderer, parent);

        self.getDataKey = function (d: any): number | string {
            return d ? d.key : '';
        }
        self.getDataName = function (d: any): string {
            if (d && d.name) {
                return d.name;
            }
            return self.getDataKey(d).toString();
        }
        self.getDataValue = function (d: any): number {
            return d.value;
        }
        self.getDataDisplayValue = function (d: any): number {
            return d.displayValue ? d.displayValue : d.value;
        }
        self.arc = d3.arc<IPolarSegment>()
            .innerRadius(function (d: IPolarSegment) {
                return Math.max(0, d.innerRadius) * self._radius;
            })
            .outerRadius(function (d: IPolarSegment) {
                return Math.max(0, d.outerRadius) * self._radius;
            })
            .startAngle(function (d: IPolarSegment) {
                return d.startAngle;
            })
            .endAngle(function (d: IPolarSegment) {
                return d.endAngle;
            });
    }

    public createLayout() {
        let self = this;
        self._svg.selectAll('*').remove();
        self._graphArea = self._svg.append('g')
            .attr('class', 'graphArea')

        let renderLegend = (self._element as IPolarChart).legend;
        if (renderLegend) {
            self._legend = new D3Legend(self._svg, renderLegend, '');
        }
    }

    protected getSegmentClasses(d: any) {
        let key = getSelectionName(this.getDataKey(d).toString());
        let name = getSelectionName(this.getDataName(d));

        let classes = ' chart-data arc ';
        if (key === name) {
            return classes + key;
        }
        return classes + key + ' ' + name;
    }

    /** configures segment hover and stores the current hovered
     * item for others to use in the _selection variable
     **/
    protected configureItemHover(target: d3.Selection<d3.BaseType, any, d3.BaseType, any>): void {
        let self = this;
        let chart = self._element as IChart;

        target.on('mouseenter', hoverStart)
            .on('mouseleave', hoverEnd);

        let polarChart = self._element as IPolarChart;
        let contextMenuItems = polarChart.contextMenuItems;
        if (self._options.enableSaveAsImage) {
            let saveImageItem = {
                title: 'Save As Image',
                action: function (elem: any, data: any, index: number) {
                    self.saveImage();
                },
                disabled: false // optional, defaults to false
            };

            contextMenuItems = polarChart.contextMenuItems ?
                polarChart.contextMenuItems.slice(0) : [];
            contextMenuItems.push(saveImageItem);
        }

        addClickHelper(target, polarChart.onClick, polarChart.onDoubleClick,
            contextMenuItems, self._dataTooltip, polarChart);

        // All further processing occurs in the callbacks
        return;

        function onHoverChanged(event?: IEvent) {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }
            let hoverCallback = chart.onHover;
            if (hoverCallback) {
                hoverCallback(event);
            } else {
                self._renderer.hover(chart, event);
            }
            return true;
        }

        function hoverStart(): boolean {
            let rawData = this.__data__.rawData;
            let selection = getSelectionName(self.getDataName(rawData));
            self._hoverItem = rawData;
            if (self._hoverItem) {
                return onHoverChanged({
                    caller: self._element,
                    event: EventType.HoverStart,
                    selection: selection
                });
            }
            return false;
        }    // onHoverEnter


        function hoverEnd(): boolean {
            if (self._hoverItem) {
                let ret = onHoverChanged({
                    caller: self._element,
                    event: EventType.HoverEnd,
                    selection: getSelectionName(self.getDataName(self._hoverItem))
                });

                self._hoverItem = undefined;
                return ret;
            }
            return false;
        }   // onHoverLeave
    }

    protected configureTooltip(target?: d3.Selection<d3.BaseType, any, d3.BaseType, any>) {
        if (target === undefined) {
            return;
        }
        let self = this;
        this._dataTooltip = new CustomDivTooltip(self._tooltipId, 'tooltip-t');
        this._dataTooltip
            .setAnalyticsName(self._tooltipAnalyticsName)
            .setTarget(target)
            .setEnterCallback(showTooltip)
            .setMoveCallback(showTooltip)
            .setPlaceTooltipLeftRight()
            .alwaysRecalcWidth(true)
            .setDelay(self._options.tooltipDelay ? self._options.tooltipDelay : 0);

        return; // showTooltip handled in the callback below

        function showTooltip(d: any): boolean {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }
            let polarChart = self._element as IPolarChart;

            let selection = self.getDataName(d.rawData);
            let cb = polarChart.onTooltip;
            if (cb) {
                let data: any = {
                    tooltip: self._dataTooltip
                }

                self._dataTooltip.setData(polarChart.title + ' for ' + self.getDataName(d.rawData), []);
                cb({ caller: polarChart, selection: selection, data: data });
            } else {
                let data = d.rawData;
                let units = (self._element as IPolarChart).units ? (self._element as IPolarChart).units : '';
                let tooltipMetrics: { [index: string]: string } = {};
                tooltipMetrics[self.getDataName(data)] = self.getDataDisplayValue(data) + units;

                let ttList: ITooltipData[] = [{ source: polarChart, group: '', metrics: tooltipMetrics }];

                let tooltip = self._dataTooltip;
                if (polarChart.title) {
                    tooltip.setData(polarChart.title + ' for ' + self.getDataName(data), ttList);
                } else {
                    tooltip.setData('', ttList);
                }
            }   // _onMouseMove
            return true;
        }
    }

    protected renderData() {
        throw 'Please override renderData for D3Polar in subclass';
    }

    /**
     * get the polar data for the legend
     */
    protected getLegendData(): any[] {
        throw 'Please override getLegendData for D3Polar in subclass'
    }

    protected renderLegend(pieLeft: number, pieTop: number, diameter: number) {
        let self = this;
        // RENDER LEGENDS
        let polarChart = this._element as IPolarChart;
        let renderLegend = polarChart.legend;
        if (renderLegend) {
            let legendData = this.getLegendData();
            let xLegend = pieLeft;
            let yLegend = pieTop;
            switch (renderLegend.alignment) {
                case Alignment.Bottom:
                    yLegend += diameter + 10;
                    break;
                case Alignment.Right:
                    xLegend += diameter + 10;
                    break;

            }

            self._legend.setPosition(
                new Rect(xLegend, yLegend, self._graphRect.width, self._graphRect.height));

            let colorMgr = self._renderer.getColorManager();
            let legendItems: ILegendItem[] = [];
            for (let i = 0; i < legendData.length; ++i) {
                let data = legendData[i];
                let name = self.getDataName(data);
                let selectionKey = getSelectionName(name);
                let elem = self._svg.selectAll('.' + selectionKey);
                try {
                    legendItems.push({
                        key: name,
                        color: elem.attr('fill'),
                        opacity: elem.attr('opacity'),
                        shape: 'rect',
                        value: self.getDataValue(data),
                        units: polarChart.units
                    });
                } catch (e) {
                    legendItems.push({
                        key: name,
                        color: colorMgr.getColor(name),
                        opacity: '1',
                        shape: 'rect',
                        value: self.getDataValue(data),
                        units: polarChart.units
                    });
                }
            }

            self._legend.setItems(legendItems);
            self._legend.render();

            let legendRect = self._legend.getRenderedRect();
            self._options.width = Math.max(self._options.width, xLegend + legendRect.width);
            self._options.height = Math.max(self._options.height, yLegend + legendRect.height);
        }
    }
    /**
     * Render the given element
     *
     * @param the options to render
     */
    public render(options: IOptions) {
        let self = this;

        this.loadOptions(options);

        this._svgRect.width = this._options.width;

        // CALCULATE GRAPH PARAMS
        let graphTop = self._options.topMargin;
        let graphBottom = self._options.height - self._options.bottomMargin;
        let graphLeft = self._options.leftMargin;
        let graphRight = self._svgRect.width - self._options.rightMargin;

        let diameter = Math.min(graphBottom - graphTop, graphRight - graphLeft);
        self._radius = diameter / 2;

        self._graphRect.x = graphLeft;
        self._graphRect.y = graphTop;
        self._graphRect.width = diameter;
        self._graphRect.height = diameter;

        self._center = {
            x: self._radius + self._options.leftMargin,
            y: self._radius + self._options.topMargin
        };

        self._graphArea
            .attr('transform', 'translate(' + self._center.x + ',' +
                self._center.y + ')');

        // RENDER THE CHART
        self.renderData();

        self._options.width = graphLeft + diameter + self._options.rightMargin;
        self._options.height = graphTop + diameter + self._options.bottomMargin;
        self.renderLegend(graphLeft, graphTop, diameter);
        // self.updateHandles();

        self._svg
            .attr('width', self._options.width)
            .attr('height', self._options.height);
    }
}
