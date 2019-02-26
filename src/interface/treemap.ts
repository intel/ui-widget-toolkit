import { UIElement, IEvent, IContextMenuItem } from './ui-base'

export interface ITreeMapNode {
    id: any;
    name?: string;
    children?: ITreeMapNode[];
    value?: number;
}

export interface ITreeMap extends UIElement {
    root: ITreeMapNode;
    onClick?: (event: IEvent) => void;
    onDoubleClick?: (event: IEvent) => void;
    contextMenuItems?: IContextMenuItem[];

    showChildrenOnHover?: boolean;
}
