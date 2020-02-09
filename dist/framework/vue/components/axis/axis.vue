<template>
    <div>
        <div ref="axis"></div>
    </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit/js/ui-widget-toolkit-chart";

export default {
    name: "uwtAxis",
    props: {
        axisDef: {
            type: Object,
            default: undefined
        },
        renderOptions: {
            type: Object,
            default: () => {
                return {};
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
            this.renderer.setDiv(this.$refs["axis"]);
            this.renderer.setOnRenderCallback(this.onRender);
        }
        if (this.renderer && this.axisDef) {
            this.renderer.invalidate(this.axisDef, this.renderOptions);
        }
    },
    watch: {
        axisDef: function(newValue, oldValue) {
            while (this.$refs["axis"].firstChild) {
                this.$refs["axis"].removeChild(this.$refs["axis"].firstChild);
            }
            if (this.renderer && this.axisDef) {
                if (oldValue) {
                    this.renderer.destroy(oldValue);
                }
                this.renderer.invalidate(this.axisDef, this.renderOptions);
            }
        },
        renderOptions: function() {
            if (this.renderer && this.axisDef) {
                while (this.$refs["axis"].firstChild) {
                    this.$refs["axis"].removeChild(
                        this.$refs["axis"].firstChild
                    );
                }
                this.renderer.invalidate(this.axisDef, this.renderOptions);
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
.no-pointer-events {
    pointer-events: none;
}
</style>