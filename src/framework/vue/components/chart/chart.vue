<template>
  <div>
    <div class="chart-title">{{ chartTitle }}</div>
    <div ref="chart"></div>
  </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit";

export default {
  name: "uwtChart",
  props: {
    chartTitle: {
      type: String,
      default: ""
    },
    chartDef: {
      type: Object,
      default: undefined
    },
    renderOptions: {
      type: Object,
      default: () => {
        return {};
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
    }
  },
  mounted: function() {
    if (!this.renderer) {
      this.renderer = new UWT.D3Renderer("", this.colorManager);
      this.renderer.setDiv(this.$refs["chart"]);
      this.renderer.setOnRenderCallback(this.onRender);
    }
    if (this.renderer && this.chartDef) {
      UWT.Chart.finalize(this.chartDef);
      this.renderer.invalidate(this.chartDef, this.renderOptions);
    }
  },
  watch: {
    chartDef: function(newValue, oldValue) {
      while (this.$refs["chart"].firstChild) {
        this.$refs["chart"].removeChild(this.$refs["chart"].firstChild);
      }
      if (this.renderer && this.chartDef) {
        if (oldValue) {
          this.renderer.destroy(oldValue);
        }
        UWT.Chart.finalize(this.chartDef);
        this.renderer.invalidate(this.chartDef, this.renderOptions);
      }
    },
    renderOptions: function() {
      if (this.renderer && this.chartDef) {
        while (this.$refs["chart"].firstChild) {
          this.$refs["chart"].removeChild(this.$refs["chart"].firstChild);
        }
        UWT.Chart.finalize(this.chartDef);
        this.renderer.invalidate(this.chartDef, this.renderOptions);
      }
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