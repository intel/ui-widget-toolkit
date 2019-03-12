const { Builder, By, Key, assert, until } = require('selenium-webdriver');
const path = require('path');

describe('sanity', function () {
    let driver;

    beforeEach(function () {
        driver = new Builder()
            .forBrowser('chrome')
            .build();
    });

    afterEach(function () {
        driver.quit();
    });

    it('area', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/area/areaTest.html'));
        driver.findElement(By.id('graphArea0')).then(function (graph) {
            graph.findElements(By.tagName('svg')).then(function (graphs) {
                expect(graphs.length).toBe(2);
                graphs[0].findElements(By.className('chart-area')).then(function (charts) {
                    expect(charts.length).toBe(6);
                });
                driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                    graphs[0].findElements(By.className('cell')).then(function (cells) {
                        expect(cells.length).toBe(6);
                        cells[0].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-0')
                            });
                        });
                        cells[1].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-1')
                            });
                        });
                        cells[2].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-2')
                            });
                        });
                        cells[3].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-3')
                            });
                        });
                        cells[4].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-4')
                            });
                        });
                        cells[5].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-5')
                            });
                        });
                    });
                });
                graphs[0].findElements(By.className('axis')).then(function (axes) {
                    expect(axes.length).toBe(2);
                });
                graphs[0].findElement(By.className('lane-title')).then(function (title) {
                    title.getText().then(function (text) {
                        expect(text).toBe('Alpha Area');
                    });
                });
            })
        })
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            graph.findElements(By.tagName('svg')).then(function (graphs) {
                expect(graphs.length).toBe(2);
                graphs[0].findElements(By.className('chart-area')).then(function (charts) {
                    expect(charts.length).toBe(6);
                });
                driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                    graphs[0].findElements(By.className('cell')).then(function (cells) {
                        expect(cells.length).toBe(12);
                        cells[0].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-0')
                            });
                        });
                        cells[1].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-1')
                            });
                        });
                        cells[2].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-2')
                            });
                        });
                        cells[3].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-3')
                            });
                        });
                        cells[4].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-4')
                            });
                        });
                        cells[5].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-5')
                            });
                        });
                        cells[6].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-0')
                            });
                        });
                        cells[7].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-1')
                            });
                        });
                        cells[8].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-2')
                            });
                        });
                        cells[9].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-3')
                            });
                        });
                        cells[10].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-4')
                            });
                        });
                        cells[11].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-5')
                            });
                        });
                    });
                });
                graphs[0].findElements(By.className('axis')).then(function (axes) {
                    expect(axes.length).toBe(2);
                });
                graphs[0].findElement(By.className('lane-title')).then(function (title) {
                    title.getText().then(function (text) {
                        expect(text).toBe('Stacked Area');
                    });
                });
            })
        })
        driver.findElement(By.id('graphArea2')).then(function (graph) {
            graph.findElements(By.tagName('svg')).then(function (graphs) {
                expect(graphs.length).toBe(2);
                graphs[0].findElements(By.className('chart-area')).then(function (charts) {
                    expect(charts.length).toBe(6);
                });
                driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                    graphs[0].findElements(By.className('cell')).then(function (cells) {
                        expect(cells.length).toBe(6);
                    });
                });
                graphs[0].findElements(By.className('axis')).then(function (axes) {
                    expect(axes.length).toBe(2);
                });
                graphs[0].findElement(By.className('lane-title')).then(function (title) {
                    title.getText().then(function (text) {
                        expect(text).toBe('Computed Residency');
                        done();
                    });
                });
            });
        });
    }, 10000);

    it('bar', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/bar/barTest.html'));
        driver.findElement(By.id('graphArea0')).then(function (graph) {
            driver.wait(until.elementLocated(By.className('legendCells')), 1000).then(function () {
                graph.findElements(By.className('legendCells')).then(function (legend) {
                    expect(legend.length).toBe(1);

                    legend[0].findElements(By.className('cell')).then(function (cells) {
                        expect(cells.length).toBe(4);
                        cells[0].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-0')
                            });
                        });
                        cells[1].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-1')
                            });
                        });
                        cells[2].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('data-2')
                            });
                        });
                        cells[3].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('Data1')
                            });
                        });
                    });
                });
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Basic Bar');
                });
            });
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(3);
            });
            graph.findElements(By.className('chart-line')).then(function (line) {
                expect(line.length).toBe(1);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            driver.wait(until.elementLocated(By.className('legendCells')), 1000).then(function () {
                graph.findElements(By.className('legendCells')).then(function (legend) {
                    expect(legend.length).toBe(1);

                    legend[0].findElements(By.className('cell')).then(function (cells) {
                        expect(cells.length).toBe(4);

                        cells[0].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('tony')
                            });
                        });
                        cells[1].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('jak')
                            });
                        });
                        cells[2].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('michelle')
                            });
                        });
                        cells[3].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('Data1')
                            });
                        });
                    });
                });
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Multi Bar');
                });
            });
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(9);
            });
            graph.findElements(By.className('chart-line')).then(function (line) {
                expect(line.length).toBe(1);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea2')).then(function (graph) {
            driver.wait(until.elementLocated(By.className('legendCells')), 1000).then(function () {
                graph.findElements(By.className('legendCells')).then(function (legend) {
                    expect(legend.length).toBe(1);

                    legend[0].findElements(By.className('cell')).then(function (cells) {
                        expect(cells.length).toBe(4);
                        cells[0].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('tony')
                            });
                        });
                        cells[1].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('jak')
                            });
                        });
                        cells[2].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('michelle')
                            });
                        });
                        cells[3].findElement(By.tagName('text')).then(function (text) {
                            text.getText().then(function (value) {
                                expect(value).toBe('Data1')
                            });
                        });
                    });
                });
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Stacked Bar');
                });
            });
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(9);
            });
            graph.findElements(By.className('chart-line')).then(function (line) {
                expect(line.length).toBe(1);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea3')).then(function (graph) {
            graph.findElements(By.className('nested-axis')).then(function (nested) {
                expect(nested.length).toBe(16);
            });
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(96);
            });
            graph.findElements(By.className('cell')).then(function (cells) {
                expect(cells.length).toBe(4);
                cells[0].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('Failing')
                    });
                });
                cells[1].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('Workaround')
                    });
                });
                cells[2].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('Passing')
                    });
                });
                cells[3].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('Not Yet Tested/WIP')
                    });
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea4')).then(function (graph) {
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(20);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
        driver.findElement(By.id('graphArea5')).then(function (graph) {
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(3);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
        driver.findElement(By.id('graphArea6')).then(function (graph) {
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(9);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
        driver.findElement(By.id('graphArea7')).then(function (graph) {
            graph.findElements(By.className('chart-bar')).then(function (bars) {
                expect(bars.length).toBe(1);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
    }, 10000);

    it('connected-graph', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/connectedGraph/connectedGraphTest.html'));
        driver.findElement(By.id('graphArea0')).then(function (graph) {
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(7);
            });
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(5);
            });
            graph.findElements(By.className('cell')).then(function (legendCells) {
                expect(legendCells.length).toBe(4);
            });
        });
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(7);
            });
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(5);
            });
            graph.findElements(By.className('cell')).then(function (legendCells) {
                expect(legendCells.length).toBe(5);
                done();
            });
        });
    }, 10000);

    it('flame-sunburst', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/flameSunburst/flameSunburstTest.html'));
        driver.findElement(By.id('graphArea0')).then(function (graph) {
            graph.findElement(By.className('segments')).then(function (segment) {
                segment.findElements(By.tagName('rect')).then(function (rects) {
                    expect(rects.length > 30);
                });
            });
            graph.findElement(By.className('labels')).then(function (labels) {
                labels.findElements(By.tagName('text')).then(function (text) {
                    expect(text.length > 3);
                });
            });
            graph.findElement(By.className('background')).then(function (background) {
                expect(background !== undefined).toBe(true);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Flame Chart');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            graph.findElements(By.tagName('path')).then(function (segments) {
                expect(segments.length).toBe(392);
                done();
            });
        });
        driver.findElement(By.id('graphArea2')).then(function (graph) {
            graph.findElement(By.className('segments')).then(function (segment) {
                segment.findElements(By.tagName('rect')).then(function (rects) {
                    expect(rects.length > 100);
                });
            });
            graph.findElement(By.className('background')).then(function (background) {
                expect(background !== undefined).toBe(true);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Trace Data');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea3')).then(function (graph) {
            graph.findElement(By.className('chart-area')).then(function (area) {
                expect(area.length).toBe(19);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Trace Residency');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea4')).then(function (graph) {
            graph.findElement(By.className('chart-line')).then(function (line) {
                expect(line.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Trace State');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea5')).then(function (graph) {
            graph.findElement(By.className('chart-line')).then(function (line) {
                expect(line.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Trace State');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea6')).then(function (graph) {
            graph.findElement(By.className('chart-line')).then(function (line) {
                expect(line.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Trace State');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea7')).then(function (graph) {
            graph.findElements(By.tagName('canvas')).then(function (canvas) {
                expect(canvas.length).toBe(1);
                done();
            });
        });

    }, 10000);

    it('hierarchy-graph', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/hierarchyGraph/hierarchyGraphTest.html'));

        const element = By.className('link');
        driver.wait(until.elementLocated(element));

        driver.findElement(By.id('graphArea0')).then(function (graph) {
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(329);
            });
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(32);
            });
        });
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(9);
            });
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(7);
            });
        });
        driver.findElement(By.id('graphArea2')).then(function (graph) {
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(47);
            });
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(8);
            });
        });
        driver.findElement(By.id('graphArea3')).then(function (graph) {
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(43);
            });
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(8);
            });
        });
        driver.findElement(By.id('graphArea4')).then(function (graph) {
            graph.findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(191);
            });
            graph.findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(20);
                done();
            });
        });
    }, 10000);

    it('line', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/line/lineTest.html'));
        driver.findElement(By.id('graphArea0')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Step Graph');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Sync Data');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea2')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(6);
            });
            driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                graph.findElements(By.className('cell')).then(function (cells) {
                    expect(cells.length).toBe(12);
                    cells[0].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-0')
                        });
                    });
                    cells[1].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-1')
                        });
                    });
                    cells[2].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-2')
                        });
                    });
                    cells[3].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-3')
                        });
                    });
                    cells[4].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-4')
                        });
                    });
                    cells[5].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-5')
                        });
                    });
                    cells[6].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-0')
                        });
                    });
                    cells[7].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-1')
                        });
                    });
                    cells[8].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-2')
                        });
                    });
                    cells[9].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-3')
                        });
                    });
                    cells[10].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-4')
                        });
                    });
                    cells[11].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-5')
                        });
                    });
                });
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Stacked Line');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea3')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Logarithmic Y');
                });
            });
            driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                graph.findElements(By.className('cell')).then(function (cells) {
                    expect(cells.length).toBe(1);
                    cells[0].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-0')
                        });
                    });
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea4')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(1);
            });
            driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                graph.findElements(By.className('cell')).then(function (cells) {
                    expect(cells.length).toBe(1);
                    cells[0].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-0')
                        });
                    });
                });
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Y');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea5')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(2);
            });
            graph.findElements(By.className('cell')).then(function (cells) {
                expect(cells.length).toBe(1);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Ordinal X');
                });
            });
            driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                graph.findElements(By.className('cell')).then(function (cells) {
                    expect(cells.length).toBe(1);
                    cells[0].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('Data1')
                        });
                    });
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea6')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(2);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea7')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(1);
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
        });
        driver.findElement(By.id('graphArea8')).then(function (graph) {
            graph.findElements(By.className('chart-line')).then(function (lines) {
                expect(lines.length).toBe(3);
            });
            graph.findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('merged');
                });
            });
            graph.findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
    }, 10000);

    it('pie', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/pie/pieTest.html'));
        driver.findElement(By.id('graphArea0')).then(function (graph) {
            graph.findElements(By.className('arc')).then(function (arcs) {
                expect(arcs.length).toBe(3);
            });
            driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                graph.findElements(By.className('cell')).then(function (cells) {
                    expect(cells.length).toBe(3);
                    cells[0].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data@-0')
                        });
                    });
                    cells[1].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-%1')
                        });
                    });
                    cells[2].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-2')
                        });
                    });
                });
            });
        });
        driver.findElement(By.id('graphArea1')).then(function (graph) {
            graph.findElements(By.className('arc')).then(function (arcs) {
                expect(arcs.length).toBe(3);
            });
            driver.wait(until.elementLocated(By.className('cell')), 1000).then(function () {
                graph.findElements(By.className('cell')).then(function (cells) {
                    expect(cells.length).toBe(3);
                    cells[0].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data@-0')
                        });
                    });
                    cells[1].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-%1')
                        });
                    });
                    cells[2].findElement(By.tagName('text')).then(function (text) {
                        text.getText().then(function (value) {
                            expect(value).toBe('data-2')
                            done();
                        });
                    });
                });
            });
        });
    }, 10000);

    it('rect', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/rect/rectTest.html'));
        driver.findElements(By.tagName('svg')).then(function (graphs) {
            graphs[0].findElements(By.className('chart-rect')).then(function (rects) {
                expect(rects.length).toBe(2);
            });
            graphs[0].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[2].findElements(By.className('chart-rect')).then(function (rects) {
                expect(rects.length).toBe(2);
            });
            graphs[2].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[4].findElements(By.className('chart-rect')).then(function (rects) {
                expect(rects.length).toBe(4);
            });
            graphs[4].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[5].findElements(By.tagName('text')).then(function (text) {
                expect(text.length).toBe(2);
            });
            graphs[6].findElements(By.className('chart-rect')).then(function (rects) {
                expect(rects.length).toBe(4);
            });
            graphs[6].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[7].findElements(By.tagName('text')).then(function (text) {
                expect(text.length).toBe(2);
                done();
            });
        });
    }, 10000);

    it('scatter', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/scatter/scatterTest.html'));
        driver.findElements(By.tagName('svg')).then(function (graphs) {
            graphs[0].findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Ordinal Y');
                });
            });
            graphs[0].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[2].findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Scatter+Line');
                });
            });
            graphs[2].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(3);
            });
            graphs[4].findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('Same Scatter/Line');
                });
            });
            graphs[4].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[6].findElement(By.className('lane-title')).then(function (title) {
                title.getText().then(function (text) {
                    expect(text).toBe('One Data, Many Decimators');
                });
            });
            graphs[6].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[6].findElements(By.className('cell')).then(function (cells) {
                expect(cells.length).toBe(3);
                cells[0].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('data-0 Min')
                    });
                });
                cells[1].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('data-0 Avg')
                    });
                });
                cells[2].findElement(By.tagName('text')).then(function (text) {
                    text.getText().then(function (value) {
                        expect(value).toBe('data-0 Max')
                        done();
                    });
                });
            });
            graphs[9].findElements(By.tagName('circle')).then(function (circles) {
                expect(circles.length).toBe(3);
            });
            graphs[9].findElements(By.tagName('text')).then(function (text) {
                expect(text.length).toBe(3);
            });
            graphs[11].findElements(By.tagName('circle')).then(function (circles) {
                expect(circles.length).toBe(6);
            });
            graphs[11].findElements(By.tagName('text')).then(function (text) {
                expect(text.length).toBe(6);
            });
        });
    }, 10000);

    it('min-max', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/minMaxValue/minMaxValueTest.html'));
        driver.findElements(By.tagName('svg')).then(function (graphs) {
            expect(graphs.length).toBe(6);
            graphs[1].findElements(By.tagName('circle')).then(function (circles) {
                expect(circles.length).toBe(3);
            });
            graphs[1].findElements(By.className('chart-min-max-value-line')).then(function (lines) {
                expect(lines.length).toBe(3);
            });
            graphs[0].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[3].findElements(By.tagName('circle')).then(function (circles) {
                expect(circles.length).toBe(3);
            });
            graphs[3].findElements(By.className('chart-min-max-value-line')).then(function (lines) {
                expect(lines.length).toBe(3);
            });
            graphs[2].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[5].findElements(By.tagName('circle')).then(function (circles) {
                expect(circles.length).toBe(3);
            });
            graphs[5].findElements(By.className('chart-min-max-value-line')).then(function (lines) {
                expect(lines.length).toBe(3);
            });
            graphs[4].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
    }, 10000);

    it('box-plot', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/boxPlot/boxPlotTest.html'));
        driver.findElements(By.tagName('svg')).then(function (graphs) {
            expect(graphs.length).toBe(6);
            graphs[1].findElements(By.tagName('rect')).then(function (rect) {
                expect(rect.length).toBe(3);
            });
            graphs[1].findElements(By.className('chart-box-plot-line')).then(function (lines) {
                expect(lines.length).toBe(12);
            });
            graphs[0].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[3].findElements(By.tagName('rect')).then(function (rect) {
                expect(rect.length).toBe(3);
            });
            graphs[3].findElements(By.className('chart-box-plot-line')).then(function (lines) {
                expect(lines.length).toBe(12);
            });
            graphs[2].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
            });
            graphs[5].findElements(By.tagName('rect')).then(function (rect) {
                expect(rect.length).toBe(3);
            });
            graphs[5].findElements(By.className('chart-box-plot-line')).then(function (lines) {
                expect(lines.length).toBe(12);
            });
            graphs[4].findElements(By.className('axis')).then(function (axes) {
                expect(axes.length).toBe(2);
                done();
            });
        });
    }, 10000);

    it('gradient-legend', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/gradientLegend/gradientLegendTest.html'));
        driver.findElements(By.tagName('svg')).then(function (graphs) {
            expect(graphs.length).toBe(2);
            graphs[0].findElements(By.className('gradient')).then(function (rect) {
                expect(rect.length).toBe(4);
                done();
            });
        });
    }, 10000);

    it('heat-map', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/heatMap/heatMapTest.html'));
        driver.findElements(By.tagName('canvas')).then(function (canvas) {
            expect(canvas.length).toBe(3);
            done();
        });
    }, 10000);

    it('port-diagram', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples/portDiagram/portDiagramTest.html'));
        driver.findElements(By.tagName('svg')).then(function (graphs) {
            expect(graphs.length).toBe(3);
            graphs[0].findElements(By.className('node')).then(function (nodes) {
                expect(nodes.length).toBe(8);
            });
            graphs[0].findElements(By.className('port')).then(function (ports) {
                expect(ports.length).toBe(17);
            });
            graphs[0].findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(9);
            });
            graphs[1].findElements(By.className('border')).then(function (nodes) {
                expect(nodes.length).toBe(7);
            });
            graphs[1].findElements(By.className('title-box')).then(function (nodes) {
                expect(nodes.length).toBe(7);
            });
            graphs[1].findElements(By.className('port')).then(function (ports) {
                expect(ports.length).toBe(17);
            });
            graphs[1].findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(9);
            });
            graphs[2].findElements(By.className('border')).then(function (nodes) {
                expect(nodes.length).toBe(7);
            });
            graphs[2].findElements(By.className('title-box')).then(function (nodes) {
                expect(nodes.length).toBe(7);
            });
            graphs[2].findElements(By.className('port')).then(function (ports) {
                expect(ports.length).toBe(17);
            });
            graphs[2].findElements(By.className('link')).then(function (links) {
                expect(links.length).toBe(9);
            });
        });
        driver.findElements(By.tagName('canvas')).then(function (graphs) {
            expect(graphs.length).toBe(3);
            done();
        });
    }, 10000);

    it('vue', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples-frameworks/vue/vue.html'));
        driver.findElements(By.tagName('canvas')).then(function (canvas) {
            expect(canvas.length).toBe(1);
        });
        driver.findElements(By.tagName('svg')).then(function (svg) {
            expect(svg.length).toBe(10);
        });
        driver.findElements(By.className('ag-root')).then(function (grid) {
            expect(grid.length).toBe(1);
        });
        driver.findElements(By.className('node-row')).then(function (nodes) {
            expect(nodes.length).toBe(3);
            done();
        });
    }, 10000);

    it('angular1', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples-frameworks/angular1/angular1Test.html'));
        driver.findElements(By.tagName('canvas')).then(function (canvas) {
            expect(canvas.length).toBe(1);
        });
        driver.findElements(By.tagName('svg')).then(function (svg) {
            expect(svg.length).toBe(16);
        });
        driver.findElements(By.className('ag-root')).then(function (grid) {
            expect(grid.length).toBe(1);
            done();
        });
    }, 10000);

    it('angular2', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples-frameworks/angular2/angular2Test.html'));
        driver.findElements(By.tagName('canvas')).then(function (canvas) {
            expect(canvas.length).toBe(1);
        });
        driver.findElements(By.tagName('svg')).then(function (svg) {
            expect(svg.length).toBe(20);
        });
        driver.findElements(By.className('ag-root')).then(function (grid) {
            expect(grid.length).toBe(1);
        });
        driver.findElements(By.className('node-row')).then(function (nodes) {
            expect(nodes.length).toBe(7);
            done();
        });
    }, 10000);


    it('react', function (done) {
        driver.get('file://' + path.join(__dirname + '../../../examples-frameworks/react/react.html'));
        driver.findElements(By.tagName('canvas')).then(function (canvas) {
            expect(canvas.length).toBe(1);
        });
        driver.findElements(By.tagName('svg')).then(function (svg) {
            expect(svg.length).toBe(24);
        });
        driver.findElements(By.className('ag-root')).then(function (grid) {
            expect(grid.length).toBe(1);
        });
        driver.findElements(By.className('node-row')).then(function (nodes) {
            expect(nodes.length).toBe(6);
            done();
        });
    }, 10000);
});
