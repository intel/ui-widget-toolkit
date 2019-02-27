module UITest {
    window.onload = () => {
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
    }
};
