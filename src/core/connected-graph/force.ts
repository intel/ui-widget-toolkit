import {
    IOptions, UIType, UIElement
} from '../../interface/ui-base';
import {
    IConnectedGraph
} from '../../interface/graph';
import {
    D3SimpleGraph
} from './simple';
import { D3Renderer } from '../renderer';

import * as d3 from 'd3';
import { ConnectedGraphBase } from './base';

export class D3ForceGraph extends D3SimpleGraph {
    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {

        super(element, renderer, parent);

        ConnectedGraphBase.prototype.initializeGraph.call(this, element as IConnectedGraph);
    }

    public render(options: IOptions) {
        let self = this;
        let graph = self._element as IConnectedGraph;

        this.getHeightWidth(this._options);
        let height = this._options.height;
        let width = this._options.width;

        var simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (d: any) { return d.node; }))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2));

        simulation
            .nodes(graph.nodes as any)
            .on('tick', ticked);

        let force = simulation.force('link');
        (<any>force).links(graph.links);

        function ticked() {
            links
                .attr('x1', function (d: any) { return d.source.x; })
                .attr('y1', function (d: any) { return d.source.y; })
                .attr('x2', function (d: any) { return d.target.x; })
                .attr('y2', function (d: any) { return d.target.y; });

            nodes
                .attr('cx', function (d: any) { return d.x; })
                .attr('cy', function (d: any) { return d.y; });
        }

        function dragstarted(d: any) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d: any) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d: any) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        let graphArea = self.initializeGraphArea(options);
        let links = this.renderLinks(graphArea);
        let nodes = this.renderNodes(graphArea, dragstarted, dragged, dragended);

        self.configureView();
    }
}
D3Renderer.register(UIType.ForceDirectedGraph, D3ForceGraph);