import {
    IEvent, EventType, IContextMenuItem, IBuffer
} from '../../../interface/ui-base';
import { IScalingInfo } from '../../../interface/chart/axis';
import { ILayer } from '../../../interface/chart/chart';
import { getSelectionName, SimpleBuffer } from '../../utilities';
import { addHover, removeHover, addClickHelper } from '../../svg-helper';

import { showContextMenu } from '../../context-menu';
import { D3Axis } from '../axis';
import { ID3Chart } from '../chart';

import * as d3 from 'd3';

export class BaseSeries {
    /** the chart that owns this series */
    protected _d3Chart: ID3Chart;

    /** The series as defined by the user with render type and decimation info */
    protected _layer: ILayer;

    /** The series data for the given region */
    protected _outputData: IBuffer<any>;

    /** The svg for this series*/
    protected _d3svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;

    /** The x axis object */
    protected _d3XAxis: D3Axis;

    /** The y axis object */
    protected _d3YAxis: D3Axis;

    /** the D3 render object */
    protected _d3Elems: d3.Selection<d3.BaseType, {}, d3.BaseType, any>[];

    /** is the x axis a continuous series */
    protected _isXContinuous: boolean;

    /** scaling information for the x axis */
    protected _xScalingInfo: IScalingInfo;

    /** scaling information for the y axis */
    protected _yScalingInfo: IScalingInfo;

    /** stores the original fill colors for an series */
    protected _fillColors = new WeakMap<Object, string>();

    /** stores the original stroke colors for an series */
    protected _strokeColors = new WeakMap<Object, string>();

    protected _contextMenuItems: IContextMenuItem[];

    /**
     * Create an series
     *
     * @param _orientation - The orientation of the axis. One of 'left',
     *   'right', or 'bottom'
     */
    constructor(chart: ID3Chart, layer: ILayer,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>) {

        this._d3svg = svg;
        this._d3Chart = chart;
        this._layer = layer;

        this._d3XAxis = xAxis;
        this._d3YAxis = yAxis;
        this._d3Elems = [];
        this._isXContinuous = isXContinuous;
        this._outputData = new SimpleBuffer([]);
        this._contextMenuItems = [];

        if (!layer.xScalingInfo) {
            this._xScalingInfo = { baseScale: { maxRange: Number.MAX_VALUE, scalar: 1, units: '' } };
        } else {
            this._xScalingInfo = layer.xScalingInfo;
        }

        if (!layer.yScalingInfo) {
            this._yScalingInfo = { baseScale: { maxRange: Number.MAX_VALUE, scalar: 1, units: '' } };
        } else {
            this._yScalingInfo = layer.yScalingInfo;
        }
    }

    protected applyStyles(): void {
        if (this._layer.css) {
            let styles: { [index: string]: any } = this._layer.css.style;
            if (styles) {
                for (let i = 0; i < this._d3Elems.length; ++i) {
                    for (let key in styles) {
                        this._d3Elems[i].style(key, styles[key]);
                    }
                }
            }
        }
    }

    public getMaxNameLength(): number {
        return this.getName().length;
    }

    /** check if the x is continuous series */
    public isXContinuousSeries(): boolean {
        return this._isXContinuous;
    }

    /** get the x scaling info for this series */
    public getXScalingInfo(): IScalingInfo {
        return this._xScalingInfo;
    }

    /** get the y scaling info for this series */
    public getYScalingInfo(): IScalingInfo {
        return this._yScalingInfo;
    }

    /** get the name of this series */
    public getName(): string {
        return '';
    }

    protected getDecimationName(): string {
        return '';
    }

    protected getClassNames(type: string, name?: string) {
        // there is intentionally a space here so we can convert
        // this to a CSS class by converting spaces to periods
        let classNames = ` ${type}`;
        if (!name) {
            name = this.getName();
        }
        let selectionName = getSelectionName(name);
        if (selectionName && selectionName.length > 0) {
            classNames += ' ' + getSelectionName(name);
        }

        let chartTitle = this._d3Chart.getTitle();
        if (chartTitle && chartTitle.length > 0) {
            classNames += ' ' + getSelectionName(chartTitle);
        }

        let decimationName = this.getDecimationName();
        if (decimationName && decimationName.length > 0) {
            classNames += ' ' + decimationName
        }
        return classNames;
    }

    public getRequiredHeight() {
        return 0;
    }

    protected getSelectionClasses(type: string): string {
        return this.getClassNames(type).replace(/\s+/g, '.');
    }

    /** handle on select events if we want to */
    public addHover(selection: string): void {
        let self = this;
        if (this._d3Elems) {
            let selectionName = getSelectionName(selection);
            for (let i = 0; i < self._d3Elems.length; ++i) {
                let elem = self._d3Elems[i];
                if (elem.classed && elem.classed(selectionName)) {
                    let hoverRadiusDelta = self._d3Chart.getOptions().hoverRadiusDelta;

                    let radius = elem.attr('r');
                    if (radius !== undefined && hoverRadiusDelta !== undefined) {
                        let delta = hoverRadiusDelta ? hoverRadiusDelta : 0;
                        elem.attr('r', parseInt(radius) + delta);
                        return;
                    }

                    addHover(elem, self._fillColors, self._strokeColors);
                }
            }
        }
    }

    /** handle on deselect events if we want to */
    public removeHover(selection: string): void {
        let self = this;
        if (this._d3svg) {
            let selectionName = getSelectionName(selection);
            for (let i = 0; i < self._d3Elems.length; ++i) {
                let elem = self._d3Elems[i];
                if (elem.classed && elem.classed(selectionName)) {
                    let hoverRadiusDelta = self._d3Chart.getOptions().hoverRadiusDelta;

                    let radius = elem.attr('r');
                    if (radius !== undefined && hoverRadiusDelta !== undefined) {
                        let delta = hoverRadiusDelta ? hoverRadiusDelta : 0;
                        elem.attr('r', parseInt(radius) - delta);
                        return;
                    }

                    removeHover(elem, self._fillColors, self._strokeColors);
                }
            }
        }
    }

    /**
     * get the actual rendered data
     */
    public setOutputData(data: any[] | IBuffer<any>) {
        if (Array.isArray(data)) {
            this._outputData = new SimpleBuffer(data);
        } else {
            this._outputData = data;
        }
    }

    /**
     * get the actual rendered data
     */
    public getOutputData(): IBuffer<any> {
        return this._outputData;
    }

    /** get the minimum graph height */
    public getMinHeight() {
        return 0;
    }

    /** this adds some logic since the brush is behind the elements we need to
     * handle mouse/touch events properly to bring the brush to the front and
     * do the brush selection correctly.
     */
    protected configureItemInteraction(elem: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        value?: any) {
        let self = this;

        let wait: any;

        if (self._d3Chart.getOptions().disableBrush) {
            elem.attr('cursor', 'pointer');
            addClickHelper(elem, self._layer.onClick ? onClick : undefined,
                self._layer.onDoubleClick ? onDoubleClick : undefined,
                self._contextMenuItems,
                self._d3Chart.getTooltip(), self._d3Chart.getElement(), value);
        } else {
            elem.attr('cursor', 'crosshair');
            elem.on('contextmenu', function (event) {
                showContextMenu(d3.event, undefined, self._contextMenuItems);
            })
                .on('mousedown touchstart', function (d: any) {
                    let caller = self._d3Chart.getElement();
                    if (value) {
                        if (self._layer.onDoubleClick) {
                            if (wait) {
                                window.clearTimeout(wait);
                                wait = null;
                                onDoubleClick({
                                    caller: caller,
                                    event: EventType.DoubleClick,
                                    data: value
                                });
                                return;
                            } else {
                                wait = setTimeout(function () {
                                    if (wait) {
                                        onClick({
                                            caller: caller, event: EventType.Click,
                                            data: value
                                        });
                                        wait = null;
                                    }
                                }, 300);
                            }
                        } else {
                            onClick({
                                caller: caller, event: EventType.Click, data: value
                            });
                        }
                    }
                    let brush = self._d3Chart.getGraphGroup().select('.brush');
                    let brushStart: any = brush.on('mousedown.brush');
                    let event: any = new MouseEvent('mousedown touchstart', d3.event);
                    event['changedTouches'] = d3.event.changedTouches;
                    event['touches'] = d3.event.touches;
                    let target = brush.select('.overlay').node();
                    Object.defineProperty(event, 'target', { value: target, enumerable: true });
                    target.dispatchEvent(event);
                    d3.customEvent(event, brushStart, brush.node());
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                })
                .on('touchmove touchend', function () {
                    let brushOverlay = self._d3Chart.getGraphGroup().select('.overlay');
                    let event: any = new MouseEvent(d3.event.type, d3.event);
                    event['changedTouches'] = d3.event.changedTouches;
                    event['touches'] = d3.event.touches;
                    (brushOverlay.node() as any).dispatchEvent(event);
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                });
        }

        function onClick(event: IEvent) {
            if (self._layer.onClick) {
                let passthruEvent: IEvent = { event: EventType.Click };
                if (value) {
                    passthruEvent.data = value;
                } else if (event.data !== undefined) {
                    if (isNaN(event.data)) {
                        passthruEvent.data = event.data;
                    } else {
                        passthruEvent.data = self.getOutputData().get(event.data);
                    }
                }
                self._layer.onClick(passthruEvent);
            }
        }
        function onDoubleClick(event: IEvent) {
            if (self._layer.onDoubleClick) {
                let passthruEvent: IEvent = { event: EventType.DoubleClick };
                if (value) {
                    passthruEvent.data = value;
                } else if (event.data !== undefined) {
                    if (isNaN(event.data)) {
                        passthruEvent.data = event.data;
                    } else {
                        passthruEvent.data = self.getOutputData().get(event.data);
                    }
                }
                self._layer.onDoubleClick(passthruEvent);
            }
        }
    }

    /** this adds some logic since the brush is behind the elements we need to
     * handle mouse/touch events properly to bring the brush to the front and
     * do the brush selection correctly.
     */
    protected configureItemInteractionPIXI(elem: any, value: any) {

        let self = this;
        elem.interactive = true;
        let wait: any;
        if (self._d3Chart.getOptions().disableBrush) {
            addClickHelper(elem, self._layer.onClick ? onClick : undefined,
                self._layer.onDoubleClick ? onDoubleClick : undefined,
                self._contextMenuItems,
                self._d3Chart.getTooltip(), self._d3Chart.getElement(), value);
        } else {
            self._d3Chart.getGraphGroup().attr('cursor', 'crosshair');
            elem.on('rightclick', function (event: any) {
                showContextMenu(d3.event, undefined, self._contextMenuItems);
            })
                .on('mousedown', function (e: any) {
                    let caller = self._d3Chart.getElement();
                    if (value) {
                        if (self._layer.onDoubleClick) {
                            if (wait) {
                                window.clearTimeout(wait);
                                wait = null;
                                onDoubleClick({
                                    caller: caller,
                                    event: EventType.DoubleClick,
                                    data: value
                                });
                                return;
                            } else {
                                wait = setTimeout(function () {
                                    if (wait) {
                                        onClick({
                                            caller: caller, event: EventType.Click,
                                            data: value
                                        });
                                        wait = null;
                                    }
                                }, 300);
                            }
                        } else {
                            onClick({
                                caller: caller, event: EventType.Click, data: value
                            });
                        }
                    }

                    let brush = self._d3Chart.getGraphGroup().select('.brush');
                    let event = new MouseEvent('mousedown', e.data.originalEvent);
                    let target = brush.select('.overlay').node();
                    Object.defineProperty(event, 'target', { value: target, enumerable: true });
                    target.dispatchEvent(event);
                    event.stopPropagation();
                })
                .on('mouseupoutside', function (e: any) {
                    let brushOverlay = self._d3Chart.getGraphGroup().select('.overlay');
                    let event = new MouseEvent('mouseup', e.data.originalEvent);
                    (brushOverlay.node() as any).dispatchEvent(event);
                    event.stopPropagation();
                });
        }

        function onClick(event: IEvent) {
            if (self._layer.onClick) {
                let passthruEvent: IEvent = { event: EventType.Click };
                if (value) {
                    passthruEvent.data = value;
                } else if (event.data !== undefined) {
                    if (isNaN(event.data)) {
                        passthruEvent.data = event.data;
                    } else {
                        passthruEvent.data = self.getOutputData().get(event.data);
                    }
                }
                self._layer.onClick(passthruEvent);
            }
        }
        function onDoubleClick(event: IEvent) {
            if (self._layer.onDoubleClick) {
                let passthruEvent: IEvent = { event: EventType.DoubleClick };
                if (value) {
                    passthruEvent.data = value;
                } else if (event.data !== undefined) {
                    if (isNaN(event.data)) {
                        passthruEvent.data = event.data;
                    } else {
                        passthruEvent.data = self.getOutputData().get(event.data);
                    }
                }
                self._layer.onDoubleClick(passthruEvent);
            }
        }
    }

    public clear() {
        this._d3Elems.forEach((elem) => {
            elem.remove();
        })
    }
}