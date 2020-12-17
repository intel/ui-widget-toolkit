import { IOptions, UIType, UIElement } from '../../interface/ui-base';
import { IConnectedGraph } from '../../interface/graph';
import { addClickHelper } from '../svg-helper';
import { D3Renderer } from '../renderer';

import * as d3 from 'd3';

import { ConnectedGraphBase, D3ConnectedGraphSVG } from './base';

export class D3SimpleGraph extends D3ConnectedGraphSVG {
    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>,
        documentRoot: DocumentFragment = document
    ) {

        super(element, renderer, parent, documentRoot);

        ConnectedGraphBase.prototype.initializeGraph.call(this, element as IConnectedGraph);

        // here we convert link.source/link.target to their actual nodes to match as
        // this is what the base graph helpers expect
        let graph = this._element as IConnectedGraph;
        graph.links.forEach(function (link: any) {
            if (typeof link.source === 'number') {
                link.source = graph.nodes[link.source];
            }
            if (typeof link.target === 'number') {
                link.target = graph.nodes[link.target];
            }
        });
    }

    protected renderLinks(graphArea: d3.Selection<any, any, d3.BaseType, any>):
        d3.Selection<any, any, d3.BaseType, any> {
        let self = this;
        let graph = self._element as IConnectedGraph;
        let links = graphArea.append('g')
            .classed('links', true)
            .selectAll('line')
            .data(graph.links)
            .enter().append('line')
            .attr('x1', function (d: any) { return d.source.x; })
            .attr('y1', function (d: any) { return d.source.y; })
            .attr('x2', function (d: any) { return d.target.x; })
            .attr('y2', function (d: any) { return d.target.y; })
            .attr('stroke-width', 1)
            .attr('class', function (d: any) {
                return d.source.key + '-' + d.target.key +
                    ' ' + d.source.key +
                    ' ' + d.target.key;
            })
            .classed('link', true)
            .on('mouseenter', self.linkHoverStart)
            .on('mouseleave', self.hoverEnd)
            .each(function (d: any) {
                addClickHelper(d3.select(this), self.getOptions(), graph.onClick,
                    graph.onDoubleClick, graph.contextMenuItems,
                    self._dataTooltip, graph, d.key, d.key);
            })

        self._dataTooltip.setTarget(links);

        return links;
    }

    protected renderNodes(graphArea: d3.Selection<any, any, d3.BaseType, any>,
        dragStart: (node: any) => void,
        dragMove: (node: any) => void,
        dragEnd: (node: any) => void): d3.Selection<any, any, d3.BaseType, any> {
        let self = this;
        let graph = self._element as IConnectedGraph;

        let colorMgr = self._renderer.getColorManager();
        let nodes = graphArea.append('g')
            .classed('nodes', true)
            .selectAll('circle')
            .data(graph.nodes)
            .enter().append('circle')
            .attr('r', 5)
            .attr('cx', function (d: any) { return d.x; })
            .attr('cy', function (d: any) { return d.y; })
            .attr('fill', function (d: any) {
                if (d.type) {
                    return colorMgr.getColor(d.type);
                }

                return colorMgr.getColor(d.key);
            })
            .attr('class', function (d: any) {
                if (d.type) {
                    return d.type + ' ' + d.key;
                }
                return d.key
            })
            .each(function (d: any) {
                addClickHelper(d3.select(this), self.getOptions(), graph.onClick,
                    graph.onDoubleClick, graph.contextMenuItems,
                    self._dataTooltip, graph, d.key, d.key);
            })
            .classed('node', true)
            .on('mouseenter', self.nodeHoverStart)
            .on('mouseleave', self.hoverEnd)
            .call((<any>d3).drag()
                .on('start', dragStart)
                .on('drag', dragMove)
                .on('end', dragEnd));

        self._dataTooltip.setTarget(nodes);

        return nodes;
    }

    public render(options: IOptions) {
        let self = this;

        this.getHeightWidth(options);

        // the function for moving the nodes
        function dragMove(node: any) {
            d3.select(this)
                .attr('cx', d3.event.x)
                .attr('cy', d3.event.y);
            node.x = d3.event.x;
            node.y = d3.event.y;

            graphArea.selectAll('.' + node.key + '.link')
                .each(function (link: any) {
                    // Transform to d3 Object
                    if (node.key === link.source.key) {
                        d3.select(this).attr('x1', function (d: any) { return d.source.x; })
                            .attr('y1', function (d: any) { return d.source.y; });
                    } else {
                        d3.select(this)
                            .attr('x2', function (d: any) { return d.target.x; })
                            .attr('y2', function (d: any) { return d.target.y; })
                    }
                });
        }

        let graphArea = self.initializeGraphArea(options);
        this.renderLinks(graphArea);
        this.renderNodes(graphArea, undefined, dragMove, undefined);

        self.configureView();
    }
}
D3Renderer.register(UIType.SimpleGraph, D3SimpleGraph);