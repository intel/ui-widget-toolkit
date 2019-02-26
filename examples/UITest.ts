

module ChartTest {
    window.onload = () => {
        TestBase.configureButtons();

        LineTest.createView();
        AreaTest.createView();
        BarTest.createView();
        PieTest.createView();
        ScatterTest.createView();
        ConnectedGraphTest.createView();
        PortDiagramTest.createView();
        GridTest.createView();
        FlameSunburstTest.createView();
        TreeMapTest.createView();

        TestBase.render();
    }
};
