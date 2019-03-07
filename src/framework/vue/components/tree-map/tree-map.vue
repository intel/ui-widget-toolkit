<template>
  <div>
    <div class="tree-title">{{treeTitle}}</div>
    <div ref="tree"></div>
  </div>
</template>

<script>
import * as UWT from "ui-widget-toolkit";

export default {
  name: "uwtTreeMap",
  props: {
    treeTitle: {
      type: String,
      default: ""
    },
    treeDef: {
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

    if (this.treeDef) {
      this.renderer.setDiv(this.$refs["tree"]);
      this.renderer.invalidate(this.treeDef, this.renderOptions);
    }
  },
  watch: {
    treeDef: function() {
      while (this.$refs["tree"].firstChild) {
        this.$refs["tree"].removeChild(this.$refs["tree"].firstChild);
      }

      if (this.renderer && this.treeDef) {
        this.renderer.setDiv(this.$refs["tree"]);
        this.renderer.invalidate(this.treeDef, this.renderOptions);
      }
    },
    renderOptions: function() {
      if (this.renderer && this.treeDef) {
        this.renderer.setDiv(this.$refs["tree"]);
        this.renderer.invalidate(this.treeDef, this.renderOptions);
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
