<template>
    <div style="height: 100%">
        <div class="grid-title">{{ gridTitle }}</div>
        <div id="grid" ref="grid"></div>
    </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit/js/ui-widget-toolkit-grid";

export default {
    name: "uwtGrid",
    props: {
        gridTitle: {
            type: String,
            default: ""
        },
        gridDef: {
            type: Object,
            default: undefined
        },
        gridStyle: {
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
            this.renderer = new UWT.AgGridRenderer(
                undefined,
                undefined,
                this.colorManager
            );
        }
        this.renderer.setOnRenderCallback(this.onRender);

        if (this.gridStyle) {
            for (let key in this.gridStyle) {
                this.$refs["grid"].style[key] = this.gridStyle[key];
            }
        }

        if (this.gridDef) {
            if (
                this.gridDef.gridOptions &&
                this.gridDef.gridOptions.gridClass
            ) {
                this.$refs["grid"].classList.add(
                    this.gridDef.gridOptions.gridClass
                );
            } else {
                this.$refs["grid"].classList.add("ag-theme-balham");
            }
            this.renderer.setDiv(this.gridDef, this.$refs["grid"]);
            this.renderer.invalidate(this.gridDef);
        }
    },
    watch: {
        gridDef: function(newVal, oldVal) {
            if (oldVal && oldVal.gridOptions && oldVal.gridOptions.gridClass) {
                this.$refs["grid"].classList.remove(
                    oldVal.gridOptions.gridClass
                );
            }
            if (newVal) {
                if (newVal.gridOptions && newVal.gridOptions.gridClass) {
                    this.$refs["grid"].classList.add(
                        newVal.gridOptions.gridClass
                    );
                } else {
                    this.$refs["grid"].classList.add("ag-theme-balham");
                }
            }

            this.gridDef = newVal;
            if (this.renderer && this.gridDef) {
                this.renderer.setDiv(this.gridDef, this.$refs["grid"]);
                this.renderer.invalidate(this.gridDef);
            }
        },
        gridStyle: function(newVal, oldVal) {
            for (let key in newVal) {
                this.$refs["grid"].style[key] = newVal[key];
            }
        },
        colorManager: function(newVal, oldValue) {
            if (this.renderer) {
                this.renderer.setColorManager(this.colorManager);
            }
        }
    }
};
</script>

<style scoped>
div#grid {
    height: var(--uwt-grid-height, 200px);
}
</style>