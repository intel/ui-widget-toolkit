import { AxisType } from '../../../interface/chart/chart';
import { SimpleBuffer } from '../../utilities';
import { InternalDecimatorMap } from './decimator';
import * as d3 from 'd3';

// Worker.ts
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", (message) => {
    let xScale: any;
    let yScale: any;
    let def = message.data;
    if (def.xAxis.axisDesc.scaleType === AxisType.Ordinal) {
        xScale = d3.scaleBand().range([0, def.xRange]).padding(0.1)
            .align(0.5).domain(def.xDomain);
    } else {
        if (def.xAxis.axisDesc.scaleType === AxisType.Linear) {
            xScale = d3.scaleLinear().domain(def.xDomain).clamp(true);
        } else if (def.xAxis.axisDesc.scaleType === AxisType.Logarithmic) {
            xScale = d3.scaleLog().domain(def.xDomain).clamp(true);
        }

        xScale.range([0, def.xRange]);
    }

    if (def.yAxis) {
        if (def.yAxis.axisDesc.scaleType === AxisType.Ordinal) {
            yScale = d3.scaleBand().range([0, def.yRange]).padding(0.1)
                .align(0.5).domain(def.yDomain);
        } else {
            if (def.yAxis.axisDesc.scaleType === AxisType.Linear) {
                yScale = d3.scaleLinear().domain(def.yDomain).clamp(true);
            } else if (def.yAxis.axisDesc.scaleType === AxisType.Logarithmic) {
                yScale = d3.scaleLog().domain(def.yDomain).clamp(true);
            }

            yScale.range([def.yRange, 0]);
        }
    }

    let decimator: any = InternalDecimatorMap[def.decimatorName];
    decimator.initialize(xScale, xScale.invert, yScale, def.names);

    // ugly hardcode for now
    let values: any;
    if (!def.names) {
        values = new SimpleBuffer(def.values);
    } else {
        values = [];
        for (let i = 0; i < def.values.length; ++i) {
            values[i] = new SimpleBuffer(def.values[i]);
        }
    }

    let data = decimator.decimateValues(def.xStart, def.xEnd, values);
    ctx.postMessage(data, undefined);
});