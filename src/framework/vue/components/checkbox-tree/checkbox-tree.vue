<template>
    <div>
        <uwt-checkbox-tree-node
            id="root"
            :def="data"
            :open="data.open"
            :checked="data.checked"
            :children="data.children"
            @check-changed="$emit('check-changed')"
            @check-completed="$emit('check-completed')"
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
        }
    },
    methods: {}
};
</script>
