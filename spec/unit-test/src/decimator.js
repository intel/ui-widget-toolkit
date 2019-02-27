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

let flameChartData = new SimpleBuffer(JSON.parse(fs.readFileSync(__dirname + '/../../data/data.flame')));
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

let xyPercentScale = d3.scaleLinear()
    .domain([0, 100])
    .clamp(true)
    .range([0, yPixels]);

let lastTraceValue = flameChartData.get(flameChartData.length() - 1);
let traceDomain =
    [flameChartData.get(0).traceValue.x,
    lastTraceValue.traceValue.x + lastTraceValue.traceValue.dx];
let tracePixelWidth = (traceDomain[1] - traceDomain[0]) / xPixels;
let traceErrorMargin = tracePixelWidth / 1000;

let traceXScale = d3.scaleLinear()
    .domain(traceDomain)
    .clamp(true)
    .range([0, xPixels]);


describe("decimator-sanity", function () {
    it("avgPoint", function () {
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
    });

    it("minPoint", function () {
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
    });

    it("maxPoint", function () {
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
    });

    it("NEWSPoint", function () {
        let newsPointDecimator = new NEWSPointDecimator()
        newsPointDecimator.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let newsValues = newsPointDecimator.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(50);
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
    });

    it("NEWSPointCrossCheck", function () {
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
    });

    it("xyPoint", function () {
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
    });

    it("summedValue", function () {
        let summedValue = new SummedValueXYSeriesDecimator()
        summedValue.initialize(xyXScale, xyXScale.invert, xyYScale);
        let startTime = Date.now();
        let maxValues = summedValue.decimateValues(xyDomain[0], xyDomain[1], xyData[0]);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(60);
        expect(maxValues.length).toBe(1200);

        // simple bounds checking
        maxValues.forEach((value, i) => {
            expect(value.x + xyErrorMargin).toBeGreaterThanOrEqual(xPixelWidth * i);
            expect(value.x - xyErrorMargin).toBeLessThanOrEqual(xPixelWidth * (i + 1));
            expect(value.y).toBeGreaterThanOrEqual(0);
            expect(value.y).toBeLessThanOrEqual(xPixelWidth * 10000);
        })
    });

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
    });

    it("summedValueMultiXY", function () {
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
    });

    it("mergedRect", function () {
        let mergedRect = new FlameChartMergeRectDecimator();
        mergedRect.initialize(traceXScale, traceXScale.invert);
        let startTime = Date.now();
        let mergedValues = mergedRect.decimateValues(traceDomain[0], traceDomain[1], flameChartData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(300);
        expect(mergedValues.length).toBeGreaterThanOrEqual(0);
        expect(mergedValues.length).toBeLessThanOrEqual(xPixels + 1);
    });

    it("reducedRect", function () {
        let limitRect = new FlameChartRectLimitDecimator();
        limitRect.initialize(traceXScale, traceXScale.invert);
        limitRect.setRectLimit(500);
        let startTime = Date.now();
        let limitvalues = limitRect.decimateValues(traceDomain[0], traceDomain[1], flameChartData);
        let endTime = Date.now();

        // expect decimation time to be < 50ms
        expect(endTime - startTime).toBeLessThanOrEqual(500);
        expect(limitvalues.length).toBe(500);
    });

    it("tracedResidency", function () {
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
            expect(stateData.length).toBe(xPixels);
            stateData.forEach((value, i) => {
                expect(value.x + traceErrorMargin).toBeGreaterThanOrEqual(tracePixelWidth * i + traceDomain[0]);
                expect(value.x - traceErrorMargin).toBeLessThanOrEqual(tracePixelWidth * (i + 1) + + traceDomain[0]);
                expect(value.y).toBeGreaterThanOrEqual(0);
                // this data has 12 simultaneous streams so the max residiency is 100% * 12 streams
                expect(value.y).toBeLessThanOrEqual(100 * 12);
            })
        })
    });

    it("tracedState", function () {
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
        expect(endTime - startTime).toBeLessThanOrEqual(100);
        expect(tracedStateValues.length).toBe(1200);

        // simple bounds checking
        tracedStateValues.forEach((value, i) => {
            expect(value.x + traceErrorMargin).toBeGreaterThanOrEqual(tracePixelWidth * i + traceDomain[0]);
            expect(value.x - traceErrorMargin).toBeLessThanOrEqual(tracePixelWidth * (i + 1) + traceDomain[0]);
        })
    });
});