var UITest;
(function (UITest) {
    window.onload = function () {
        TestBase.configureButtons();
        LineTest.createView();
        AreaTest.createView();
        BarTest.createView();
        MinMaxValueTest.createView();
        PieTest.createView();
        ScatterTest.createView();
        BoxPlotTest.createView();
        FlameSunburstTest.createView();
        PortDiagramTest.createView();
        ConnectedGraphTest.createView();
        TreeMapTest.createView();
        HeatMapTest.createView();
        GradientLegendTest.createView();
        GridTest.createView();
        TestBase.render();
    };
})(UITest || (UITest = {}));
;
//# sourceMappingURL=uiTest.js.map