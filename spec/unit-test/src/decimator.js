import {
    AvgPointDecimator, MinPointDecimator, MaxPointDecimator, AvgContinuousDecimator,
    NEWSPointDecimator, NEWSStateDecimator, SimpleMarkerDecimator,
    XYPointDecimator, SummedValueXYSeriesDecimator, ResidencyDecimator,
    SummedValueMultiXYSeriesDecimator, TraceResidencyDecimator,
    FlameChartMergeRectDecimator, FlameChartRectLimitDecimator, TraceStateDecimator
} from '../../../src/core/cartesian/decimator/decimator';
import { SimpleBuffer } from '../../../src/core/utilities';

import * as d3 from 'd3';
import * as fs from 'fs';

// test xyData is six arrays of 100,000 points of xy data where the values
// of y range from 0-10,000
let rawXY = JSON.parse(fs.readFileSync(__dirname + '/../../data/data.xy'));
let xyData = [];
rawXY.forEach((data) => {
    xyData.push(new SimpleBuffer(data));
})

let flameChartData = new SimpleBuffer([JSON.parse(fs.readFileSync(__dirname + '/../../data/data.flame'))]);
let traceData = new SimpleBuffer(JSON.parse(fs.readFileSync(__dirname + '/../../data/data.trace')));

// make scales assume 1200 pixels
let xPixels = 1200;
let yPixels = 150;
let xyDomain = [0, xyData[0].length()];
let xPixelWidth = (xyDomain[1] - xyDomain[0]) / xPixels;
let xyErrorMargin = xPixelWidth / 10;

// xyScale goes 0 - number of points as x = point index
let xyXScale = d3.scaleLinear()
    .domain(xyDomain)
    .clamp(true)
    .range([0, xPixels]);

let xyYScale = d3.scaleLinear()
    .domain([0, 10000])
    .clamp(true)
    .range([0, yPixels]);

let flameDepthZero = flameChartData.get(0);
let lastTraceValue = flameDepthZero[flameDepthZero.length - 1];
let traceDomain =
    [flameDepthZero[0].traceValue.x,
    lastTraceValue.traceValue.x + lastTraceValue.traceValue.dx];
let tracePixelWidth = (traceDomain[1] - traceDomain[0]) / xPixels;
let traceErrorMargin = tracePixelWidth / 1000;

let traceXScale = d3.scaleLinear()
    .domain(traceDomain)
    .clamp(true)
    .range([0, xPixels]);

describe("decimator-sanity", function () {
    it("avg-point", function () {
        let avgPointDecimator = new AvgPointDecimator()
        avgPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let avgValues = avgPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(50);
        expect(avgValues.length).toBe(1200);

        // simple bounds checking
        avgValues.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
            expect(value.y).toBeGreaterThanOrEqual(0);
            expect(value.y).toBeLessThanOrEqual(10000);
        })
    }, 1000);

    it("min-point", function () {
        let minPointDecimator = new MinPointDecimator()
        minPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let minValues = minPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(50);
        expect(minValues.length).toBe(1200);

        // simple bounds checking
        minValues.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
            expect(value.y).toBeGreaterThanOrEqual(0);
            expect(value.y).toBeLessThanOrEqual(10000);
        })
    }, 1000);

    it("max-point", function () {
        let maxPointDecimator = new MaxPointDecimator()
        maxPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let maxValues = maxPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(50);
        expect(maxValues.length).toBe(1200);

        // simple bounds checking
        maxValues.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
            expect(value.y).toBeGreaterThanOrEqual(0);
            expect(value.y).toBeLessThanOrEqual(10000);
        })
    }, 1000);

    it("news-point", function () {
        let newsPointDecimator = new NEWSPointDecimator()
        newsPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let newsValues = newsPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(100);
        expect(newsValues.length).toBe(1200);

        // simple bounds checking
        newsValues.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
            expect(value.entry).toBeGreaterThanOrEqual(0);
            expect(value.entry).toBeLessThanOrEqual(10000);
            expect(value.exit).toBeGreaterThanOrEqual(0);
            expect(value.exit).toBeLessThanOrEqual(10000);
        })
    }, 1000);

    it("news-point-cross-check", function () {
        let newsPointDecimator = new NEWSPointDecimator()
        newsPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let newsValues = newsPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);

        // simple bounds checking
        let minPointDecimator = new MinPointDecimator()
        minPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let minValues = minPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);

        let maxPointDecimator = new MaxPointDecimator()
        maxPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let maxValues = maxPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);

        expect(newsValues.length).toBe(minValues.length);
        expect(newsValues.length).toBe(maxValues.length);

        for (let i = 0; i < newsValues.length; ++i) {
            expect(newsValues[i].min).toBe(minValues[i].y)
            expect(newsValues[i].max).toBe(maxValues[i].y)
        }
    }, 1000);

    it("xy-point", function () {
        let xyPointDecimator = new XYPointDecimator()
        xyPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let xyPoint = xyPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 400ms
        expect(endTime - startTime).toBeLessThanOrEqual(400);
        expect(xyPoint.length).toBeLessThan(xPixels * yPixels);

        // simple bounds checking
        xyPoint.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(0);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xyData[0].length());
            expect(value.y).toBeGreaterThanOrEqual(0);
            expect(value.y).toBeLessThanOrEqual(10000);
        })
    }, 1000);

    it("summed-value", function () {
        let summedValue = new SummedValueXYSeriesDecimator()
        summedValue.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let maxValues = summedValue.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(80);
        expect(maxValues.length).toBe(1200);

        // simple bounds checking
        maxValues.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
            expect(value.y).toBeGreaterThanOrEqual(0);
            expect(value.y).toBeLessThanOrEqual(xPixelWidth * 10000);
        })
    }, 1000);

    it("residency", function () {
        let residency = new ResidencyDecimator()
        residency.initialize(xyXScale, xyXScale.invert, xyYScale);

        let startTime = Date.now();
        let residencyValues = residency.decimateValues(xyDomain[0], xyDomain[1], xyData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(300);
        expect(residencyValues.length).toBe(6);

        // simple bounds checking
        residencyValues.forEach((groupData) => {
            expect(groupData.length).toBe(1200);

            groupData.forEach((value, i) => {
                expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
                expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
                expect(value.y).toBeGreaterThanOrEqual(0);
                expect(value.y).toBeLessThanOrEqual(100);
            })
        });
    }, 1000);

    it("summed-value-multi-xy", function () {
        let summedValueMultiXY = new SummedValueMultiXYSeriesDecimator()
        summedValueMultiXY.initialize(xyXScale, xyXScale.invert, xyYScale);

        let startTime = Date.now();
        let residencyValues = summedValueMultiXY.decimateValues(xyDomain[0], xyDomain[1], xyData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(500);
        expect(residencyValues.length).toBe(6);

        // simple bounds checking
        residencyValues.forEach((groupData) => {
            expect(groupData.length).toBe(1200);

            groupData.forEach((value, i) => {
                expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
                expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
                expect(value.y).toBeGreaterThanOrEqual(0);
                expect(value.y).toBeLessThanOrEqual(xPixelWidth * 10000);
            })
        });
    }, 1000);

    it("merged-rect", function () {
        let mergedRect = new FlameChartMergeRectDecimator();
        mergedRect.initialize(traceXScale, traceXScale.invert);
        let startTime = Date.now();
        let mergedValues = mergedRect.decimateValues(traceDomain[0], traceDomain[1], flameChartData);
        let endTime = Date.now();

        // expect decimation time to be < 250ms
        expect(endTime - startTime).toBeLessThanOrEqual(250);
        expect(mergedValues.length).toBeGreaterThanOrEqual(0);
        expect(mergedValues.length).toBeLessThanOrEqual(xPixels + 1);
    }, 1000);

    it("reduced-rect", function () {
        let limitRect = new FlameChartRectLimitDecimator();
        limitRect.initialize(traceXScale, traceXScale.invert);
        limitRect.setRectLimit(500);
        let startTime = Date.now();
        let limitvalues = limitRect.decimateValues(traceDomain[0], traceDomain[1], flameChartData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(500);
        expect(limitvalues.length).toBe(500);
    }, 1000);

    it("traced-residency", function () {
        let states = {};
        for (let i = 0; i < traceData.length(); ++i) {
            states[traceData.get(i).name] = true;
        }
        let stateList = Object.keys(states);

        let tracedResidency = new TraceResidencyDecimator();
        tracedResidency.initialize(traceXScale, traceXScale.invert, undefined, stateList);
        let startTime = Date.now();
        let tracedResidencyValues = tracedResidency.decimateValues(traceDomain[0], traceDomain[1], traceData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(100);
        expect(tracedResidencyValues.length).toBe(stateList.length);

        // simple bounds checking
        tracedResidencyValues.forEach((stateData, j) => {
            expect(stateData.length).toBeLessThanOrEqual(xPixels + 1);
            stateData.forEach((value, i) => {
                expect(value.x + traceErrorMargin).toBeGreaterThanOrEqual(tracePixelWidth * i + traceDomain[0]);
                expect(value.x - traceErrorMargin).toBeLessThanOrEqual(tracePixelWidth * (i + 1) + + traceDomain[0]);
                expect(value.y).toBeGreaterThanOrEqual(0);
                // this data has 12 simultaneous streams so the max residiency is 100% * 12 streams
                expect(value.y).toBeLessThanOrEqual(100 * 12);
            })
        })
    }, 1000);


    it("traced-residency-2", function () {
        let trace = new SimpleBuffer(JSON.parse(fs.readFileSync(__dirname + '/../../data/data.traceState')));
        let xDomain = d3.scaleLinear()
            .domain([0, 46.309034999999994,])
            .clamp(true)
            .range([0, xPixels]);

        let yStates = d3.scaleLinear()
            .domain(0, 100)
            .range([0, yPixels]);

        let tracedResidency = new TraceResidencyDecimator();
        tracedResidency.initialize(xDomain, xDomain.invert, undefined, ['State0', 'State1', 'State2', 'State3', 'State4']);
        let startTime = Date.now();
        let stateValues = tracedResidency.decimateValues(undefined, undefined, trace);
        let endTime = Date.now();

        // expect decimation time to be < 100ms
        expect(endTime - startTime).toBeLessThanOrEqual(100);
        expect(stateValues.length).toBe(5);

        let pixelTime = 46.309034999999994 / 1200;
        // simple bounds checking
        for (let i = 0; i < 1200; ++i) {
            let pixelSum = 0;
            for (let j = 0; j < stateValues.length; ++j) {
                let value = stateValues[j][i];
                expect(value.x + .01).toBeGreaterThanOrEqual(pixelTime * i);
                expect(value.x - .01).toBeLessThanOrEqual(pixelTime * (i + 1));
                pixelSum += value.y;
            }

            expect(pixelSum).toBeCloseTo(100, .01);
        }
    }, 1000);

    it("traced-state", function () {
        let states = {};
        for (let i = 0; i < traceData.length(); ++i) {
            states[traceData.get(i).name] = true;
        }
        let stateList = Object.keys(states);

        let tracedState = new TraceStateDecimator();
        tracedState.initialize(traceXScale, traceXScale.invert, undefined, stateList);
        let startTime = Date.now();
        let tracedStateValues = tracedState.decimateValues(traceDomain[0], traceDomain[1], traceData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(120);
        expect(tracedStateValues.length).toBe(1201);

        // simple bounds checking
        tracedStateValues.forEach((value, i) => {
            expect(value.x + traceErrorMargin).toBeGreaterThanOrEqual(tracePixelWidth * i + traceDomain[0]);
            expect(value.x - traceErrorMargin).toBeLessThanOrEqual(tracePixelWidth * (i + 1) + traceDomain[0]);
        })
    }, 1000);

    it("xy-state", function () {
        let stateXY = new SimpleBuffer(JSON.parse(fs.readFileSync(__dirname + '/../../data/data.xyState')));
        let stateXDomain = d3.scaleLinear()
            .domain([0, 46.4])
            .clamp(true)
            .range([0, xPixels]);

        let xyYScale = d3.scaleOrdinal()
            .domain(['CC0', 'CC1', 'CC3', 'CC6', 'CC7'])
            .range([0, yPixels]);

        let xyState = new NEWSStateDecimator();
        xyState.initialize(stateXDomain, stateXDomain.invert, xyYScale);
        let startTime = Date.now();
        let xyStateValues = xyState.decimateValues(undefined, undefined, stateXY);
        let endTime = Date.now();

        // expect decimation time to be < 100ms
        expect(endTime - startTime).toBeLessThanOrEqual(100);
        expect(xyStateValues.length).toBeLessThan(1200);

        // simple bounds checking
        xyStateValues.forEach((value) => {
            expect(value.x).not.toBeNaN();
            expect(typeof value.entry).toBe('string');
            expect(typeof value.exit).toBe('string');
            expect(typeof value.min).toBe('string');
            expect(typeof value.max).toBe('string');
        });
    }, 1000);
});