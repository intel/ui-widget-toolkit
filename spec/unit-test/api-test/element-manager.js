/// <reference path='../../../dist/index.d.ts' />

window.onload = () => {
    {
        let elemMgr = new UWT.ElementManager();
        let chart = {
            title: 'Sync Data',
            type: UWT.UIType.Cartesian,
            dataSets: [{
                renderType: UWT.RenderType.Line,
                data: [{
                    name: 'data-' + 0, values: [
                        { x: 0, y: 123 },
                        { x: 50, y: 1 },
                        { x: 100, y: 200 }]
                }]
            }],
            isXContinuous: true
        }

        UWT.Chart.finalize(chart);
        elemMgr.addElement(chart, '', 'test')

        let r = new UWT.D3Renderer('div#graphArea0');
        r.invalidate(chart, { leftMargin: 100 });

        chart.api.zoom({
            event: UWT.EventType.Zoom,
            xStart: 20,
            xEnd: 80
        })

        let chart2 = {
            title: 'Sync 2',
            type: UWT.UIType.Cartesian,
            dataSets: [{
                renderType: UWT.RenderType.Line,
                data: [{
                    name: 'data-' + 0, values: [
                        { x: 0, y: 300 },
                        { x: 30, y: 100 },
                        { x: 100, y: 200 }]
                }]
            }],
            isXContinuous: true
        }

        UWT.Chart.finalize(chart2);
        elemMgr.addElement(chart2, '', 'test')
        let r2 = new UWT.D3Renderer('div#graphArea1');
        r2.invalidate(chart2, { leftMargin: 100 });

        setTimeout(() => {
            r2.clearDiv(document.getElementById('graphArea1'));
            r2.destroy(chart2);
            if (chart2.api.getOptions === undefined) {
                throw 'Error with getOptions API';
            }

            let options = chart2.api.getOptions();
            if (options.xStart !== 20 && options.xEnd !== 80) {
                throw 'Error with zoom values';
            }
            r2.invalidate(chart2, options);
        });
    }
}