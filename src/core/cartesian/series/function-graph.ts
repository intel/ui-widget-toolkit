import { ICss } from '../../../interface/ui-base';
import { IXYSeries, ILayer, IXYLayer } from '../../../interface/chart/chart'
import { ID3Chart, D3Axis, D3Chart } from '../chart';
import { ICartesianSeriesPlugin } from '../../../interface/chart/series';

import { D3XYSeries } from './xy';

export class D3FunctionSeries extends D3XYSeries implements ICartesianSeriesPlugin {
    public static canRender(layer: ILayer): boolean {
        return layer.data[0] && layer.data[0].hasOwnProperty('functionMap');
    }

    protected _data: IXYSeries;
    protected _colors: { [index: string]: string };
    protected _classes: string;
    protected _layer: IXYLayer;
    protected _worker: Worker;

    constructor(chart: ID3Chart, layer: ILayer,
        svg: d3.Selection<d3.BaseType, {}, d3.BaseType, any>,
        xAxis: D3Axis, yAxis: D3Axis, isXContinuous: boolean) {

        super(chart, layer, svg, xAxis, yAxis, isXContinuous);
        this.setData(layer);
    }


    public setData(layer: ILayer) {
        super.setData(layer);
    }

    /** check if this series is continuous */
    public isYContinuousSeries() {
        return true;
    }

    public getCss(): ICss {
        return this._data.css;
    }

    /** get all discrete x values */
    public getDiscreteXValues(isStacked: boolean): string[] {
        return undefined;
    }

    /** get all discrete y values */
    public getDiscreteYValues(): string[] {
        return undefined;
    }

    /** get x min max values for the object */
    public getXMinMax(): number[] {
        return [this._data.functionMap.xMin, this._data.functionMap.xMax];
    }

    /** get y min max values for the object */
    public getYMinMax(): number[] {
        return [this._data.functionMap.yMin, this._data.functionMap.yMax];
    }

    public decimateData(xStart: number, xEnd: number, xAxis: D3Axis, yAxis: D3Axis): Promise<any> {
        let self = this;

        return new Promise<any>(function (resolve, reject) {
            // If there's already data remove it
            let domain = self._d3XAxis.getDomain();
            let pixels = self._d3XAxis.getRangePixels();
            if (!xStart) {
                xStart = domain[0];
            }
            if (!xEnd) {
                xEnd = domain[1];
            }

            if (pixels > 0) {
                let output = [];
                let step = (xEnd - xStart) / pixels;
                let x = xStart;
                let y = (self._data.functionMap).y;
                for (let i = 0; i < pixels; ++i) {
                    output.push({ x: x, y: y(x) });
                    x += step;
                }
                self.setOutputData(output);
            }

            resolve();
        });
    }
}
D3Chart.register(D3FunctionSeries);