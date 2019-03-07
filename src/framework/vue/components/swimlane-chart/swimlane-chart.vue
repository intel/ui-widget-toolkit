<template>
  <div>
    <div class="chart-title">{{ chartTitle }}</div>
    <uwt-chart
      v-for="(wrapper, index) in chartDefWrappers"
      :key="index"
      :id="wrapper.chartDef.title"
      :chart-def="wrapper.chartDef"
      :render-options="wrapper.options"
      :color-manager="colorManager"
      :on-render="onRender"
    ></uwt-chart>
  </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit";
import UWTChart from "../chart";

export default {
  name: "uwtSwimlaneChart",
  components: {
    UWTChart: UWTChart
  },
  data: function() {
    return {
      chartDefWrappers: new Array(0)
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
    UWT.ChartGroup.handleRenderOptionsUpdate(
      this,
      this.renderOptions,
      this.chartOptions
    );
    this._dataChanged();
  },
  methods: {
    resize: function() {
      for (let i = 0; i < this.chartDefWrappers.length; ++i) {
        let chart = this.chartDefWrappers[i];

        let options = { width: undefined };
        if (chart.zoomEvent) {
          options.xStart = chart.zoomEvent.xStart;
          options.xEnd = chart.zoomEvent.xEnd;
        }
        chart.chartDef.renderer.render(chart.chartDef, options);
      }
    },
    _createWrapper: function() {
      if (this.chartDefs) {
        let wrappers = [];
        for (let i = 0; i < this.chartDefs.length; ++i) {
          wrappers.push({
            chartDef: this.chartDefs[i],
            options: this.chartOptions[i]
          });
        }
        this.chartDefWrappers = wrappers;
      }
    },
    _dataChanged: function() {
      let chartMap = new Map();
      if (this.chartDefs) {
        for (let i = 0; i < this.chartDefs.length; ++i) {
          chartMap.set(this.chartDefs[i], true);
        }
      }
      let legends = [];
      let oldList = this.chartDefWrappers;
      if (oldList) {
        for (let i = 0; i < oldList.length; ++i) {
          let oldChart = oldList[i];
          if (!chartMap.has(oldChart.chartDef)) {
            UWT.ChartGroup.handleRemoveChart(oldChart.chartDef);
          }
          if (oldChart.chartDef.legends) {
            legends = legends.concat(oldChart.chartDef.legends);
          }
        }
      } else {
        for (let i = 0; i < this.chartDefs.length; ++i) {
          if (this.chartDefs[i].legends) {
            legends = legends.concat(this.chartDefs[i].legends);
          }
        }
      }

      this.chartOptions = [];
      this.sharedOptions = this.renderOptions; // requires for API to work
      UWT.ChartGroup.handleChartUpdate(
        this.chartDefs,
        this.chartOptions,
        this,
        legends
      );

      this._createWrapper();
    }
  },
  watch: {
    chartDefs: function() {
      if (this.chartDefs) {
        this._dataChanged();
      }
    },
    renderOptions: function() {
      if (this.chartDefs) {
        this.chartOptions = new Array(this.chartDefs.length);
      }
      UWT.ChartGroup.handleRenderOptionsUpdate(
        this,
        this.renderOptions,
        this.chartOptions
      );
      this.createWrapper();
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