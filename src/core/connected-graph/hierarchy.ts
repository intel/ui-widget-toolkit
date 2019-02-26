import {
    IOptions, Alignment, Rect, UIElement, UIType
} from '../../interface/ui-base';
import {
    IHierarchyGraphLink, IHierarchyNode, IHierarchyGraph,
    IGraphNodeDecimator
} from '../../interface/graph';

import { getSelectionName } from '../utilities';
import {
    addClickHelper, convertToSVGCoords, getStyle
} from '../svg-helper';
import {
    getCoordsAndCache, IRenderedDiagramNode, IRenderedDiagramLink,
    D3ConnectedGraphSVG
} from './base';
import { D3Renderer } from '../renderer';

import * as d3 from 'd3';

interface IRenderedHierarchyNode extends IRenderedDiagramNode {
    /** render parent of this node */
    parent?: IRenderedHierarchyNode;
    /** the links for each node */
    ports?: {
        top?: any;
        bottom?: any;
        left?: any;
        right?: any;
    }
}

export class D3HierarchyGraph extends D3ConnectedGraphSVG {
    protected _margin: number;
    protected _padding: number;

    /** cache the decimator used for this graph */
    protected _decimator: IGraphNodeDecimator;

    /** this is where the elements are going to appear from relative from in the SVG */
    protected _renderOrigin: { x: number, y: number };

    protected _nodes: any;

    constructor(element: UIElement, renderer: D3Renderer,
        parent: d3.Selection<any, any, d3.BaseType, any>) {

        super(element, renderer, parent);

        // undo auto width from initialize call
        this._options.width = undefined;
        this._nodes = {};

        this._graphRect = this._svgRect;

        let self = this;

        this.getLinkStartXY = function (link: IRenderedDiagramLink) {
            let from = this._nodes[link.source.node.def.key];
            let fromRect = getCoordsAndCache(self._svg, from);
            let fromXY = { x: undefined, y: undefined };

            let linkOffset = 0;
            // get the exit point of the from node
            switch (link.source.alignment) {
                case Alignment.Bottom:
                    linkOffset = link.source.endPoint *
                        ((fromRect.right - fromRect.x) / (from.ports.bottom.length + 1));
                    fromXY.x = fromRect.x + linkOffset;
                    fromXY.y = fromRect.bottom;
                    break;
                case Alignment.Top:
                    linkOffset = link.source.endPoint *
                        ((fromRect.right - fromRect.x) / (from.ports.top.length + 1));
                    fromXY.x = fromRect.x + linkOffset;
                    fromXY.y = fromRect.y;
                    break;
                case Alignment.Left:
                    linkOffset = link.source.endPoint *
                        ((fromRect.bottom - fromRect.y) / (from.ports.left.length + 1));
                    fromXY.x = fromRect.x;
                    fromXY.y = fromRect.y + linkOffset;
                    break;
                case Alignment.Right:
                    linkOffset = link.source.endPoint *
                        ((fromRect.bottom - fromRect.y) / (from.ports.right.length + 1));
                    fromXY.x = fromRect.right;
                    fromXY.y = fromRect.y + linkOffset;
                    break;
            }
            return fromXY;
        }

        this.getLinkEndXY = function (link: IRenderedDiagramLink) {
            let to = this._nodes[link.target.node.def.key];
            let toRect = getCoordsAndCache(self._svg, to);
            let toXY = { x: undefined, y: undefined };

            let linkOffset = 0;

            // get the entry point of the to node and draw the elbow line
            switch (link.target.alignment) {
                case Alignment.Bottom:
                    linkOffset = link.target.endPoint *
                        ((toRect.right - toRect.x) / (to.ports.bottom.length + 1));
                    toXY.x = toRect.x + linkOffset;
                    toXY.y = toRect.bottom;
                    break;
                case Alignment.Top:
                    linkOffset = link.target.endPoint *
                        ((toRect.right - toRect.x) / (to.ports.top.length + 1));
                    toXY.x = toRect.x + linkOffset;
                    toXY.y = toRect.y;
                    break;
                case Alignment.Left:
                    linkOffset = link.target.endPoint *
                        ((toRect.bottom - toRect.y) / (to.ports.left.length + 1));
                    toXY.x = toRect.x;
                    toXY.y = toRect.y + linkOffset;
                    break;
                case Alignment.Right:
                    linkOffset = link.target.endPoint *
                        ((toRect.bottom - toRect.y) / (to.ports.right.length + 1));
                    toXY.x = toRect.right;
                    toXY.y = toRect.y + linkOffset;
                    break;
            }
            return toXY;
        }
    }

    static isNodeRendered(renderedNode: IRenderedDiagramNode) {
        return renderedNode.d3selection;
    }

    /**
     * get width or height not including any padding, but including internal margins
     * get a property of the rect associated with a node.  Used to get dimensions
     * for sizing purposes.
     *
     */
    private getRectPropertyMax(children: IHierarchyNode[], prop: string): number {
        let ret = 0;
        if (children) {
            for (let i = 0; i < children.length; ++i) {
                let child = this._nodes[children[i].key];
                if (D3HierarchyGraph.isNodeRendered(child)) {
                    ret = Math.max(child.rect[prop], ret);
                }
            }
        }
        return ret;
    }

    /**
     * get width or height not including any padding, but including internal margins
     * get a property of the rect associated with a node.  Used to get dimensions
     * for sizing purposes.
     *
     */
    private getStylePropertyMax(children: IHierarchyNode[], prop: string): number {
        let ret = 0;
        if (children) {
            for (let i = 0; i < children.length; ++i) {
                let child = this._nodes[children[i].key];
                if (D3HierarchyGraph.isNodeRendered(child)) {
                    let propValue = parseInt(getStyle(child.d3selection)[prop]);
                    ret = Math.max(propValue, ret);
                }
            }
        }
        return ret;
    }

    /**
     * get height not including any padding, but including internal margins
     * sum a property of the rect associated with a node.  Used to get dimensions
     * for sizing purposes
     */
    private sumVertical(children: IHierarchyNode[], defaultMargin: number): number {
        let ret = 0;
        if (children) {
            let marginTop = 0;
            let marginBottom = 0;
            let cssMargin: number;
            let hasChildren = false;
            for (let i = 0; i < children.length; ++i) {
                let child = this._nodes[children[i].key];
                if (D3HierarchyGraph.isNodeRendered(child)) {
                    if (hasChildren) {
                        // handle top margin
                        cssMargin = parseInt(getStyle(child.d3selection)['margin-top']);
                        marginTop = cssMargin ? cssMargin : defaultMargin;
                        if (marginTop > marginBottom) {
                            ret += marginTop - marginBottom;
                        }
                    }

                    let rect = convertToSVGCoords(this._svg, child.d3selection);
                    ret += Math.max(rect.height, child.rect.height);

                    // handle bottom margin
                    cssMargin = parseInt(getStyle(child.d3selection)['margin-bottom']);
                    marginBottom = cssMargin ? cssMargin : defaultMargin;
                    ret += marginBottom;
                    hasChildren = true;
                }
            }
            if (hasChildren) {
                ret -= marginBottom;
            }
        }
        return ret;
    }

    /**
     * move nodes that use a vertical alignment into the right position
     */
    private transformVerticalNodes(xMid: number, y: number,
        children: IHierarchyNode[], defaultMargin: number): boolean {
        let ret = false;
        if (children) {
            let marginTop = 0;
            let marginBottom = 0;
            let cssMargin: number;
            let hasChildren = false;
            for (let i = 0; i < children.length; ++i) {
                let child = this._nodes[children[i].key];
                if (D3HierarchyGraph.isNodeRendered(child)) {
                    ret = true;
                    let rect = convertToSVGCoords(this._svg, child.d3selection);
                    let x = xMid - Math.max(rect.width, child.rect.width) / 2;

                    if (hasChildren) {
                        // handle top margin
                        let cssMargin = parseInt(getStyle(child.d3selection)['margin-top']);
                        marginTop = cssMargin ? cssMargin : defaultMargin;
                        if (marginTop > marginBottom) {
                            y += marginTop - marginBottom;
                        }
                    }

                    child.d3selection
                        .transition()
                        .duration(this.getAnimateDuration())
                        .attr('transform',
                            'translate(' + x + ', ' + y + ')');
                    child.rect.x = x;
                    child.rect.y = y;

                    y += child.rect['height'];

                    cssMargin = parseInt(getStyle(child.d3selection)['margin-bottom']);
                    marginBottom = cssMargin ? cssMargin : defaultMargin;
                    y += marginBottom;
                    hasChildren = true;
                }
            }
        }
        return ret;
    }

    /**
     * get width not including any padding, but including internal margins
     * sum a property of the rect associated with a node.  Used to get dimensions
     * for sizing purposes
     */
    private sumHorizontal(children: IHierarchyNode[], defaultMargin: number): number {
        let ret = 0;
        if (children) {
            let marginLeft = 0;
            let marginRight = 0;
            let cssMargin: number;
            let hasChildren = false;
            for (let i = 0; i < children.length; ++i) {
                let child = this._nodes[children[i].key];
                if (D3HierarchyGraph.isNodeRendered(child)) {
                    if (hasChildren) {
                        // handle left margin
                        cssMargin = parseInt(getStyle(child.d3selection)['margin-left']);
                        marginLeft = cssMargin ? cssMargin : defaultMargin;
                        if (marginLeft > marginRight) {
                            ret += marginLeft - marginRight;
                        }
                    }

                    let rect = convertToSVGCoords(this._svg, child.d3selection);
                    ret += Math.max(rect.width, child.rect.width);

                    // handle right margin
                    cssMargin = parseInt(getStyle(child.d3selection)['margin-right']);
                    marginRight = cssMargin ? cssMargin : defaultMargin;
                    ret += marginRight;
                    hasChildren = true;
                }
            }
            if (hasChildren) {
                ret -= marginRight;
            }
        }
        return ret;
    }

    /**
     * move nodes that use a horizontal alignment into the right position
     */
    private transformHorizontalNodes(x: number, yMid: number,
        children: IHierarchyNode[], defaultMargin: number): boolean {
        let ret = false;
        if (children) {
            let marginLeft = 0;
            let marginRight = 0;
            let cssMargin: number;
            let hasChildren = false;
            for (let i = 0; i < children.length; ++i) {
                let child = this._nodes[children[i].key];
                if (D3HierarchyGraph.isNodeRendered(child)) {
                    ret = true;
                    let rect = convertToSVGCoords(this._svg, child.d3selection);
                    let y = yMid - Math.max(rect.height, child.rect.height) / 2;

                    if (hasChildren) {
                        // handle top margin
                        let cssMargin = parseInt(getStyle(child.d3selection)['margin-left']);
                        marginLeft = cssMargin ? cssMargin : defaultMargin;
                        if (marginLeft > marginRight) {
                            x += marginLeft - marginRight;
                        }
                    }

                    child.d3selection
                        .transition()
                        .duration(this.getAnimateDuration())
                        .attr('transform',
                            'translate(' + x + ', ' + y + ')');
                    child.rect.x = x;
                    child.rect.y = y;

                    x += child.rect['width'];

                    // handle bottom margin
                    cssMargin = parseInt(getStyle(child.d3selection)['margin-right']);
                    marginRight = cssMargin ? cssMargin : defaultMargin;
                    x += marginRight;
                    hasChildren = true;
                }
            }
        }
        return ret;
    }

    private calculateNodeWidth(node: IHierarchyNode, topRect: Rect, bottomRect: Rect,
        centerRect: Rect, leftRect: Rect, rightRect: Rect, nodeContentRect: Rect,
        defaultMargin: number, defaultPadding: number): number {
        let ret = 0;
        ret = Math.max(ret, topRect.width);
        ret = Math.max(ret, centerRect.width);
        ret = Math.max(ret, bottomRect.width);
        ret = Math.max(ret, nodeContentRect.width);

        let middleWidth = 0;
        // for each possible horizontal grouping calculate what the maximum width could be
        if (leftRect.width !== 0) {
            // start with the left side and compute the width from left to right
            middleWidth = leftRect.width;
            if (centerRect.width !== 0) {
                // add left to center margin
                middleWidth += Math.max(defaultMargin,
                    Math.max(this.getStylePropertyMax(node.left, 'margin-right'),
                        parseInt(getStyle(
                            this._nodes[node.center[0].key].d3selection)['margin-left'])));
                middleWidth += centerRect.width;

                if (rightRect.width !== 0) {
                    // add center to right margin
                    middleWidth += Math.max(defaultMargin,
                        Math.max(parseInt(getStyle(
                            this._nodes[node.center[node.center.length - 1].key].d3selection)['margin-right'],
                            this.getStylePropertyMax(node.right, 'margin-left'))));
                    middleWidth += rightRect.width;
                }
            } else if (rightRect.width !== 0) {
                // no center so just add left to right margin
                middleWidth += Math.max(defaultMargin,
                    Math.max(this.getStylePropertyMax(node.left, 'margin-right'),
                        this.getStylePropertyMax(node.right, 'margin-left')));
                middleWidth += rightRect.width;
            }
        } else if (centerRect.width !== 0) {
            // no left nodes
            if (rightRect.width !== 0) {
                // add center to right margin
                middleWidth += Math.max(defaultMargin,
                    Math.max(parseInt(getStyle(
                        this._nodes[node.center[node.center.length - 1].key].d3selection)['margin-right'],
                        this.getStylePropertyMax(node.right, 'margin-left'))));
                middleWidth += rightRect.width;
            }
            middleWidth += centerRect.width;
        } else {
            middleWidth = rightRect.width;
        }
        ret = Math.max(middleWidth, ret);
        ret += Math.max(defaultPadding, parseInt(getStyle(this._nodes[node.key].d3selection).paddingLeft));
        ret += Math.max(defaultPadding, parseInt(getStyle(this._nodes[node.key].d3selection).paddingRight));
        return ret;
    }

    private calculateNodeHeight(node: IHierarchyNode, topRect: Rect, bottomRect: Rect,
        centerRect: Rect, leftRect: Rect, rightRect: Rect, nodeContentRect: Rect,
        defaultMargin: number, defaultPadding: number): number {
        let leftHeight = 0;
        let centerHeight = 0;
        let rightHeight = 0;
        let topBottomHeight = 0;

        // for each possible vertical grouping add up what the maximum height could be
        if (leftRect.height !== 0) {
            // calc the total height of the left nodes + top + bottom with margins
            leftHeight = leftRect.height;
            if (topRect.height !== 0) {
                // add top node bottom margin or left nodes top margin
                leftHeight += Math.max(defaultMargin,
                    Math.max(this.getStylePropertyMax(node.top, 'margin-bottom'),
                        parseInt(getStyle(this._nodes[node.left[0].key].d3selection)['margin-top'])));
                leftHeight += topRect.height;
            }
            if (bottomRect.height !== 0) {
                // add left nodes bottom margin or bottom nodes top margin
                leftHeight += Math.max(defaultMargin,
                    Math.max(parseInt(getStyle(
                        this._nodes[node.left[node.left.length - 1].key].d3selection)['margin-bottom'],
                        this.getStylePropertyMax(node.bottom, 'margin-top'))));
                leftHeight += bottomRect.height;
            }
        }
        if (centerRect.height !== 0) {
            // calc the total height of the center nodes + top + bottom with margins
            centerHeight = centerRect.height;
            if (topRect.height !== 0) {
                // add top node bottom margin or center nodes top margin
                centerHeight += Math.max(defaultMargin,
                    Math.max(this.getStylePropertyMax(node.top, 'margin-bottom'),
                        this.getStylePropertyMax(node.center, 'margin-top')));
                centerHeight += topRect.height;
            }

            if (bottomRect.height !== 0) {
                // add center nodes bottom margin or bottom nodes top margin
                centerHeight += bottomRect.height;
                centerHeight += Math.max(defaultMargin,
                    Math.max(this.getStylePropertyMax(node.center, 'margin-bottom'),
                        this.getStylePropertyMax(node.bottom, 'margin-top')));
            }
        }
        if (rightRect.height !== 0) {
            // add top node bottom margin or right nodes top margin
            rightHeight = rightRect.height;
            if (topRect.height !== 0) {
                rightHeight += topRect.height;
                rightHeight += Math.max(defaultMargin,
                    Math.max(this.getStylePropertyMax(node.top, 'margin-bottom'),
                        parseInt(getStyle(this._nodes[node.right[0].key].d3selection)['margin-top'])));
            }
            if (bottomRect.height !== 0) {
                // add right nodes bottom margin or bottom nodes top margin
                rightHeight += bottomRect.height;
                rightHeight += Math.max(defaultMargin,
                    Math.max(parseInt(getStyle(
                        this._nodes[node.right[node.right.length - 1].key].d3selection)['margin-bottom'],
                        this.getStylePropertyMax(node.bottom, 'margin-top'))));
            }
        }
        if (topRect.height && bottomRect.height) {
            topBottomHeight = topRect.height + bottomRect.height;
            topBottomHeight += Math.max(defaultMargin,
                Math.max(this.getStylePropertyMax(node.top, 'margin-bottom'),
                    this.getStylePropertyMax(node.bottom, 'margin-top')));
        }

        let ret = 0;
        ret = Math.max(ret, topRect.height);
        ret = Math.max(ret, bottomRect.height);
        ret = Math.max(ret, topBottomHeight);
        ret = Math.max(ret, leftHeight);
        ret = Math.max(ret, centerHeight);
        ret = Math.max(ret, rightHeight);

        if (nodeContentRect.height) {
            ret += nodeContentRect.height;
        }

        ret += Math.max(defaultPadding, parseInt(getStyle(this._nodes[node.key].d3selection).paddingTop));
        ret += Math.max(defaultPadding, parseInt(getStyle(this._nodes[node.key].d3selection).paddingBottom));
        return ret;
    }

    /**
    * move this node and its decendants into place
    */
    private transformNode(node: IHierarchyNode,
        border: d3.Selection<any, any, d3.BaseType, any>,
        nodeContents: d3.Selection<any, any, d3.BaseType, any>,
        defaultMargin: number, defaultPadding: number) {

        let self = this;
        let renderedNode = self._nodes[node.key];

        let rect = new Rect(0, 0, 0, 0);

        // get the width of the whole window
        let widthProp = 'width';
        let heightProp = 'height';

        let cssMargin = parseInt(getStyle(renderedNode.d3selection)['margin-top']);
        defaultMargin = cssMargin ? cssMargin : defaultMargin;

        let cssPadding = parseInt(getStyle(renderedNode.d3selection)['padding-top']);
        defaultPadding = cssPadding ? cssPadding : defaultPadding;

        let topRect = new Rect(0, 0, self.sumHorizontal(node.top, defaultMargin),
            self.getRectPropertyMax(node.top, heightProp));
        let bottomRect = new Rect(0, 0, self.sumHorizontal(node.bottom, defaultMargin),
            self.getRectPropertyMax(node.bottom, heightProp));
        let leftRect = new Rect(0, 0, self.getRectPropertyMax(node.left, widthProp),
            self.sumVertical(node.left, defaultMargin));
        let rightRect = new Rect(0, 0, self.getRectPropertyMax(node.right, widthProp),
            self.sumVertical(node.right, defaultMargin));
        let centerRect = new Rect(0, 0, self.sumHorizontal(node.center, defaultMargin),
            self.getRectPropertyMax(node.center, heightProp));

        let nodeContentRect = new Rect(0, 0, renderedNode.rect[widthProp],
            renderedNode.rect[heightProp]);

        // compute the rectangle with with padding/margins
        rect.width = self.calculateNodeWidth(node, topRect, bottomRect, centerRect, leftRect,
            rightRect, nodeContentRect, defaultMargin, defaultPadding);

        rect.height = self.calculateNodeHeight(node, topRect, bottomRect, centerRect, leftRect,
            rightRect, nodeContentRect, defaultMargin, defaultPadding);

        // draw the border now that we know the dimensions
        if (border) {
            // render full size so we can see what the CSS looks like
            border
                .attr('height', rect.height)
                .attr('width', rect.width);

            let renderedRect = convertToSVGCoords(self._svg, border);
            rect.height = renderedRect.height;
            rect.width = renderedRect.width;

            // now show it as a transition
            border
                .attr('height', 0)
                .attr('width', 0)
                .transition()
                .duration(self.getAnimateDuration())
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', rect.height)
                .attr('width', rect.width);
        }
        renderedNode.rect = rect;

        if (nodeContents) {
            let contentStyle = getStyle(nodeContents);
            let xOffset = (rect.width - nodeContentRect.width) / 2;
            let yPadding = defaultPadding;
            let yOffset = yPadding;
            nodeContents
                .transition()
                .duration(self.getAnimateDuration())
                .attr('transform', 'translate(' + xOffset + ',' + yOffset + ')');
        }

        let parentMidX = rect.width / 2;

        let elemMidX = parentMidX - topRect.width / 2;
        let elemMidY = self._padding + nodeContentRect.height + topRect.height / 2;
        self.transformHorizontalNodes(elemMidX, elemMidY, node.top, defaultMargin);

        // find the center of the center square (parent rect is a 3x3 tic-tac-toe)
        let centerMidX = leftRect.width +
            ((rect.width - rightRect.width - leftRect.width) / 2);
        let centerMidY = topRect.height + nodeContentRect.height +
            ((rect.height - bottomRect.height - topRect.height - nodeContentRect.height) / 2);
        elemMidX = self._padding + leftRect.width / 2;
        self.transformVerticalNodes(elemMidX, centerMidY - leftRect.height / 2,
            node.left, defaultMargin);

        elemMidX = rect.width - (rightRect.width + self._padding) / 2;
        self.transformVerticalNodes(elemMidX, centerMidY - rightRect.height / 2,
            node.right, defaultMargin);

        elemMidX = parentMidX - bottomRect.width / 2;
        elemMidY = rect.height - bottomRect.height / 2 - self._padding;
        self.transformHorizontalNodes(elemMidX, elemMidY, node.bottom, defaultMargin);

        if (node.center && node.center.length > 0) {
            // centerX is the x pos where the node center starts.  This is different than Y
            let centerX = centerMidX - centerRect.width / 2;
            if (leftRect.width) {
                centerX = Math.max(centerX, self._padding + leftRect.width +
                    Math.max(defaultMargin,
                        Math.max(this.getStylePropertyMax(node.left, 'margin-right'),
                            parseInt(getStyle(self._nodes[node.center[0].key].d3selection)['margin-left']))));
            }
            if (rightRect.width) {
                centerX = Math.min(centerX, rect.width - self._padding - rightRect.width -
                    centerRect.width -
                    Math.max(defaultMargin,
                        Math.max(this.getStylePropertyMax(node.right, 'margin-left'),
                            parseInt(getStyle(
                                self._nodes[node.center[node.center.length - 1].key].d3selection)['margin-left']))));
            }

            // centerY is the y pos of the middle the center nodes.  This is different than X.
            let centerY = centerMidY;
            if (topRect.height) {
                centerY = Math.max(centerY, self._padding + topRect.height +
                    Math.max(defaultMargin,
                        Math.max(this.getStylePropertyMax(node.top, 'margin-bottom'),
                            this.getStylePropertyMax(node.center, 'margin-top'))) +
                    centerRect.height / 2);
            }

            if (bottomRect.height) {
                centerY = Math.min(centerY, rect.height - self._padding - bottomRect.height -
                    centerRect.height / 2 -
                    Math.max(defaultMargin,
                        Math.max(this.getStylePropertyMax(node.center, 'margin-bottom'),
                            this.getStylePropertyMax(node.bottom, 'margin-top'))));
            }

            self.transformHorizontalNodes(centerX, centerY, node.center, defaultMargin);
        }
    }

    /**
     * configure the hover requirements for a node
     */
    protected configureItemHover(elem: any, node: IRenderedDiagramNode) {
        let self = this;
        if (!(node.def as IHierarchyNode).disableHover) {
            elem.on('mouseenter', self.nodeHoverStart)
                .on('mouseleave', self.hoverEnd);
        } else {
            elem.on('mouseenter', function () { elem.classed('hover', true) })
                .on('mouseleave', function () { elem.classed('hover', false) });
        }

        if (!(node.def as IHierarchyNode).hideTooltip) {
            self._dataTooltip.setTarget(elem);
        }

        let graph = (this._element as IHierarchyGraph);
        addClickHelper(elem, graph.onClick, graph.onDoubleClick, graph.contextMenuItems,
            self._dataTooltip, graph);

        let htmlNode = elem.node();
        htmlNode['__data__'] = node.def;
    }

    /**
     * helper function to traverse the node trees.
     * Walks over the top/bottom/left/right/center children arrays and applies the
     * callback function to those nodes
     */
    static CHILDREN = ['top', 'bottom', 'left', 'right', 'center'];
    private renderNodes(parent: IHierarchyNode, node: IHierarchyNode,
        group: d3.Selection<any, any, d3.BaseType, any>, depth: number) {

        let self = this;
        node.depth = depth;
        let renderedNode: IRenderedHierarchyNode = {
            def: node,
            ports: {}
        };
        self._nodes[node.key] = renderedNode;
        node.parent = parent;

        if (self._decimator && !self._decimator.isVisible(node)) {
            delete renderedNode.d3selection;
            return;
        }

        let getColor = function () {
            if (node.type && node.type.length > 0) {
                for (let i = 0; i < node.type.length; ++i) {
                    if (self._colorMgr.hasColor(node.type[i])) {
                        return self._colorMgr.getColor(node.type[i]);
                    }
                }
            }
            if (node.key && self._colorMgr.hasColor(node.key)) {
                return self._colorMgr.getColor(node.key);
            }
            return 'white';
        }

        let classes = getSelectionName(node.key) + ' node ';
        if (node.type && node.type.length > 0) {
            for (let i = 0; i < node.type.length; ++i) {
                classes += ' ' + getSelectionName(node.type[i]);
            }
        }

        let childGroup = group.append('g')
            .classed(classes, true);

        renderedNode.d3selection = childGroup;

        let border: d3.Selection<any, any, d3.BaseType, any>;
        if (!node.hideBorder) {
            border = childGroup.append('rect')
                .classed(classes, true)
                .classed('border', true)
                .attr('fill', getColor)
                .attr('stroke', 'black')
                .attr('stroke-opacity', .2)
                .attr('rx', 6)
                .attr('ry', 6);

            self.configureItemHover(border, renderedNode);
        }

        for (let childIdx = 0; childIdx < D3HierarchyGraph.CHILDREN.length; ++childIdx) {
            let children = D3HierarchyGraph.CHILDREN[childIdx];
            if (node.hasOwnProperty(children)) {
                for (let i = 0; i < node[children].length; ++i) {
                    self.renderNodes(node, node[children][i], childGroup, depth + 1);
                }
            }
        }

        let nodeContents: d3.Selection<any, any, d3.BaseType, any>;
        let rect = new Rect(0, 0, 0, 0);
        let image: any;
        let imageRect: any;
        let textLabel: any;
        let textRect: any;
        if (!node.hideImageLabel && (node.label || node.image)) {
            nodeContents = childGroup.append('g')
                .classed(classes, true);

            if (node.image) {
                // X/Y have to be set or else the convertToSVGCoords call gives back a bad rect
                image = nodeContents.append('image')
                    .attr('xlink:href', node.image)
                    .classed(classes, true)
                    .attr('x', self._renderOrigin.x)
                    .attr('y', self._renderOrigin.y);

                let cssHeight = parseInt(getStyle(image).height);
                let cssWidth = parseInt(getStyle(image).width);

                image.attr('height', cssHeight ? cssHeight : node.imageHeight ? node.imageHeight : 40);
                image.attr('width', cssWidth ? cssWidth : node.imageWidth ? node.imageWidth : 40);

                self.configureItemHover(image, renderedNode);

                imageRect = convertToSVGCoords(self._svg, image);
                rect.width = Math.max(rect.width, imageRect.width);
                rect.height += imageRect.height;
            }

            if (node.label) {
                // X/Y have to be set or else the convertToSVGCoords call gives back a bad rect
                textLabel = nodeContents.append('text')
                    .classed(classes, true)
                    .attr('x', self._renderOrigin.x)
                    .attr('y', self._renderOrigin.y)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .text(node.label);

                self.configureItemHover(textLabel, renderedNode);

                textRect = convertToSVGCoords(self._svg, textLabel);
                rect.width = Math.max(rect.width, textRect.width);
                rect.height += textRect.height;
            }
        }

        if (self._renderOrigin.x !== 0 ||
            self._renderOrigin.y !== 0) {

            if (border) {
                // the transition is done in transform nodes since there is other
                // parts of the transition that have to happen
                border
                    .attr('x', self._renderOrigin.x)
                    .attr('y', self._renderOrigin.y);
            }

            if (imageRect) {
                image
                    .transition()
                    .duration(self.getAnimateDuration())
                    .attr('x', rect.width / 2 - imageRect.width / 2)
                    .attr('y', 0);
            }

            if (textRect) {
                textLabel
                    .transition()
                    .duration(self.getAnimateDuration())
                    .attr('x', rect.width / 2)
                    .attr('y', rect.height - textRect.height / 2);
            }
        } else {
            if (imageRect) {
                image.attr('x', rect.width / 2 - imageRect.width / 2)
                    .attr('y', 0);
            }
            if (textRect) {
                textLabel.attr('x', rect.width / 2)
                    .attr('y', rect.height - textRect.height / 2);
            }
        }

        renderedNode.rect = rect;

        self.transformNode(node, border, nodeContents, self._margin, self._padding);
    }

    /** create the ports on the nodes that the links will attach due based on the order of
     * the links in the list.  The first link on a given side of a node takes the first port etc...
     */
    private createLinks(links: IHierarchyGraphLink[]) {
        let ret: IRenderedDiagramLink[] = [];
        let self = this;

        for (let i = 0; i < links.length; ++i) {
            let from = self._nodes[links[i].from as string] as IRenderedHierarchyNode;
            let to = self._nodes[links[i].to as string] as IRenderedHierarchyNode;
            if (self._decimator) {
                while (from && !self._decimator.isVisible(from.def)) {
                    from = self._nodes[(from.def as IHierarchyNode).parent.key];
                }
                while (to && !self._decimator.isVisible(to.def)) {
                    to = self._nodes[(to.def as IHierarchyNode).parent.key];
                }
            }
            // links internal to a node should be ignored
            if (from === undefined || to === undefined) {
                continue;
            }

            // Handle case where one is an ancestor of another
            let descendant = (from.def as IHierarchyNode).depth > (to.def as IHierarchyNode).depth ? from : to;
            let ancestor = (from.def as IHierarchyNode).depth > (to.def as IHierarchyNode).depth ? to : from;

            while ((ancestor.def as IHierarchyNode).depth != (descendant.def as IHierarchyNode).depth) {
                descendant = self._nodes[(descendant.def as IHierarchyNode).parent.key];
            }
            if (ancestor === descendant) {
                continue;
            }

            let renderedLink: IRenderedDiagramLink = {
                def: links[i],
                source: { node: from, endPoint: undefined, alignment: undefined },
                target: { node: to, endPoint: undefined, alignment: undefined },
            };
            ret.push(renderedLink);

            let fromRect = convertToSVGCoords(self._svg, from.d3selection);
            let toRect = convertToSVGCoords(self._svg, to.d3selection);

            if (fromRect.bottom < toRect.y) {
                // from is above to
                if (!from.ports.bottom) {
                    from.ports.bottom = [];
                }
                if (!to.ports.top) {
                    to.ports.top = [];
                }
                from.ports.bottom.push(renderedLink);
                to.ports.top.push(renderedLink);
                renderedLink.source.alignment = Alignment.Bottom;
                renderedLink.target.alignment = Alignment.Top;
            } else if (fromRect.y > toRect.bottom) {
                // from is below to
                if (!from.ports.top) {
                    from.ports.top = [];
                }
                if (!to.ports.bottom) {
                    to.ports.bottom = [];
                }
                from.ports.top.push(renderedLink);
                to.ports.bottom.push(renderedLink);
                renderedLink.source.alignment = Alignment.Top;
                renderedLink.target.alignment = Alignment.Bottom;
            } else if (fromRect.right < toRect.x) {
                // from is left of to
                if (!from.ports.right) {
                    from.ports.right = [];
                }
                if (!to.ports.left) {
                    to.ports.left = [];
                }
                from.ports.right.push(renderedLink);
                to.ports.left.push(renderedLink);
                renderedLink.source.alignment = Alignment.Right;
                renderedLink.target.alignment = Alignment.Left;
            } else {
                // from is to the right of to
                if (!from.ports.left) {
                    from.ports.left = [];
                }
                if (!to.ports.right) {
                    to.ports.right = [];
                }
                from.ports.left.push(renderedLink);
                to.ports.right.push(renderedLink);
                renderedLink.source.alignment = Alignment.Left;
                renderedLink.target.alignment = Alignment.Right;
            }
        }
        return ret;
    }

    /** does an in place merge of input and output links for a node since a node may have
     * input and output ports on the same side of the node
     */
    private mergeNodePorts(links: IRenderedDiagramLink[], node: IRenderedDiagramNode) {
        let nodeEndPoints: { [index: string]: number } = {}; // maps node endpoints to index values
        let usedIdx = 0;
        for (let i = 0; i < links.length; ++i) {
            let link = links[i];
            let linkDef = link.def as IHierarchyGraphLink;
            if (link.source.node === node) {
                if (linkDef.fromConnectionPoint) {
                    if (nodeEndPoints[linkDef.fromConnectionPoint] === undefined) {
                        nodeEndPoints[linkDef.fromConnectionPoint] = ++usedIdx;
                    }
                    link.source.endPoint = nodeEndPoints[linkDef.fromConnectionPoint];
                } else {
                    link.source.endPoint = ++usedIdx;
                }
            }
            else {
                if (linkDef.toConnectionPoint) {
                    if (nodeEndPoints[linkDef.toConnectionPoint] === undefined) {
                        nodeEndPoints[linkDef.toConnectionPoint] = ++usedIdx;
                    }
                    link.target.endPoint = nodeEndPoints[linkDef.toConnectionPoint];
                } else {
                    link.target.endPoint = ++usedIdx;
                }
            }
        }
        links.length = usedIdx;
    }

    /** walk over nodes and sort the link endpoints based on the node positions
    * to minimize crossing so ports are assigned based on the location of the nodes
    * they are connecting to.  Example if the target node is above the source node it will
    * take a higher port position than a link where the target node is below the source node */
    private orderNodePorts() {
        for (let key in this._nodes) {
            let node = this._nodes[key] as IRenderedHierarchyNode;
            let sortVertical = function (a: IRenderedDiagramLink,
                b: IRenderedDiagramLink): number {
                let aComparator = a.source.node === node ? a.target.node : a.source.node;
                let bComparator = b.source.node === node ? b.target.node : b.source.node;
                return aComparator.d3selection.node().getBoundingClientRect().top -
                    bComparator.d3selection.node().getBoundingClientRect().top;
            }
            let sortHorizontal = function (a: IRenderedDiagramLink,
                b: IRenderedDiagramLink): number {
                let aComparator = a.source.node === node ? a.target.node : a.source.node;
                let bComparator = b.source.node === node ? b.target.node : b.source.node;
                return aComparator.d3selection.node().getBoundingClientRect().left -
                    bComparator.d3selection.node().getBoundingClientRect().left;
            }
            if (node.ports.top) {
                node.ports.top.sort(sortHorizontal);
                this.mergeNodePorts(node.ports.top, node);
            }
            if (node.ports.bottom) {
                node.ports.bottom.sort(sortHorizontal);
                this.mergeNodePorts(node.ports.bottom, node);
            }
            if (node.ports.left) {
                node.ports.left.sort(sortVertical);
                this.mergeNodePorts(node.ports.left, node);
            }
            if (node.ports.right) {
                node.ports.right.sort(sortVertical);
                node.ports.right.sort(sortVertical);
                this.mergeNodePorts(node.ports.right, node);
            }
        }
    }

    /**
     * actually render the links using the path information provided
     * by the link functions
     */
    private renderLinks(links: IHierarchyGraphLink[],
        graphArea: d3.Selection<any, any, d3.BaseType, any>) {

        // create the end points for each link
        let renderedLinks: IRenderedDiagramLink[] = this.createLinks(links);

        // sort links to minimize crossing (see function header for more detail)
        this.orderNodePorts();

        this.renderLinkHelper(graphArea, renderedLinks);
    }

    private sizeViewToFit(root: IHierarchyNode): any {
        let resizeView: any;
        let rect = this._nodes[root.key].rect;
        if (this._options.fitToWindow) {
            resizeView = this._svg
                .transition('resizeView')
                .duration(this.getAnimateDuration())
                .attr('viewBox', '0 0 ' + rect.width + ' ' + rect.height)
                .attr('preserveAspectRatio', 'xMidYMid meet');
            if (this._options.width) {
                resizeView
                    .attr('width', this._options.width)
                    .attr('height', undefined);
            } else if (this._options.height) {
                resizeView
                    .attr('width', undefined)
                    .attr('height', this._options.height);
            } else {
                resizeView
                    .attr('width', '100%')
                    .attr('height', undefined);
            }
        } else {
            resizeView = this._svg
                .transition('resizeView')
                .duration(this.getAnimateDuration())
                .attr('width', rect.width)
                .attr('height', rect.height);
        }
        return resizeView;
    }

    private renderHelper(root: IHierarchyNode,
        isBackgroundRender = false): d3.Selection<any, any, d3.BaseType, any> {
        let self = this;
        self._nodes = {};

        let graphArea = self._svg.insert('g', 'g')
            .classed('graph', true);

        let oldAnimateDuration = self.getAnimateDuration();
        if (isBackgroundRender) {
            self._options.animateDuration = 0;
            graphArea.attr('opacity', 0);
        }

        self._decimator = (self._element as IHierarchyGraph).decimator;
        self.renderNodes(undefined, root, graphArea, 0);

        // render links after nodes are done rendering
        self.initializeLinkLayer(graphArea);

        let links = (self._element as IHierarchyGraph).links;
        graphArea
            .transition('nodeWait')
            .duration(self.getAnimateDuration())
            .on('end', function () { self.renderLinks(links, graphArea); });

        if (isBackgroundRender) {
            self._options.animateDuration = oldAnimateDuration;
        } else {
            // resize window if this isn't a background render
            self.sizeViewToFit(root);
        }
        return graphArea;
    }
    /**
     * render the hierarchical graph
     */
    public render(options: IOptions) {
        let self = this;
        let graph = self._element as IHierarchyGraph;

        // TODO pass these in as options
        self._margin = 30;
        self._padding = 10;

        self.loadOptions(options);

        let newRoot = (self._element as IHierarchyGraph).nodes;
        let oldGraph = self._svg.select('.graph');
        let animateDuration = self.getAnimateDuration();
        if (animateDuration !== 0) {
            // make the graph transition in a pretty way

            // this would be where the new root was in the old tree
            let newRootInOldTree = self._nodes[newRoot.key];

            // render the new tree hidden first so we can make transitions
            self._renderOrigin = { x: 0, y: 0 };
            let newGraph = self.renderHelper(newRoot, true);

            // this would be where the old root is in the new
            let oldRootInNewTree: IRenderedDiagramNode;
            let oldGraphNode = oldGraph.select('rect').node();
            if (oldGraphNode) {
                oldRootInNewTree = self._nodes[oldGraphNode['__data__'].key];
            }

            if (newRootInOldTree) {
                // new root was in old tree so this is zooming into a node
                let newRootNode = self._nodes[newRoot.key];
                let oldRect = convertToSVGCoords(self._svg, newRootInOldTree.d3selection);

                let translateOldNode = oldGraph
                    .transition('translateOldNode')
                    .duration(animateDuration)
                    .attr('transform',
                        'translate(-' + oldRect.x + ',-' + oldRect.y + ')');
                let resizeView = self.sizeViewToFit(newRoot);

                let nodeChanged = newRootInOldTree.d3selection.selectAll('*').size() !==
                    newRootNode.d3selection.selectAll('*').size();

                if (nodeChanged) {
                    // root has added/removed nodes so wait for the size
                    // transition and then redraw the root
                    newGraph.remove();
                    resizeView
                        .transition()
                        .duration(animateDuration / 2)
                        .attr('width', 0)
                        .attr('height', 0)
                        .on('end', function () {
                            oldGraph.remove();
                            self.renderHelper(newRoot);
                        });
                } else {
                    translateOldNode
                        .on('end', function () {
                            oldGraph.remove();
                            newGraph.attr('opacity', 1);
                        });
                }
            } else if (oldRootInNewTree && oldRootInNewTree.d3selection) {
                // set timeout so new tree is rendered first so we can adjust our animation
                setTimeout(function () {
                    // if this is in the old tree and rendered
                    let newRect = convertToSVGCoords(self._svg, oldRootInNewTree.d3selection);
                    let topLeft = {
                        x: newRect.x,
                        y: newRect.y
                    };

                    self._renderOrigin = {
                        x: (newRect.x + newRect.right) / 2,
                        y: (newRect.y + newRect.bottom) / 2,
                    };
                    // old root is in new tree so zooming out
                    let newElemCount = oldRootInNewTree.d3selection.selectAll('*').size();
                    let oldElemCount = oldGraph.select('.node').selectAll('*').size();
                    let nodeChanged = newElemCount !== oldElemCount;
                    newGraph.remove();

                    let translateOldNode = oldGraph
                        .transition('translateOldNode')
                        .duration(animateDuration)
                        .attr('width', 0)
                        .attr('height', 0)
                        .attr('transform',
                            'translate(' + topLeft.x + ',' + topLeft.y + ')')
                        .on('end', function () {
                            if (nodeChanged) {
                                oldGraph.remove();
                            }
                            self.renderHelper(newRoot)
                                .transition()
                                .duration(self.getAnimateDuration())
                                .on('end', function () {
                                    if (!nodeChanged) {
                                        oldGraph.remove();
                                    }
                                });
                        });

                    self.sizeViewToFit(newRoot);
                }, 0);
            } else {
                // totally orthogonal tree so just render it
                newGraph.remove();

                self._renderOrigin = { x: 0, y: 0 };
                self._svg
                    .transition('hideView')
                    .duration(animateDuration)
                    .attr('width', 0)
                    .attr('height', 0)
                    .on('end', function () {
                        oldGraph.remove();
                        self.renderHelper(newRoot);
                    });
            }
        } else {
            self._renderOrigin = { x: 0, y: 0 };
            oldGraph.remove();
            self.renderHelper(newRoot);
        }
    }
}
D3Renderer.register(UIType.HierarchyGraph, D3HierarchyGraph);