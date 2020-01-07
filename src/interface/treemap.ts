import { UIElement, IEvent, IContextMenuItem } from './ui-base'

/**
 * Represents a node in a tree of nodes
 */
export interface ITreeMapNode {
    /** the unique ID of this node
     * May be used in [[SelectionHelper]] and [[ColorManager]]
     */
    id: any;

    /** display name for this name
     * May be used in [[SelectionHelper]] and [[ColorManager]]
     */
    name?: string;

    /** children of this node if the top level node represents
     * multiple aggregated nodes
     */
    children?: ITreeMapNode[];
    /** the value of the node which determines the size
     * of the node
     */
    value?: number;
}

export interface ITreeMap extends UIElement {
    root: ITreeMapNode;

    /** the context menu definitions for when the user right clicks */
    contextMenuItems?: IContextMenuItem[];

    /** when hovering over a node, render the children of this node
     * within the bounds of the top level node
     */
    showChildrenOnHover?: boolean;
}
