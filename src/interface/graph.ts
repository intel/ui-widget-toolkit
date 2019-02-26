import { UIElement, ILegend, IEvent, IContextMenuItem } from './ui-base'

export interface IGraph extends UIElement {
    title?: string;
}

/** a node in a connected graph */
export interface IGraphNode {
    key: string;
    /** specifies that this node is part of a larger group */
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
    legend?: ILegend;
    onClick?: (event: IEvent) => void;
    onDoubleClick?: (event: IEvent) => void;
    contextMenuItems?: IContextMenuItem[];
    brushContextMenuItems?: IContextMenuItem[];
}

export enum LinkType {
    Linear = 1,
    Elbow = 2,
    Directional = 4,
    Bidirectional = 8,
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

export interface IGraphNodeDecimator {
    isVisible: (node: IHierarchyNode) => boolean;
}

/** a set of links and nodes to render as a connected graph */
export interface IHierarchyGraph extends IGraph {
    links: IHierarchyGraphLink[];
    nodes?: IHierarchyNode;

    legend?: ILegend;
    onClick?: (event: IEvent) => void;
    onDoubleClick?: (event: IEvent) => void;
    contextMenuItems?: IContextMenuItem[];
    brushContextMenuItems?: IContextMenuItem[];
    decimator?: IGraphNodeDecimator;
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
    disablePortRendering?: boolean;
}