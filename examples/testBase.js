/// <reference path='../dist/index.d.ts' />
var TestBase;
(function (TestBase) {
    TestBase.elemManager = new UWT.ElementManager();
    TestBase.colorManager = new UWT.ColorManager();
    var elements = [];
    function addElement(element, tooltipGroup, hoverGroup, renderGroup, options) {
        if (options === void 0) { options = {}; }
        TestBase.elemManager.addElement(element, tooltipGroup, hoverGroup, renderGroup);
        elements.push({ elem: element, options: options });
    }
    TestBase.addElement = addElement;
    function render() {
        var elems = TestBase.elemManager.getElements();
        for (var i = 0; i < elements.length; ++i) {
            var elem = elements[i].elem;
            if (elem.type === UWT.UIType.Grid) {
                var r = new UWT.AgGridRenderer('div#graphArea' + i);
                r.invalidate(elem, elements[i].options);
            }
            else {
                var r = new UWT.D3Renderer('div#graphArea' + i, TestBase.colorManager);
                r.invalidate(elem, elements[i].options);
            }
        }
    }
    TestBase.render = render;
    function configureButtons() {
        if (document.getElementById('zoomReset')) {
            document.getElementById('zoomReset').addEventListener('click', zoomReset, false);
        }
        document.getElementById('addSelection').addEventListener('click', addSelection, false);
        document.getElementById('removeSelection').addEventListener('click', removeSelection, false);
        document.getElementById('clearSelection').addEventListener('click', clearSelection, false);
    }
    TestBase.configureButtons = configureButtons;
    function zoomReset() {
        var charts = TestBase.elemManager.getElements();
        for (var i = 0; i < charts.length; ++i) {
            var ts = Date.now();
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
    TestBase.zoomReset = zoomReset;
    function doSelectionEvent(event) {
        var charts = TestBase.elemManager.getElements();
        event.selection = UWT.getSelectionName(event.selection);
        for (var i = 0; i < charts.length; ++i) {
            var renderElements = charts[i].getElements();
            for (var j = 0; j < renderElements.length; ++j) {
                renderElements[j].api.hover(event);
            }
        }
    }
    TestBase.doSelectionEvent = doSelectionEvent;
    function clearSelection() {
        doSelectionEvent({
            event: UWT.EventType.HoverClear
        });
    }
    TestBase.clearSelection = clearSelection;
    function removeSelection() {
        var selection = document.getElementById('removeInput').value;
        doSelectionEvent({
            event: UWT.EventType.HoverEnd,
            selection: selection
        });
    }
    TestBase.removeSelection = removeSelection;
    function addSelection() {
        var selection = document.getElementById('addInput').value;
        doSelectionEvent({
            event: UWT.EventType.HoverStart,
            selection: selection
        });
    }
    TestBase.addSelection = addSelection;
})(TestBase || (TestBase = {}));
;
//# sourceMappingURL=testBase.js.map