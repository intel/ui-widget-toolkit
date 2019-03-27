/// <reference path='../../../dist/index.d.ts' />

window.onload = () => {
    {
        let chart = {
            title: 'Sync Data',
            type: UWT.UIType.Cartesian,
            dataSets: [{
                renderType: UWT.RenderType.Line,
                data: [{
                    name: 'data-' + 0, values: [
                        { x: 1, y: 123 },
                        { x: 2, y: 1 },
                        { x: 3, y: 200 }]
                }]
            }],
            isXContinuous: true
        }

        UWT.Chart.finalize(chart);

        let r = new UWT.D3Renderer('div#graphArea0');
        r.invalidate(chart, { leftMargin: 500 });

        // clear the view so we can test the API loading
        r.clearDiv(document.getElementById('graphArea0'));
        r.destroy(chart);
        if (chart.api.getOptions === undefined) {
            throw 'Error with getOptions API';
        }

        let options = chart.api.getOptions();
        if (options.leftMargin !== 500) {
            throw 'Error with getOptions values';
        }

        if (chart.api.zoom === undefined) {
            throw 'Error with zoom API';
        }

        if (chart.api.hover === undefined) {
            throw 'Error with hover API';
        }

        if (chart.api.brush === undefined) {
            throw 'Error with brush API';
        }

        if (chart.api.panLeft === undefined) {
            throw 'Error with panLeft API';
        }

        if (chart.api.panRight === undefined) {
            throw 'Error with panRight API';
        }

        r.invalidate(chart, { leftMargin: 200 });
    }
}