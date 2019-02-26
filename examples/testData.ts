/// <reference path='../dist/index.d.ts' />

module TestData {
    export var pointsPerSeries = 10000;
    var yMax = 10000;
    var dataPerLane = 6;

    var seed = 1;
    function random() {
        var x = Math.sin(seed++);
        return x - Math.floor(x);
    }

    export var xyDataSets: UWT.IXYValue[][] = [];
    for (var i = 0; i < dataPerLane; ++i) {
        console.log('Make Set ' + i);
        var randSet: UWT.IXYValue[] = [];
        for (var j = 0; j < pointsPerSeries; ++j) {
            randSet.push({ x: j, y: random() * yMax });
        }
        xyDataSets.push(randSet);
    }

    export var xyDiscreteData: UWT.IXYValue[] = [
        { x: 'data-0', y: 10 },
        { x: 'data-1', y: 7 },
        { x: 'data-2', y: 20 }
    ];

    export var scatterEvents: string[] = ['data-0', 'data-1', 'data-2', 'def', 'test'];
    export var scatterData: UWT.IXYValue[][] = [new Array(), new Array(), new Array(), new Array(), new Array()];
    for (let i = 0; i < pointsPerSeries; ++i) {
        scatterData[i % scatterEvents.length].push({ x: i, y: scatterEvents[i % scatterEvents.length] });
    }

    // Define the area and graphs.
    export var defaultScalingInfo = new UWT.ScalingInfo(1, 'deg');
    export var MBRateScalingInfo = new UWT.ScalingInfo(1, 'MB/s');
    export var secScalingInfo = new UWT.ScalingInfo(1, 's');
    secScalingInfo.addScalar({ maxRange: 1, units: 'ms', scalar: 1000 });
    secScalingInfo.addScalar({ maxRange: .001, units: '\u00B5s', scalar: 1000000 });
    secScalingInfo.addScalar({ maxRange: .000001, units: 'ns', scalar: 1000000000 });

    // Define the area and graphs.
    export var timeAxis: UWT.IAxisDescription = {
        scaleType: UWT.AxisType.Linear,
        label: 'Time',
        scalingInfo: secScalingInfo
    };

    export let leftAxis: UWT.IAxisDescription = {
        scaleType: UWT.AxisType.Linear,
        label: 'Values1',
        scalingInfo: defaultScalingInfo
    };

    export let leftAxis2: UWT.IAxisDescription = {
        scaleType: UWT.AxisType.Linear,
        label: 'Values2',
        scalingInfo: MBRateScalingInfo,
        range: { min: 0, max: 10000 }
    };

    export let percentAxis: UWT.IAxisDescription = {
        scaleType: UWT.AxisType.Linear,
        label: '',
        scalingInfo: {
            baseScale: { scalar: 1, units: '%', maxRange: Number.MAX_VALUE }
        },
        range: { min: 0, max: 100 }
    };
};
