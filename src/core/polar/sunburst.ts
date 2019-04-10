import { IOptions, UIElement, ITooltipData, UIType } from '../../interface/ui-base';
import { ITreeNode } from '../../interface/chart/series-data';
import { IPolarChart, ISunburstChart } from '../../interface/chart/chart';
import {
    IPolarCoord, IPolarSegment, ISunburstDecimationInfo, ISunburstDecimator
} from '../../interface/chart/decimator'

import { getSelectionName } from '../utilities';

import { CustomDivTooltip } from '../tooltip';
import { SVGRenderer } from '../svg-helper';
import { D3Renderer } from '../renderer';

import * as d3 from 'd3';

import { D3Polar } from './base';

export class SunburstDecimator implements ISunburstDecimator {
    public static KEY = 'SunburstDecimator';
    private static VALUE_TO_ANGLE = 2 * Math.PI;

    protected _data: ISunburstDecimationInfo;
    protected _sortedArcs: IPolarSegment[];
    protected _maxDepth = 0;
    protected _arcLimit: number;

    constructor() {
        this.reset();
    }

    public reset() {
        this._data = {
            arcs: undefined,
            renderedArcs: undefined,
            background: undefined
        };
    }

    /**
     * Returns the key of this decimator
     */
    public getKey(): string {
        return SunburstDecimator.KEY;
    }

    /**
     * the name of this decimation scheme
     */
    public getName(): string {
        return '';
    }

    /**
     * Returns the decimated list of data
     */
    public getValues(): ISunburstDecimationInfo {
        return this._data;
    }

    private addArc(node: ITreeNode, depth: number, percentScalar: number, angleOffset: number): number {
        this._maxDepth = Math.max(this._maxDepth, depth);

        let nextNodeAngle = angleOffset + node.value * percentScalar * SunburstDecimator.VALUE_TO_ANGLE;
        this._data.arcs.push({
            outerRadius: undefined,
            innerRadius: undefined,
            startAngle: angleOffset,
            endAngle: nextNodeAngle,
            depth: depth,
            rawData: node
        });

        node.children.sort(function (a: ITreeNode, b: ITreeNode) {
            if (a.value > b.value) {
                return -1;
            }
            if (a.value < b.value) {
                return 1;
            }
            return 0;
        });

        for (let i = 0; i < node.children.length; ++i) {
            angleOffset = this.addArc(node.children[i], depth + 1, percentScalar, angleOffset);
        }
        return nextNodeAngle;
    }

    /**
     * used to generate a list of all rects that could be drawn sorted by duration
     */
    protected getArcs(root: ITreeNode) {
        if (!this._data.arcs) {
            this._data.arcs = [];
            if (root.value !== 0) {
                this.addArc(root, 2, 1 / root.value, 0);
            }

            let depthToPercent = 1 / this._maxDepth;
            for (let i = 0; i < this._data.arcs.length; ++i) {
                let data = this._data.arcs[i];
                data.outerRadius = (data.depth) * depthToPercent;
                data.innerRadius = (data.depth - 1) * depthToPercent;
            }
        }

        return this._data.arcs;
    }

    protected decimateArcs(root: ITreeNode, arcLimit?: number) {
        this._data.arcs = this.getArcs(root);
        this._sortedArcs = Array.prototype.slice.call(this._data.arcs)
            .sort(function (a: IPolarSegment, b: IPolarSegment) {
                if (a.rawData.value > b.rawData.value) {
                    return -1;
                }
                if (a.rawData.value < b.rawData.value) {
                    return 1;
                }
                return 0;
            });


        if (arcLimit) {
            this._data.renderedArcs = this._sortedArcs.splice(0, arcLimit);
        } else {
            this._data.renderedArcs = this._sortedArcs;
        }
        let rootParent = {
            outerRadius: 1 / this._maxDepth,
            innerRadius: 0,
            startAngle: 0,
            endAngle: SunburstDecimator.VALUE_TO_ANGLE,
            depth: 0,
            rawData: root.parent
        };

        this._data.arcs.push(rootParent);
        this._data.renderedArcs.push(rootParent);
    }

    protected generateBackground(root: ITreeNode) {
        if (!this._data.background) {
            this.getArcs(root);
            let tempCoords = [];

            // put all start/ends into a list and sort by angle
            for (let i = 0; i < this._data.arcs.length; ++i) {
                let arc = this._data.arcs[i];
                tempCoords.push({
                    isStart: true,
                    angle: arc.startAngle,
                    radius: arc.outerRadius
                });
                tempCoords.push({
                    isStart: false,
                    angle: arc.endAngle,
                    radius: arc.outerRadius
                });
            }
            tempCoords.sort(function (a: IPolarCoord, b: IPolarCoord) {
                if (a.angle < b.angle) {
                    return -1;
                }
                if (a.angle > b.angle) {
                    return 1;
                }
                return 0;
            });

            // for all temp coords merge those with same angle into one point
            this._data.background = [];
            this._data.background.push({
                angle: 0,
                radius: 0
            });

            for (let i = 0; i < tempCoords.length; ++i) {
                let currAngle = tempCoords[i].angle;
                let maxStart = 0;
                let maxEnd = 0;

                for (; i < tempCoords.length && tempCoords[i].angle === currAngle; ++i) {
                    if (tempCoords[i].isStart) {
                        maxStart = Math.max(maxStart, tempCoords[i].radius);
                    } else {
                        maxEnd = Math.max(maxEnd, tempCoords[i].radius);
                    }
                }

                if (maxEnd) {
                    this._data.background.push({
                        angle: this._data.background[this._data.background.length - 1].angle,
                        radius: maxEnd
                    });
                    this._data.background.push({
                        angle: currAngle,
                        radius: maxEnd
                    });
                }
                if (maxStart) {
                    this._data.background.push({
                        angle: currAngle,
                        radius: maxStart
                    });
                }
            }
        }
    }

    public setArcLimit(arcLimit: number): ISunburstDecimator {
        this._arcLimit = arcLimit;
        return this;
    }

    /**
     * Values to be decimated
     *
     * @param xStart - start time of the region
     * @param xEnd - start time of the region
     * @param values - Values to be decimated.
     */
    public decimateValues(root: ITreeNode): ISunburstDecimationInfo {
        this.decimateArcs(root, this._arcLimit);
        this.generateBackground(root);

        return this._data;
    }
};

export class D3Sunburst extends D3Polar {
    protected static TWO_PI = 2 * Math.PI;

    private _hoverLine: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;
    protected _decimator: ISunburstDecimator;
    private renderBackground: d3.RadialArea<IPolarCoord>;

    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {
        super(element, renderer, parent);

        this._options.height = 400;

        let self = this;
        this.renderBackground = d3.radialArea<IPolarCoord>()
            .angle(function (d: IPolarCoord) { return d.angle; })
            .innerRadius(function (d: IPolarCoord) { return 0; })
            .outerRadius(function (d: IPolarCoord) { return d.radius * self._radius; });
    }

    public createLayout() {
        super.createLayout();

        this._svg.select('.graphArea')
            .append('path')
            .classed('background', true)
            .attr('fill', 'black')
            .attr('stroke', 'black');
    }

    protected getLegendData(): IPolarSegment[] {
        return [];
    }

    protected configureHoverLine() {
        let self = this;

        let hoverLineRadius = self._radius * 1.1;
        self._svg
            .on('mouseover', hoverStart)
            .on('mousemove', hoverMove)
            .on('mouseout', hoverEnd);

        return;

        function hoverStart() {
            self._hoverLine = self._svg.select('g')
                .append('path')
                .attr('class', 'polar-hover-line')
                .attr('stroke', '#222222')
                .attr('stroke-width', 1)
                .attr('pointer-events', 'none');
        }

        function hoverMove() {
            // Get mouse coordinates that are relative to the group for the chart
            let coords: number[] = d3.mouse((self._svg as any).node());
            let angle = Math.atan2(coords[0] - self._center.x, self._center.y - coords[1]);
            let lineData = [{
                length: 0,
                angle: angle
            },
            {
                length: 1,
                angle: angle
            }];

            let radialLine = d3.radialLine<any>()
                .angle(function (d: any) { return d.angle; })
                .radius(function (d: any) { return d.length * hoverLineRadius });

            self._hoverLine
                .attr('d', radialLine(lineData));
        }

        function hoverEnd() {
            if (self._hoverLine) {
                self._hoverLine.remove();
                self._hoverLine = undefined;
            }
        }
    }

    protected configureTooltip() {
        let self = this;
        this._dataTooltip = new CustomDivTooltip(self._tooltipId, 'tooltip-t');
        this._dataTooltip
            .setAnalyticsName(self._tooltipAnalyticsName)
            .setTarget(self._svg)
            .setEnterCallback(showTooltip)
            .setMoveCallback(showTooltip)
            .setPlaceTooltipLeftRight()
            .alwaysRecalcWidth(true)
            .setDelay(self._options.tooltipDelay ? self._options.tooltipDelay : 0);

        return; // showTooltip handled in the callback below

        function getTreePath(angle: number): { [index: string]: string } {
            let stack: { [index: string]: string } = {};

            let data = self._decimator.getValues().arcs;
            for (let i = 0; i < data.length; ++i) {
                let arc: IPolarSegment = data[i];
                if (arc.startAngle < angle && arc.endAngle > angle) {
                    stack[self.getDataName(arc.rawData)] = '';
                }
            }

            return stack;
        }

        function showTooltip(): boolean {
            // d comes from configureSegmentHover
            let d = self._hoverItem;

            // Get mouse coordinates that are relative to the group for the chart
            let coords: number[] = d3.mouse((self._svg as any).node());
            let angle = Math.atan2(coords[0] - self._center.x, self._center.y - coords[1]);
            if (angle < 0) {
                angle += D3Sunburst.TWO_PI;
            }

            if (SVGRenderer.IS_RESIZING) {
                return;
            }

            let polarChart = self._element as IPolarChart;
            let ttList: ITooltipData[] = [];
            if (d) {
                let units = polarChart.units ? polarChart.units : '';
                let tooltipMetrics: { [index: string]: string } = {};
                tooltipMetrics[self.getDataName(d)] = d.value + units;
                ttList.push({ source: polarChart, group: '', metrics: tooltipMetrics });
            }

            ttList.push({ source: polarChart, group: 'Stack', metrics: getTreePath(angle) });

            if (d) {
                let selection = self.getDataName(d);
                let cb = polarChart.onTooltip;
                if (cb) {
                    let data: any = {
                        tooltip: self._dataTooltip
                    }

                    cb({ caller: polarChart, selection: selection, data: data });
                }
            }

            // now get text from any associated graphs
            if (polarChart.title) {
                self._dataTooltip.setData(polarChart.title + ' for ' + self.getDataName(d), ttList);
            } else {
                self._dataTooltip.setData('', ttList);
            }

            return true;
        }   // _onMouseMove
    }

    protected renderData() {
        let self = this;

        let sunburstChart = this._element as ISunburstChart;
        if (!(sunburstChart.data || sunburstChart.data.length === 0)) {
            return;
        }

        let twoPI = 2 * Math.PI;
        let oldArcs = self._decimator.getValues().arcs;

        self._decimator.reset();
        let newRoot = sunburstChart.data[0];
        let newRootArcInOldChart: IPolarSegment;
        let newInfo = self._decimator.decimateValues(sunburstChart.data[0]);
        let newArcs: any = newInfo.arcs;
        let newRenderedArcs: any = newInfo.renderedArcs;
        let newArcMap: { [index: string]: any } = {};

        let fromAngle = 0;
        let oldRootArcInOldChart: IPolarSegment;
        let oldRootArcInNewChart: IPolarSegment;
        let oldArcMap: { [index: string]: any } = {};
        if (oldArcs) {
            oldRootArcInOldChart = oldArcs[0];

            // map old arcs
            for (let i = 0; i < oldArcs.length; ++i) {
                let oldArc = oldArcs[i];
                oldArcMap[self.getDataKey(oldArc.rawData)] = oldArc;
                if (oldArc.rawData === newRoot) {
                    newRootArcInOldChart = oldArc;
                }
            }

            // map new arcs
            for (let i = 0; i < newArcs.length; ++i) {
                let arc = newArcs[i];
                newArcMap[self.getDataKey(arc.rawData)] = arc;
            }

            // find the old root in the new rendered arcs
            let oldRootKey = self.getDataKey(oldRootArcInOldChart.rawData);
            for (let i = 0; i < newRenderedArcs.length; ++i) {
                let arc = newRenderedArcs[i];
                if (self.getDataKey(arc.rawData) === oldRootKey) {
                    oldRootArcInNewChart = arc;
                    break;
                }
            }

            fromAngle = (newRootArcInOldChart.startAngle + newRootArcInOldChart.endAngle) / 2;
        }

        // create helper function for update
        let polarChart = self._element as IPolarChart;
        let colorMgr = self._renderer.getColorManager();
        let animateDuration = super.getAnimateDuration();

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

        let getTransitionObject = function (target: IPolarSegment) {
            let oldArc: IPolarSegment = oldArcMap[self.getDataKey(target.rawData)];
            let newArc: IPolarSegment = newArcMap[self.getDataKey(target.rawData)];
            if (oldArc && newArc) {
                let start = d3.interpolate(oldArc.startAngle, newArc.startAngle);
                let end = d3.interpolate(oldArc.endAngle, newArc.endAngle);
                let inner = d3.interpolate(oldArc.innerRadius, newArc.innerRadius);
                let outer = d3.interpolate(oldArc.outerRadius, newArc.outerRadius);
                return function (t: any) {
                    let transitionObj = {
                        startAngle: start(t),
                        endAngle: end(t),
                        innerRadius: inner(t),
                        outerRadius: outer(t),
                        depth: newArc.depth,
                        rawData: newArc.rawData
                    }
                    return self.arc(transitionObj);
                }
            }

            return undefined;
        }

        // now do the updates
        let graphArea = self._svg.select('.graphArea');
        let arcUpdate = graphArea.selectAll('.arc').data(newRenderedArcs,
            function (d: IPolarSegment) {
                if (d) {
                    return self.getDataKey(d.rawData).toString();
                };
            });

        arcUpdate.exit()
            .transition('remove')
            .duration(animateDuration)
            .attrTween('d', function (d: IPolarSegment) {
                let transition = getTransitionObject(d);
                if (transition) {
                    return transition;
                }

                let start: (d: any) => number,
                    end: (d: any) => number,
                    inner: (d: any) => number,
                    outer: (d: any) => number;
                start = d.startAngle > fromAngle ?
                    d3.interpolate(d.startAngle, twoPI) :
                    d3.interpolate(d.startAngle, 0);

                end = d.endAngle > fromAngle ?
                    d3.interpolate(d.endAngle, twoPI) :
                    d3.interpolate(d.endAngle, 0);

                inner = d3.interpolate(d.innerRadius, 0);
                outer = d3.interpolate(d.outerRadius, 0);

                return function (t) {
                    let transitionObj = {
                        startAngle: start(t),
                        endAngle: end(t),
                        innerRadius: inner(t),
                        outerRadius: outer(t),
                        depth: d.depth,
                        rawData: d.rawData
                    }

                    return self.arc(transitionObj);
                }
            })
            .remove();

        arcUpdate.transition('update')
            .duration(animateDuration)
            .attrTween('d', function (d: IPolarSegment) {
                return getTransitionObject(d);
            });

        let arcPath = arcUpdate.enter()
            .append('path')
            .attr('class', classFunc)
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.5)
            .attr('fill', function (d: any) {
                if (!d.rawData) {
                    return 'white';
                }
                return colorMgr.getColor(self.getDataName(d.rawData))
            })
            .on('click', function (d: IPolarSegment) {
                if (d.rawData) {
                    (self._element as ISunburstChart).data = [d.rawData];
                    self.renderData();
                }
            })
            .transition('add')
            .duration(animateDuration)
            .attrTween('d', function (d: IPolarSegment) {
                let transition = getTransitionObject(d);
                if (transition) {
                    return transition;
                }

                let start: (d: any) => number,
                    end: (d: any) => number,
                    inner: (d: any) => number,
                    outer: (d: any) => number;
                if (oldRootArcInNewChart) {
                    // we are going up the stack since the old root is also
                    // in the new chart
                    if (d.innerRadius === 0) {
                        // the new root node
                        start = d3.interpolate(0, 0);
                        end = d3.interpolate(twoPI, twoPI);
                        inner = d3.interpolate(0, d.innerRadius);
                        outer = d3.interpolate(0, d.outerRadius);
                    } else {
                        if (d.startAngle >= oldRootArcInNewChart.endAngle) {
                            start = d3.interpolate(twoPI, d.startAngle);
                            end = d3.interpolate(twoPI, d.endAngle);
                        } else {
                            start = d3.interpolate(0, d.startAngle);
                            end = d3.interpolate(0, d.endAngle);
                        }
                        inner = d3.interpolate(oldRootArcInOldChart.innerRadius, d.innerRadius);
                        outer = d3.interpolate(oldRootArcInOldChart.innerRadius, d.outerRadius);
                    }
                } else {
                    start = d3.interpolate(0, d.startAngle);
                    end = d3.interpolate(0, d.endAngle);
                    inner = d3.interpolate(0, d.innerRadius);
                    outer = d3.interpolate(0, d.outerRadius);
                }

                return function (t) {
                    let transitionObj = {
                        startAngle: start(t),
                        endAngle: end(t),
                        innerRadius: inner(t),
                        outerRadius: outer(t),
                        depth: d.depth,
                        rawData: d.rawData
                    }

                    return self.arc(transitionObj);
                }
            });

        let background = graphArea.select('.background')
            .style('opacity', 1e-6)
            .attr('d', self.renderBackground(self._decimator.getValues().background));

        background
            .transition('backgroundShow')
            .duration(animateDuration)
            .style('opacity', 0.2);
    }

    /**
     * Render the given element
     *
     * @param the options to render
     */
    public render(options: IOptions) {
        let sunburstChart = this._element as ISunburstChart;
        if (sunburstChart.decimator) {
            this._decimator = sunburstChart.decimator;
        }
        if (!this._decimator) {
            this._decimator = new SunburstDecimator();
        }

        // render arcs
        super.render(options);

        // configure to tooltip and selection on hover over arcs
        let arcs = this._graphArea.selectAll('.arc');
        this.configureItemHover(arcs);
        this.configureHoverLine();
    }
}
D3Renderer.register(UIType.Sunburst, D3Sunburst);