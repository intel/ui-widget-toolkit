/// <reference path='../dist/index.d.ts' />
var TestData;
(function (TestData) {
    TestData.pointsPerSeries = 10000;
    var yMax = 10000;
    var dataPerLane = 6;
    var seed = 1;
    function random() {
        var x = Math.sin(seed++);
        return x - Math.floor(x);
    }
    TestData.xyDataSets = [];
    for (var i = 0; i < dataPerLane; ++i) {
        console.log('Make Set ' + i);
        var randSet = [];
        for (var j = 0; j < TestData.pointsPerSeries; ++j) {
            randSet.push({ x: j, y: random() * yMax });
        }
        TestData.xyDataSets.push(randSet);
    }
    TestData.xyDiscreteData = [
        { x: 'data-0', y: 10 },
        { x: 'data-1', y: 7 },
        { x: 'data-2', y: 20 }
    ];
    TestData.scatterEvents = ['data-0', 'data-1', 'data-2', 'def', 'test'];
    TestData.scatterData = [new Array(), new Array(), new Array(), new Array(), new Array()];
    for (var i_1 = 0; i_1 < TestData.pointsPerSeries; ++i_1) {
        TestData.scatterData[i_1 % TestData.scatterEvents.length].push({ x: i_1, y: TestData.scatterEvents[i_1 % TestData.scatterEvents.length] });
    }
    // Define the area and graphs.
    TestData.defaultScalingInfo = new UWT.ScalingInfo(1, 'deg');
    TestData.MBRateScalingInfo = new UWT.ScalingInfo(1, 'MB/s');
    TestData.secScalingInfo = new UWT.ScalingInfo(1, 's');
    TestData.secScalingInfo.addScalar({ maxRange: 1, units: 'ms', scalar: 1000 });
    TestData.secScalingInfo.addScalar({ maxRange: .001, units: '\u00B5s', scalar: 1000000 });
    TestData.secScalingInfo.addScalar({ maxRange: .000001, units: 'ns', scalar: 1000000000 });
    // Define the area and graphs.
    TestData.timeAxis = {
        scaleType: UWT.AxisType.Linear,
        label: 'Time',
        scalingInfo: TestData.secScalingInfo
    };
    TestData.leftAxis = {
        scaleType: UWT.AxisType.Linear,
        label: 'Values1',
        scalingInfo: TestData.defaultScalingInfo
    };
    TestData.leftAxis2 = {
        scaleType: UWT.AxisType.Linear,
        label: 'Values2',
        scalingInfo: TestData.MBRateScalingInfo,
        range: { min: 0, max: 10000 }
    };
    TestData.percentAxis = {
        scaleType: UWT.AxisType.Linear,
        label: '',
        scalingInfo: {
            baseScale: { scalar: 1, units: '%', maxRange: Number.MAX_VALUE }
        },
        range: { min: 0, max: 100 }
    };
})(TestData || (TestData = {}));
;
//# sourceMappingURL=testData.js.map