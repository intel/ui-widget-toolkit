/// <reference path='../dist/index.d.ts' />

module TestBase {
    export var elemManager = new UWT.ElementManager();
    export var colorManager = new UWT.ColorManager();

    export function render() {
        var elems = elemManager.getElements();
        for (var i = 0; i < elems.length; ++i) {
            let elem = elems[i];
            if (elem.type === UWT.UIType.Grid) {
                let r = new UWT.AgGridRenderer('div#graphArea' + i);
                r.invalidate(elem, {});
            } else {
                let r = new UWT.D3Renderer('div#graphArea' + i, colorManager);
                r.invalidate(elem, {});
            }
        }
    }

    export function configureButtons() {
        if (document.getElementById('zoomReset')) {
            document.getElementById('zoomReset').addEventListener(
                'click', zoomReset, false);
        }
        document.getElementById('addSelection').addEventListener(
            'click', addSelection, false);
        document.getElementById('removeSelection').addEventListener(
            'click', removeSelection, false);
        document.getElementById('clearSelection').addEventListener(
            'click', clearSelection, false);
    }

    export function zoomReset() {
        var charts = elemManager.getElements();
        for (var i = 0; i < charts.length; ++i) {
            let ts = Date.now();
            if (charts[i].api.zoom) {
                charts[i].api.zoom({
                    event: UWT.EventType.Zoom,
                    xStart: undefined,
                    xEnd: undefined
                });
            }
            console.log(Date.now() - ts);
        }
    }

    export function doSelectionEvent(event: any) {
        var charts = elemManager.getElements();

        event.selection = UWT.getSelectionName(event.selection);
        for (var i = 0; i < charts.length; ++i) {
            let renderElements = charts[i].getElements();
            for (var j = 0; j < renderElements.length; ++j) {
                renderElements[j].api.hover(event);
            }
        }
    }

    export function clearSelection() {
        doSelectionEvent({
            event: UWT.EventType.HoverClear
        });
    }

    export function removeSelection() {
        let selection = (<any>document.getElementById('removeInput')).value;
        doSelectionEvent({
            event: UWT.EventType.HoverEnd,
            selection: selection
        });
    }

    export function addSelection() {
        let selection = (<any>document.getElementById('addInput')).value;
        doSelectionEvent({
            event: UWT.EventType.HoverStart,
            selection: selection
        });
    }
};
