
import { IRadarChart, } from '../../interface/chart/chart';
import { ITooltipData, UIType, IEvent, EventType } from '../../interface/ui-base';
import { ISummaryValue } from '../../interface/chart/series-data';
import { D3Polar } from './base';
import { D3Renderer } from '../renderer';
import { addClickHelper, SVGRenderer } from '../svg-helper';
import { copy, getSelectionName } from '../utilities';
import { CustomDivTooltip } from '../tooltip';

import * as d3 from 'd3';

let maxValue = 100;     //What is the value that the biggest circle will represent
let labelFactor = 1.25; //How much farther than the radius of the outer circle should the labels be placed
let levels = 5;
let roundStrokes = false;
let wrapWidth = 60;
let opacityBackground = .1;
let opacityCircles = 1;
let opacityArea = .35;
let opacityAreaSelected = .7;
let opacityBorder = .8;
let opacityBorderHidden = .1;
let opacityAxisCircles = .1;
let dotRadius = 4;

// based on code from http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
export class D3Radar extends D3Polar {
    /**
     * hover event
     *
     * @param event the event to pass to the renderer
     */
    public hover(event: IEvent): void {
        let areaSelection = this._svg.selectAll('.radar-area.' + event.selection);
        let circleSelection = this._svg.selectAll('.radar-circle.' + event.selection);
        switch (event.event) {
            case EventType.HoverStart:
                this._svg.selectAll('.radar-circle')
                    .transition().duration(200)
                    .attr('fill-opacity', opacityBackground);
                this._svg.selectAll('.radar-area')
                    .transition().duration(200)
                    .attr('fill-opacity', opacityBackground)
                    .attr('stroke-opacity', opacityBorderHidden);
                areaSelection
                    .transition().duration(200)
                    .attr('fill-opacity', opacityAreaSelected)
                    .attr('stroke-opacity', opacityBorder);
                circleSelection
                    .transition().duration(200)
                    .attr('fill-opacity', opacityAreaSelected)
                break;
            case EventType.HoverEnd:
                this._svg.selectAll('.radar-circle')
                    .transition().duration(200)
                    .attr('fill-opacity', opacityCircles);
                this._svg.selectAll('.radar-area')
                    .transition().duration(200)
                    .attr('fill-opacity', opacityArea)
                    .attr('stroke-opacity', opacityBorder);
        }
    }

    public getTooltipData(event: IEvent): ITooltipData[] {
        let radarChart = this._element as IRadarChart;

        for (let i = 0; i < radarChart.data.length; ++i) {
            if (radarChart.data && radarChart.data[i].key.localeCompare(event.selection)) {
                let units = radarChart.data[i].units ? radarChart.data[i].units : '';
                let tooltipMetrics: { [index: string]: string } = {};

                (radarChart.data[i].data as ISummaryValue[]).forEach((dataPoint) => {
                    if (dataPoint.units) {
                        tooltipMetrics[dataPoint.key] = dataPoint.data + dataPoint.units;
                    } else {
                        tooltipMetrics[dataPoint.key] = dataPoint.data + units;
                    }
                })

                let ttList: ITooltipData[] = [{ source: radarChart, group: '', metrics: tooltipMetrics }];
                return ttList;
            }
        }
        return [];
    }

    protected configureTooltip(target?: d3.Selection<d3.BaseType, any, d3.BaseType, any>,
        value?: ISummaryValue) {
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
            let polarChart = self._element as IRadarChart;


            let cb = polarChart.onTooltip;
            if (cb) {
                let data: any = {
                    tooltip: self._dataTooltip
                }

                self._dataTooltip.setData(polarChart.title + ' for ' + value.key, []);
                cb({ caller: polarChart, selection: value.key, data: data });
            } else {
                let data = value.data as ISummaryValue[];
                let tooltipMetrics: { [index: string]: string } = {};

                let units = value.units ? value.units : '';
                data.forEach((dataPoint) => {
                    if (dataPoint.units) {
                        tooltipMetrics[dataPoint.key] = dataPoint.data + dataPoint.units;
                    } else {
                        tooltipMetrics[dataPoint.key] = dataPoint.data + units;
                    }
                })

                let ttList: ITooltipData[] = [{ source: polarChart, group: '', metrics: tooltipMetrics }];
                if (polarChart.title) {
                    self._dataTooltip.setData(polarChart.title + ' for ' + value.key, ttList);
                } else {
                    self._dataTooltip.setData('', ttList);
                }
            }   // _onMouseMove
            return true;
        }
    }

    /** configures segment hover and stores the current hovered
     * item for others to use in the _selection variable
     **/
    protected configureItemHover(target: d3.Selection<d3.BaseType, any, d3.BaseType, any>,
        value?: any): void {
        let self = this;

        target.on('mouseenter', hoverStart)
            .on('mouseleave', hoverEnd);

        let radarChart = self._element as IRadarChart;
        let contextMenuItems = radarChart.contextMenuItems;
        if (self._options.enableSaveAsImage) {
            let saveImageItem = {
                title: 'Save As Image',
                action: function (elem: any, data: any, index: number) {
                    self.saveImage();
                },
                disabled: false // optional, defaults to false
            };

            contextMenuItems = radarChart.contextMenuItems ?
                radarChart.contextMenuItems.slice(0) : [];
            contextMenuItems.push(saveImageItem);
        }

        addClickHelper(target, radarChart.onClick, radarChart.onDoubleClick,
            contextMenuItems, self._dataTooltip, radarChart);

        // All further processing occurs in the callbacks
        return;

        function onHoverChanged(event?: IEvent) {
            if (SVGRenderer.IS_RESIZING) {
                return;
            }
            let hoverCallback = radarChart.onHover;
            if (hoverCallback) {
                hoverCallback(event);
            } else {
                self._renderer.hover(radarChart, event);
            }
            return true;
        }

        function hoverStart(): boolean {
            let data = value ? value : this.__data__;
            let selection = getSelectionName(self.getDataName(data));
            self._hoverItem = data;
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

    protected getLegendData(): any[] {
        return (this._element as IRadarChart).data;
    }

    /**
     * Render the given element
     */
    protected renderData() {
        let self = this;

        let data: ISummaryValue[] = (this._element as IRadarChart).data as ISummaryValue[];

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        let allAxisNames = (data[0].data as ISummaryValue[]).map(function (elem) { return elem.key });    //Names of each axis;
        let total = allAxisNames.length;                    //The number of different axes
        let angleSlice = Math.PI * 2 / total;        //The width in radians of each 'slice'

        //Scale for the radius
        let rScale = d3.scaleLinear()
            .range([0, this._radius])
            .domain([0, 100]);

        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        let filter = this._graphArea.append('defs').append('filter').attr('id', 'glow');
        let feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
        let feMerge = filter.append('feMerge');
        let feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        let feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        let axisGrid = this._graphArea.append('g')
            .attr('class', 'axis-wrapper');

        //Draw the background circles
        axisGrid.selectAll('.levels')
            .data(d3.range(1, (levels + 1)).reverse())
            .enter()
            .append('circle')
            .attr('class', 'axis-circle')
            .attr('r', function (d, i) { return self._radius / levels * d; })
            .style('fill', '#CDCDCD')
            .style('stroke', '#CDCDCD')
            .style('fill-opacity', opacityAxisCircles)
            .style('filter', 'url(#glow)');


        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        let axis = axisGrid.selectAll('.axis')
            .data(allAxisNames)
            .enter()
            .append('g')
            .attr('class', 'axis-line');
        //Append the lines
        axis.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', function (d, i) { return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr('y2', function (d, i) { return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); })
            .attr('class', 'line')
            .style('stroke', 'white')
            .style('stroke-width', '2px');

        //Append the labels at each axis
        axis.append('text')
            .attr('class', 'axis-text')
            .style('font-size', '11px')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', function (d, i) { return rScale(maxValue * labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr('y', function (d, i) { return rScale(maxValue * labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
            .text(function (d) { return d })
            .call(wrap, wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        let computeRadius = function (d: ISummaryValue) {
            return d.range ?
                rScale(
                    ((d.data as number) - d.range.min) *
                    (d.range.max - d.range.min) * 100) :
                rScale(d.data as number);
        }

        //The radial line function
        let radarLine = d3.radialLine<ISummaryValue>()
            .curve(d3.curveLinearClosed)
            .radius(computeRadius)
            .angle(function (d, i) { return i * angleSlice; });

        if (roundStrokes) {
            radarLine.curve(d3.curveCardinalClosed)
        }

        //Create a wrapper for the blobs
        data.forEach((blob) => {
            let color = self._renderer.getColorManager().getColor(blob.key);
            let blobWrapper = this._graphArea.append('g')
                .attr('fill', color) // this is just so the legend works
                .attr('class', 'radar-blob')
                .classed(this.getDataKey(blob).toString(), true);

            let radarBounds: d3.Selection<d3.BaseType, any, d3.BaseType, any>;
            if (!this._options.disableBackground) {
                //Append the backgrounds
                let radarArea: d3.Selection<d3.BaseType, any, d3.BaseType, any> =
                    blobWrapper
                        .append('path')
                        .attr('class', 'radar-area')
                        .classed(this.getDataKey(blob).toString(), true)
                        .attr('d', function () { return radarLine(blob.data as ISummaryValue[]); })
                        .attr('fill', color)
                        .attr('fill-opacity', opacityArea);

                this.configureItemHover(radarArea, blob);
                this.configureTooltip(radarArea, blob);
            }
            //Create the outlines
            radarBounds = blobWrapper.append('path')
                .attr('class', 'radar-area')
                .classed(this.getDataKey(blob).toString(), true)
                .attr('d', function () { return radarLine(blob.data as ISummaryValue[]); })
                .attr('stroke-width', 1 + 'px')
                .attr('stroke', color)
                .attr('fill', 'none')
                .attr('filter', 'url(#glow)');

            this.configureItemHover(radarBounds, blob);
            this.configureTooltip(radarBounds, blob);

            //Append the circles
            // copy data to new structure
            let blobData: any[] = [];
            (blob.data as ISummaryValue[]).forEach((datum) => {
                let d: any = copy(datum);
                d.parent = blob.key;
                blobData.push(d);
            })

            let circles = blobWrapper.selectAll('.radar-circle')
                .data(blobData)
                .enter().append('circle')
                .attr('class', 'radar-circle')
                .attr('r', dotRadius)
                .attr('cx', function (d, i) { return computeRadius(d) * Math.cos(angleSlice * i - Math.PI / 2); })
                .attr('cy', function (d, i) { return computeRadius(d) * Math.sin(angleSlice * i - Math.PI / 2); })
                .attr('fill', color)
                .attr('fill-opacity', 0.8)
                .classed(this.getDataKey(blob).toString(), true)

            this.configureItemHover(circles, blob);
            this.configureTooltip(circles, blob);
        })

        /////////////////////////////////////////////////////////
        /////////////////// Helper Function /////////////////////
        /////////////////////////////////////////////////////////

        //Taken from http://bl.ocks.org/mbostock/7555321
        //Wraps SVG text
        function wrap(text: any, width: number) {
            text.each(function () {
                let text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.4, // ems
                    y = text.attr('y'),
                    x = text.attr('x'),
                    dy = parseFloat(text.attr('dy')),
                    tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(' '));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(' '));
                        line = [word];
                        tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                    }
                }
            });
        }//wrap

        this._svg
            .attr('width', this._options.width)
            .attr('height', this._options.height)
            .attr('class', 'chart-radar');
    }
}
D3Renderer.register(UIType.Radar, D3Radar);