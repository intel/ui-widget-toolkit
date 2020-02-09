<template>
  <div>
    <uwt-checkbox-tree-node
      id="root"
      :def="data"
      :open="data.open"
      :checked="data.checked"
      :children="data.children"
      :onCheckChanged="_onCheckChanged"
      :onCheckCompleted="_onCheckCompleted"
      class="checkbox-tree-node"
    ></uwt-checkbox-tree-node>
  </div>
</template>

<script>
import Vue from "vue";
import UWTCheckboxTreeNode from "../checkbox-tree-node/checkbox-tree-node.vue";

export default {
  name: "uwtCheckboxTree",
  components: {
    UWTCheckboxTreeNode
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    onCheckChanged: {
      type: Function,
      default: undefined
    },
    onCheckCompleted: {
      type: Function,
      default: undefined
    }
  },
  methods: {
    _onCheckChanged() {
      if (this.onCheckChanged) {
        this.onCheckChanged();
      }
    },
    _onCheckCompleted() {
      if (this.onCheckCompleted) {
        this.onCheckCompleted();
      }
    }
  }
};
</script>
