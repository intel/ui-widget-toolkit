/// <reference path='../dist/index.d.ts' />

module TestBase {
    export var elemManager = new UWT.ElementManager();
    export var colorManager = new UWT.ColorManager();

    let elements: any = [];
    export function addElement(element: UWT.UIElement, tooltipGroup?: string,
        hoverGroup?: string, renderGroup?: string, options: UWT.IOptions = {}) {

        elemManager.addElement(element, tooltipGroup, hoverGroup, renderGroup);
        elements.push({ elem: element, options: options });
    }

    export function render() {
        var elems = elemManager.getElements();
        for (var i = 0; i < elements.length; ++i) {
            let elem = elements[i].elem;
            if (elem.type === UWT.UIType.Grid) {
                let r = new UWT.AgGridRenderer('div#graphArea' + i);
                r.invalidate(elem, elements[i].options);
            } else {
                let r = new UWT.D3Renderer('div#graphArea' + i, colorManager);
                r.invalidate(elem, elements[i].options);
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
                renderElements[j].api.focus(event);
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
