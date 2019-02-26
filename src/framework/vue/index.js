export * from '../../build/export.chart';
export * from '../../build/export.graph';
export * from '../../build/export.grid';

export * from '../../core/context-menu';
export * from '../../core/utilities';

import { ICheckboxTreeNode } from '../../interface/ui-base';
import UWTChart from './components/chart'
import UWTCheckboxTreeNode from './components/checkbox-tree-node'
import UWTCheckboxTree from './components/checkbox-tree'
import UWTFlowDiagram from './components/flow-diagram'
import UWTGraph from './components/graph'
import UWTGrid from './components/grid'
import UWTHierarchyGraph from './components/hierarchy-graph'
import UWTPieChart from './components/pie-chart'
import UWTSunburstChart from './components/sunburst-chart'
import UWTSwimlaneChart from './components/swimlane-chart'
import UWTTreeMap from './components/tree-map'

export {
  ICheckboxTreeNode,
  UWTChart,
  UWTCheckboxTreeNode,
  UWTCheckboxTree,
  UWTFlowDiagram,
  UWTGraph,
  UWTGrid,
  UWTHierarchyGraph,
  UWTPieChart,
  UWTSunburstChart,
  UWTSwimlaneChart,
  UWTTreeMap
}

const UWTVue = Vue => {
  Vue.component(UWTChart.name, UWTChart)
  Vue.component(UWTCheckboxTree.name, UWTCheckboxTree)
  Vue.component(UWTFlowDiagram.name, UWTFlowDiagram)
  Vue.component(UWTGraph.name, UWTGraph)
  Vue.component(UWTGrid.name, UWTGrid)
  Vue.component(UWTHierarchyGraph.name, UWTHierarchyGraph)
  Vue.component(UWTPieChart.name, UWTPieChart)
  Vue.component(UWTSunburstChart.name, UWTSunburstChart)
  Vue.component(UWTSwimlaneChart.name, UWTSwimlaneChart)
  Vue.component(UWTTreeMap.name, UWTTreeMap)
}

UWTVue.version = '__VERSION__'

export default {
  UWTVue
};