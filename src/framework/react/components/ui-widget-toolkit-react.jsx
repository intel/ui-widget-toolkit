import * as React from 'react';
import * as UWT from 'ui-widget-toolkit';

export class UWTChart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }

        if (this.props.chartDef) {
            this.renderer.setDiv(this.chart.current);
            UWT.Chart.finalize(this.props.chartDef);
            this.renderer.invalidate(this.props.chartDef, this.props.renderOptions);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chartDef !== this.props.chartDef) {
            this.update();
        }
    }

    render() {
        if (this.props.chartTitle) {
            return <div style={this.props.style}>
                <div className='chart-title'>{this.props.chartTitle}</div>
                <div ref={this.chart} id='chart'></div>
            </div>;
        } else {
            return <div style={this.props.style} ref={this.chart} id='chart'></div>;
        }
    }
}

export class UWTSwimlaneChart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
        this.state = {
            chartDefs: [],
            renderOptions: {}
        }
        this.chartOptions = [];
        this.elemManager = props.elemManager;
    }

    getChartOptions(index) {
        if (index < this.chartOptions.length) {
            return this.chartOptions[index];
        }
        return this.renderOptions;
    }
    update() {
        if (this.props.chartDefs &&
            this.props.chartDefs != this.state.chartDefs) {
            let newList = this.props.chartDefs;
            let oldList = this.state.chartDefs;
            let chartMap = new Map();
            if (newList) {
                for (let i = 0; i < newList.length; ++i) {
                    chartMap.set(newList[i], true);
                }
            }
            let legends = [];
            if (oldList) {
                for (let i = 0; i < oldList.length; ++i) {
                    var oldChart = oldList[i];
                    if (!chartMap.has(oldChart)) {
                        UWT.ChartGroup.handleRemoveChart(oldChart);
                    }
                    if (oldChart.legends) {
                        legends = legends.concat(oldChart.legends);
                    }
                }
            } else {
                if (this.props.chartDefs !== undefined) {
                    for (let i = 0; i < this.props.chartDefs.length; ++i) {
                        if (this.props.chartDefs[i].legends) {
                            legends = legends.concat(this.props.chartDefs[i].legends);
                        }
                    }
                }
            }

            if (this.props.chartDefs) {
                UWT.ChartGroup.handleChartUpdate(this.props.chartDefs,
                    this.chartOptions, this, legends);
            }
            this.setState({
                chartDefs: this.props.chartDefs,
                renderOptions: this.props.renderOptions
            });
        }
        if (this.props.renderOptions &&
            this.props.renderOptions != this.state.renderOptions) {
            UWT.ChartGroup.handleRenderOptionsUpdate(this, this.props.renderOptions,
                this.chartOptions);
            this.setState({
                chartDefs: this.props.chartDefs,
                renderOptions: this.props.renderOptions
            });
        }

        if (this.props.chartDefs !== undefined) {
            let hasXAxis = false;
            for (let i = this.props.chartDefs.length - 1; i >= 0; --i) {
                let chart = this.props.chartDefs[i];
                if (!chart.hide) {
                    for (let j = 0; j < chart.axes.length; ++j) {
                        if (chart.axes[j].alignment === UWT.Alignment.Bottom) {
                            if (chart.axes[j].hidden != hasXAxis) {
                                chart.axes[j].hidden = hasXAxis;
                                if (chart.renderer) {
                                    chart.renderer.invalidate(chart);
                                }
                            }
                        }
                    }
                    hasXAxis = true;
                }
            }
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    render() {
        if (this.props.chartTitle) {
            return <div>
                <div className='chart-title'>{this.props.chartTitle}</div>
                {this.state.chartDefs.map((chartDef, i) => {
                    let style = chartDef.hide ? { display: 'none' } : {};
                    return <UWTChart key={i} chartDef={chartDef}
                        renderOptions={this.getChartOptions(i)}
                        colorManager={this.props.colorManager}
                        onRender={this.props.onRender}
                        renderer={this.props.renderer}
                        style={style} />
                })}
            </div>;
        } else {
            return <div>
                {this.state.chartDefs.map((chartDef, i) => {
                    let style = chartDef.hide ? { display: 'none' } : {};
                    return <UWTChart key={i} chartDef={chartDef}
                        renderOptions={this.getChartOptions(i)}
                        colorManager={this.props.colorManager}
                        onRender={this.props.onRender}
                        renderer={this.props.renderer}
                        style={style} />
                })}
            </div>;
        }
    }
}

export class UWTPieChart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }

        if (this.props.chartDef) {
            this.renderer.setDiv(this.chart.current);
            this.renderer.invalidate(this.props.chartDef, this.props.renderOptions);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chartDef !== this.props.chartDef) {
            this.update();
        }
    }

    render() {
        if (this.props.chartTitle) {
            return <div>
                <div className='chart-title'>{this.props.chartTitle}</div>
                <div ref={this.chart} id='chart'></div>
            </div>;
        } else {
            return <div ref={this.chart} id='chart'></div>;
        }
    }
}

export class UWTGrid extends React.Component {
    constructor(props) {
        super(props);
        this.grid = React.createRef();
        // shallow copy
        this.gridStyle = Object.assign({}, { height: '400px' }, this.props.gridStyle);
        if (this.props.gridClass) {
            this.gridClass = this.props.gridClass;
        } else {
            this.gridClass = 'ag-theme-fresh';
        }
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.AgGridRenderer(undefined, undefined, this.props.colorManager);
        }
        this.renderer.setOnRenderCallback(this.props.onRender);

        if (this.props.gridDef) {
            this.renderer.setDiv(this.props.gridDef, this.grid.current);
            this.renderer.invalidate(this.props.gridDef);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.gridDef !== this.props.gridDef) {
            this.update();
        }
    }

    render() {
        if (this.props.gridTitle) {
            return <div>
                <div className='grid-title'>{this.props.gridTitle}</div>
                <div ref={this.grid} id='grid' className={this.gridClass}
                    style={this.gridStyle} ></div>
            </div>;
        } else {
            return <div ref={this.grid} id='grid' className={this.gridClass}
                style={this.gridStyle} ></div>;
        }
    }
}

export class UWTFlowDiagram extends React.Component {
    constructor(props) {
        super(props);
        this.diagram = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }
        this.renderer.setOnRenderCallback(this.props.onRender);

        if (this.props.diagramDef) {
            this.renderer.setDiv(this.diagram.current);
            this.renderer.invalidate(this.props.diagramDef, this.props.renderOptions);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        if (prevProps.diagramDef !== this.props.diagramDef) {
            this.update();
        }
    }

    render() {
        if (this.props.diagramTitle) {
            return <div>
                <div className='diagram-title'>{this.props.diagramTitle}</div>
                <div ref={this.diagram} id='diagram'></div>
            </div>;
        } else {
            return <div ref={this.diagram} id='diagram'></div>;
        }
    }
}

export class UWTGraph extends React.Component {
    constructor(props) {
        super(props);
        this.graph = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }
        this.renderer.setOnRenderCallback(this.props.onRender);

        if (this.props.graphDef) {
            this.renderer.setDiv(this.graph.current);
            this.renderer.invalidate(this.props.graphDef, this.props.renderOptions);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.graphDef !== this.props.graphDef) {
            this.update();
        }
    }

    render() {
        if (this.props.graphTitle) {
            return <div>
                <div className='graph-title'>{this.props.graphTitle}</div>
                <div ref={this.graph} id='graph'></div>
            </div>;
        } else {
            return <div ref={this.graph} id='graph'></div>;
        }
    }
}

export class UWTHierarchyGraph extends React.Component {
    constructor(props) {
        super(props);
        this.graph = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }
        this.renderer.setOnRenderCallback(this.props.onRender);


        if (this.props.graphDef) {
            this.renderer.setDiv(this.graph.current);
            this.renderer.invalidate(this.props.graphDef, this.props.renderOptions);
        }
        if (!this.props.graphDef) {
            while (this.graph.current.firstChild) {
                this.graph.current.remove(this.graph.current.firstChild);
            }
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.graphDef !== this.props.graphDef) {
            this.update();
        }
    }

    render() {
        if (this.props.graphTitle) {
            return <div>
                <div className='graph-title'>{this.props.graphTitle}</div>
                <div ref={this.graph} id='graph'></div>
            </div>;
        } else {
            return <div ref={this.graph} id='graph'></div>;
        }
    }
}

export class UWTSunburstChart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }
        this.renderer.setOnRenderCallback(this.props.onRender);

        if (this.props.chartDef) {
            this.renderer.setDiv(this.chart.current);
            this.renderer.invalidate(this.props.chartDef, this.props.renderOptions);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chartDef !== this.props.chartDef) {
            this.update();
        }
    }

    render() {
        if (this.props.chartTitle) {
            return <div>
                <div className='chart-title'>{this.props.chartTitle}</div>
                <div ref={this.chart} id='chart'></div>
            </div>;
        } else {
            return <div ref={this.chart} id='chart'></div>;
        }
    }
}

export class UWTTreeMap extends React.Component {
    constructor(props) {
        super(props);
        this.tree = React.createRef();
    }

    update() {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.props.colorManager);
        }
        this.renderer.setOnRenderCallback(this.props.onRender);

        if (this.props.treeDef) {
            this.renderer.setDiv(this.chart.current);
            this.renderer.invalidate(this.props.treeDef, this.props.renderOptions);
        }
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.treeDef !== this.props.treeDef) {
            this.update();
        }
    }

    render() {
        if (this.props.treeTitle) {
            return <div>
                <div className='tree-title'>{this.props.treeTitle}</div>
                <div ref={this.tree} id='tree'></div>
            </div>;
        } else {
            return <div ref={this.tree} id='tree'></div>;
        }
    }
}