<template>
  <div>
    <div class="grid-title">{{ gridTitle }}</div>
    <div id="grid" ref="grid"></div>
  </div>
</template>

<script lang=ts>
import { ColorManager } from "../../../../core/color-manager";
import { AgGridRenderer } from "../../../../core/ag-grid/ag-grid-renderer";
import { IGrid } from "../../../../interface/grid";

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
        return new ColorManager();
      }
    },
    onRender: {
      type: Function,
      default: undefined
    }
  },
  mounted: function() {
    if (!this.renderer) {
      this.renderer = new AgGridRenderer(
        undefined,
        undefined,
        this.colorManager
      );
    }
    this.renderer.setOnRenderCallback(this.onRender);

    if (this.gridDef) {
      if (this.gridDef.gridOptions && this.gridDef.gridOptions.gridClass) {
        this.$refs["grid"].classList.add(this.gridDef.gridOptions.gridClass);
      } else {
        this.$refs["grid"].classList.add("ag-theme-fresh");
      }
      this.renderer.setDiv(this.gridDef, this.$refs["grid"]);
      this.renderer.invalidate(this.gridDef);
    }
  },
  watch: {
    gridDef: function(newVal: IGrid, oldVal: IGrid) {
      if (oldVal && oldVal.gridOptions && oldVal.gridOptions.gridClass) {
        this.$refs["grid"].classList.remove(oldVal.gridOptions.gridClass);
      }
      if (newVal) {
        if (newVal.gridOptions && newVal.gridOptions.gridClass) {
          this.$refs["grid"].classList.add(newVal.gridOptions.gridClass);
        } else {
          this.$refs["grid"].classList.add("ag-theme-fresh");
        }
      }

      this.gridDef = newVal;
      if (this.renderer && this.gridDef) {
        this.renderer.setDiv(this.gridDef, this.$refs["grid"]);
        this.renderer.invalidate(this.gridDef);
      }
    },
    gridStyle: function(newVal: any, oldVal: any) {
      for (let key in newVal) {
        this.$refs["grid"].style[key] = newVal[key];
      }
    },
    colorManager: function(newVal: ColorManager, oldVal: ColorManager) {
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