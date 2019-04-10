import UWTAxis from './components/axis'
import UWTChart from './components/chart'
import UWTCheckboxTreeNode from './components/checkbox-tree-node'
import UWTCheckboxTree from './components/checkbox-tree'
import UWTFlowDiagram from './components/flow-diagram'
import UWTGraph from './components/graph'
import UWTGrid from './components/grid'
import UWTHierarchyGraph from './components/hierarchy-graph'
import UWTPieChart from './components/pie-chart'
import UWTRadarChart from './components/radar-chart';
import UWTSunburstChart from './components/sunburst-chart'
import UWTSwimlaneChart from './components/swimlane-chart'
import UWTTreeMap from './components/tree-map'

export {
  UWTAxis,
  UWTChart,
  UWTCheckboxTreeNode,
  UWTCheckboxTree,
  UWTFlowDiagram,
  UWTGraph,
  UWTGrid,
  UWTHierarchyGraph,
  UWTPieChart,
  UWTRadarChart,
  UWTSunburstChart,
  UWTSwimlaneChart,
  UWTTreeMap
}

const UWTVue = {
  install: Vue => {
    Vue.component(UWTAxis.name, UWTAxis)
    Vue.component(UWTChart.name, UWTChart)
    Vue.component(UWTCheckboxTree.name, UWTCheckboxTree)
    Vue.component(UWTCheckboxTreeNode.name, UWTCheckboxTreeNode)
    Vue.component(UWTFlowDiagram.name, UWTFlowDiagram)
    Vue.component(UWTGraph.name, UWTGraph)
    Vue.component(UWTGrid.name, UWTGrid)
    Vue.component(UWTHierarchyGraph.name, UWTHierarchyGraph)
    Vue.component(UWTPieChart.name, UWTPieChart)
    Vue.component(UWTRadarChart.name, UWTRadarChart)
    Vue.component(UWTSunburstChart.name, UWTSunburstChart)
    Vue.component(UWTSwimlaneChart.name, UWTSwimlaneChart)
    Vue.component(UWTTreeMap.name, UWTTreeMap)
  }
}

UWTVue.version = '__VERSION__'

export default UWTVue