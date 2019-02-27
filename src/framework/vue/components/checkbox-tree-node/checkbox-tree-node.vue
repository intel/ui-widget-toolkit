<template>
  <div class="node-container">
    <div class="node-row" :title="def.name">
      <span
        v-if="def.children && def.children.length"
        :class="_computeClass()"
        @click="toggleChildren()"
      ></span>
      <md-checkbox
        v-if="!def.notCheckable"
        v-model="checked"
        :style="_computePadding()"
        :indeterminate="indeterminate"
        @change="_onCheckChanged"
      >{{def.name}}</md-checkbox>
      <div v-else :style="_computePadding()">{{def.name}}</div>
    </div>
    <ul v-if="open">
      <li v-for="(child, index) in children" :key="index">
        <uwt-checkbox-tree-node
          :ref="child.name"
          :id="child.name"
          :def="child"
          :open="child.open"
          :checked="child.checked"
          :children="child.children"
          :on-check-changed="_emitCheckChanged"
          :on-check-completed="_emitCheckCompleted"
          class="checkbox-tree-node"
        ></uwt-checkbox-tree-node>
      </li>
    </ul>
  </div>
</template>

<script lang=ts>
import Vue from "vue";
import { MdCheckbox } from "vue-material/dist/components";
import { ICheckboxTreeNode } from "../../../../interface/ui-base";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";

Vue.use(MdCheckbox);

export default {
  name: "uwtCheckboxTreeNode",
  data() {
    return {
      indeterminate: false,
      open: false,
      checked: false
    };
  },
  props: {
    def: {
      type: Object,
      default: () => {
        return {};
      }
    },
    children: {
      type: Array,
      default: (): any[] => {
        return [];
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
  mounted: function() {
    Vue.set(this, "open", this.def.open);
    this._initializeChildren(this, this.def);
  },
  methods: {
    _initializeChildren(vm: any, node: ICheckboxTreeNode) {
      if (vm) {
        vm.checked = node.checked;
      }
      if (node && node.open) {
        for (let i = 0; i < node.children.length; ++i) {
          node.children[i].parent = node;
          if (node.children[i].open) {
            let childData = node.children[i];
            let childView;
            if (vm && vm.$refs[childData.name]) {
              childView = vm.$refs[childData.name][0];
            }
            this._initializeChildren(childView, childData);
          }
        }
      }
    },
    _emitCheckChanged() {
      if (this.onCheckChanged) {
        this.onCheckChanged(this.def);
      }
    },
    _emitCheckCompleted() {
      if (this.onCheckCompleted) {
        this.onCheckCompleted(this.def);
      }
    },
    _onCheckChanged() {
      if (this.indeterminate) {
        this.def.checked = true;
        this.def.indeterminate = false;
        Vue.set(this, "indeterminate", false);
      } else {
        this.def.checked = !this.def.checked;
      }

      Vue.set(this, "checked", this.def.checked);
      this._emitCheckChanged(this.def);
      this._updateChildCheckBox(this, this.def, this.def.checked);
      this._updateParentCheckBox(this.$parent, this.def.parent);
      this._emitCheckCompleted();
    },
    _updateChildCheckBox(vm: any, nodeData: any, checked: boolean) {
      if (nodeData.checked !== checked) {
        nodeData.checked = checked;
        if (vm) {
          Vue.set(vm, "checked", checked);
        }
        this._emitCheckChanged(nodeData);
      }

      if (nodeData.children) {
        // check things from bottom to top so when I scroll to last
        // checked thing it goes to the top element not the bottom
        for (let j = nodeData.children.length - 1; j >= 0; --j) {
          let childData = nodeData.children[j];
          let childView;
          if (vm && vm.$refs[childData.name]) {
            childView = vm.$refs[childData.name][0];
          }
          this._updateChildCheckBox(childView, childData, checked);
        }
      }
    },
    _updateParentCheckBox(parentComponent: any, parentData: any) {
      if (parentData && parentData.children) {
        let allChildChecked = true;
        let noChildChecked = true;

        for (let child of parentData.children) {
          if (child.indeterminate) {
            allChildChecked = false;
            noChildChecked = false;
            break;
          } else if (!child.checked) {
            allChildChecked = false;
          } else if (child.checked) {
            noChildChecked = false;
          }
        }

        if (allChildChecked) {
          parentData.checked = true;
          parentData.indeterminate = false;
          Vue.set(parentComponent, "indeterminate", false);
        } else if (noChildChecked) {
          parentData.checked = false;
          parentData.indeterminate = false;
          Vue.set(parentComponent, "indeterminate", false);
        } else {
          parentData.checked = true;
          parentData.indeterminate = true;
          Vue.set(parentComponent, "indeterminate", true);
        }
        Vue.set(parentComponent, "checked", parentData.checked);
        this._updateParentCheckBox(parentComponent.$parent, parentData.parent);
      }
    },

    /**
     * Returns the necessary classes.
     *
     * @return {string} The class name indicating whether the node is open or closed
     */
    _computeClass() {
      var open = this.def.open;
      var children = this.getChildren();
      return (
        "node-preicon " +
        (open && children && children.length
          ? "expanded"
          : children && children.length
          ? "collapsed"
          : "")
      );
    },
    _computePadding(): any {
      var children = this.getChildren();
      return children && children.length ? {} : { "padding-left": "18px" };
    },
    /**
     * Returns the parent tree node. Returns `null` if root.
     */
    getParent() {
      return this.def.parent;
    },
    /**
     * Returns the children tree nodes.
     */
    getChildren() {
      return this.def.children;
    },
    /**
     * Display/Hide the children nodes.
     */
    toggleChildren() {
      this.def.open =
        !this.def.open && this.def.children && this.def.children.length > 0;
      Vue.set(this, "open", this.def.open);
      this._initializeChildren(this, this.def);
    }
  },
  watch: {
    def: function() {
      this._initializeChildren(this, this.def);
    }
  }
};
</script>

<style>
.node-row {
  padding-left: 4px;
  padding-right: 4px;
  white-space: nowrap;
}

.node-preicon.collapsed,
.node-preicon.expanded {
  padding-left: 0px;
}

.node-preicon:before {
  margin-right: 10px;
  vertical-align: text-bottom;
}

.node-preicon.collapsed:before {
  content: "\002B";
}

.node-preicon.expanded:before {
  content: "\002D";
}

.node-preicon,
.node-name {
  cursor: pointer;
}

ul {
  margin: 0;
  padding-left: 20px;
}

li {
  list-style-type: none;
}
</style>