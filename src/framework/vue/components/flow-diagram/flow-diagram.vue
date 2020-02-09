<template>
    <div style="height: 100%">
        <div class="diagram-title">{{diagramTitle}}</div>
        <div ref="diagram" id="diagram"></div>
    </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit/js/ui-widget-toolkit-graph";

export default {
    name: "uwtFlowDiagram",
    props: {
        diagramTitle: {
            type: String,
            default: ""
        },
        diagramDef: {
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
        }
        this.renderer.setOnRenderCallback(this.onRender);

        if (this.diagramDef) {
            this.renderer.setDiv(this.$refs["diagram"]);
            this.renderer.invalidate(this.diagramDef, this.renderOptions);
        }
    },
    watch: {
        diagramDef: function(newValue, oldValue) {
            while (this.$refs["diagram"].firstChild) {
                this.$refs["diagram"].removeChild(
                    this.$refs["diagram"].firstChild
                );
            }
            if (this.renderer && this.diagramDef) {
                if (oldValue) {
                    this.renderer.destroy(oldValue);
                }
                this.renderer.setDiv(this.$refs["diagram"]);
                this.renderer.invalidate(this.diagramDef, this.renderOptions);
            }
        },
        renderOptions: function() {
            if (this.renderer && this.diagramDef) {
                this.renderer.setDiv(this.$refs["diagram"]);
                this.renderer.invalidate(this.diagramDef, this.renderOptions);
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
div#diagram {
    height: 100%;
}

.node rect {
    cursor: move;
    fill-opacity: 0.9;
    shape-rendering: crispEdges;
}

.node text {
    pointer-events: none;
    text-shadow: 0 1px 0 #fff;
}

.link {
    fill: none;
    stroke: #888;
    stroke-opacity: 0.4;
}
</style>