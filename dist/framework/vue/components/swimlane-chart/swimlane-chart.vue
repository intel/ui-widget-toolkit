<template>
    <div>
        <div class="chart-title">{{ chartTitle }}</div>
        <uwt-chart
            v-for="(wrapper, index) in chartDefWrappers"
            :ref="'chart'"
            :key="index"
            :id="wrapper.title"
            :render-options="wrapper.options"
            :color-manager="colorManager"
            :on-render="onRender"
        ></uwt-chart>
    </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit/js/ui-widget-toolkit-chart";
import UWTChart from "../chart";

export default {
    name: "uwtSwimlaneChart",
    components: {
        UWTChart: UWTChart
    },
    data() {
        return {
            chartDefWrappers: []
        };
    },
    props: {
        chartTitle: {
            type: String,
            default: ""
        },
        chartDefs: {
            type: Array,
            default: () => {
                return [];
            }
        },
        renderOptions: {
            type: Object,
            default: () => {
                return {
                    topMargin: 4,
                    bottomMargin: 4,
                    disableAutoResizeWidth: true,
                    height: 34
                };
            }
        },
        colorManager: {
            type: Object,
            default: () => {
                return new UWT.ColorManager();
            }
        },
        onRender: {
            type: Function,
            default: undefined
        },
        renderer: {
            type: Object,
            default: undefined
        }
    },
    mounted: function() {
        this._createWrapper(this.chartDefs);
    },
    methods: {
        resize: function() {
            for (let i = 0; i < this.charts.length; ++i) {
                let chart = this.charts[i];

                let options = { width: undefined };
                chart.renderer.render(chart, options);
            }
        },
        _createWrapper: function(chartDefs) {
            if (chartDefs && chartDefs.length > 0) {
                let self = this;
                this.charts = chartDefs;

                let wrappers = [];
                for (let i = 0; i < this.charts.length; ++i) {
                    wrappers.push({
                        title: this.charts[i].title,
                        options: UWT.copy(this.renderOptions)
                    });
                }
                this.chartDefWrappers = wrappers;

                this.$nextTick(function() {
                    for (let i = 0; i < self.charts.length; ++i) {
                        self.$refs["chart"][i].setData(self.charts[i]);
                    }
                });
            }
        },

        /** use this instead of chartDef for large data due to how Vue handles reactivity */
        setData(chartDefs) {
            this._createWrapper(chartDefs);
        }
    },
    watch: {
        chartDefs: function() {
            this._createWrapper(this.chartDefs);
        },
        renderOptions: function() {
            this.createWrapper(this.charts);
        },
        colorManager: function() {
            if (this.renderer) {
                this.renderer.setColorManager(this.colorManager);
            }
        }
    }
};
</script>

<style scoped>
.axis path,
.axis line {
    fill: none;
    stroke: grey;
    stroke-width: 1;
    shape-rendering: crispEdges;
}
.axis text {
    font-size: larger;
}
.axis .lane-axis-label {
    font-size: 0.8em;
}
.lane-title {
    font-size: larger;
    font-style: italic;
}
.chart-title {
    padding-top: 1px;
}
.chart-background {
    stroke: white;
    fill: white;
}
.brush .extent {
    stroke: #fff;
    shape-rendering: crispEdges;
    fill-opacity: 0.125;
}
.zoom-region {
    fill: black;
    stroke: #fff;
    shape-rendering: crispEdges;
    fill-opacity: 0.125;
}
.legendCells .cell .label {
    font-size: 12px;
    font-family: Arial;
}
.chart-flame.labels {
    font-size: 12px;
    font-family: Arial;
    font-weight: bold;
    background-color: transparent;
    color: black;
}
.no-pointer-events {
    pointer-events: none;
}
</style>