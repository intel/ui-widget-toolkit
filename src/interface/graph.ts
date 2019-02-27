import { UIElement, ILegend, IEvent, IContextMenuItem } from './ui-base'

export interface IGraph extends UIElement {
    title?: string;
}

/** a node in a connected graph */
export interface IGraphNode {
    /** the key of the node that is used by the
     * by the [[SelectionHelper]] and [[ColorManager]]
    */
    key: string;
    /** specifies list of larger groups this node is part of.  Used
     * by the [[SelectionHelper]] and [[ColorManager]]
    */
    type?: string[];
}

/** a line between two nodes in a connected graph */
export interface IGraphLink {
    /** the key of the node that starts the connection */
    from: string | IGraphNode;
    /** the key of the node that ends the connection */
    to: string | IGraphNode;
    /** a value associated with the link */
    value?: number;
}

/** a set of links and nodes to render as a connected graph */
export interface IConnectedGraph extends IGraph {
    links: IGraphLink[];
    nodes?: IGraphNode[];
    /** add a legend definition to render */
    legend?: ILegend;
    /** Callback that happens on node/link click */
    onClick?: (event: IEvent) => void;
    /** Callback that happens on node/link double click */
    onDoubleClick?: (event: IEvent) => void;
    /** the context menu definitions for when the user right clicks */
    contextMenuItems?: IContextMenuItem[];
    /** the context menu definitions for when the user finishes a brush action */
    brushContextMenuItems?: IContextMenuItem[];
}

export enum LinkType {
    Linear = 1,
    Elbow = 2,
    /** adds an arrow from the input to the output */
    Directional = 4,
    /** adds an arrow from the input to the output and vice versa */
    Bidirectional = 8,
    /** render the link as a curve */
    Curve = 16
}

/** common diagram link type so we can have one common rendering function */
export interface IDiagramLink extends IGraphLink {
    /** how to render the link  */
    linkType?: LinkType;
    /** width of this link */
    width?: number;
    /** color for this link */
    color?: string;
    /** type of link which may be used for coloring */
    type?: string[];
}

export interface IHierarchyGraphLink extends IDiagramLink {
    /** an id on the from node for links that want to share the link point on the node */
    fromConnectionPoint?: string;
    /** an id on the to node for links that want to share the link point on the node */
    toConnectionPoint?: string;
}

/** a node in a connected graph */
export interface IHierarchyNode extends IGraphNode {
    /** specifies an image associated with this node */
    image?: string;
    /** specifies an image associated with this node */
    imageHeight?: number;
    /** specifies an image associated with this node */
    imageWidth?: number;

    /** Label for this node, use if label is duplicated */
    label?: string;

    /** any center aligned nodes */
    center?: IHierarchyNode[];
    /** specifies top aligned nodes */
    top?: IHierarchyNode[];
    /** specifies bottom aligned nodes */
    bottom?: IHierarchyNode[];
    /** specifies bottom aligned nodes */
    left?: IHierarchyNode[];
    /** specifies bottom aligned nodes */
    right?: IHierarchyNode[];
    /** whether to render the border around the node or not */
    hideBorder?: boolean;
    /** whether to show a tooltip on this element or not */
    hideTooltip?: boolean;
    /** whether to show the image and label of this element or not */
    hideImageLabel?: boolean;

    /** disable hover highlighting */
    disableHover?: boolean;

    /** this data may be added by the rendering algorithm */
    parent?: IHierarchyNode;
    depth?: number;
}

/** implement this interface if you want to adjust what nodes to draw */
export interface IGraphNodeDecimator {
    /**
     * @param node - node to test if it passes the decimator
     * @returns true if the node should be rendered
      */
    isVisible: (node: IHierarchyNode) => boolean;
}

/** a set of links and nodes to render as a connected graph */
export interface IHierarchyGraph extends IGraph {
    links: IHierarchyGraphLink[];
    nodes?: IHierarchyNode;

    /** add a legend definition to render */
    legend?: ILegend;
    /** Callback that happens on node/link click */
    onClick?: (event: IEvent) => void;
    /** Callback that happens on node/link double click */
    onDoubleClick?: (event: IEvent) => void;
    /** the context menu definitions for when the user right clicks */
    contextMenuItems?: IContextMenuItem[];
    /** a decimator used to control graph node visibility */
    decimator?: IGraphNodeDecimator;
}

export enum NodeType {
    /** render port nodes as a circle */
    NodeSimple,
    /** render port nodes as a rectangle putting the type as the title */
    NodeRectangle
}

/** a node in a port diagram */
export interface IPortDiagramNode extends IGraphNode {
    x: number;
    y: number;
    ports: {
        left?: { key: string }[],
        right?: { key: string }[],
        top?: { key: string }[],
        bottom?: { key: string }[]
    },
    renderType?: NodeType,
    width?: number,
    height?: number
}

export interface IPortDiagramLink extends IDiagramLink {
    /** an id on the from node for links that want to share the link point on the node */
    fromPort: string;
    /** an id on the to node for links that want to share the link point on the node */
    toPort: string;
}

/** a set of links and nodes to render as a connected graph */
export interface IPortDiagram extends IConnectedGraph {
    links: IPortDiagramLink[];
    nodes: IPortDiagramNode[];

    // TODO remote this hack and put it where it should go
    decimator?: (node: any) => boolean;
    /** global control of what types of render nodes to use */
    nodeRenderType?: NodeType;
    /** disable port rendering for performance reasons if needed */
    disablePortRendering?: boolean;
}