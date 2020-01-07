import { copy, removeFromList } from './utilities';
import {
    UIElement, UIElementManager, UIRenderer, IEvent, IOptions,
    ITooltipData, EventType
} from '../interface/ui-base';

const enum GroupType {
    Tooltip,
    Highlight,
    Render,
    Focus,
    Select,
    None
}

export class GroupInfo {
    public _nameMap: { [index: string]: UIElement[] };
    public _objectMap: Map<UIElement, UIElement[]>;

    constructor() {
        this._nameMap = {};
        this._objectMap = new Map<UIElement, UIElement[]>();
    }
}

function addTooltipCallback(elem: UIElement) {
    if (!elem.getTooltip) {
        elem.getTooltip = function (event: IEvent): ITooltipData[] {
            if (elem.renderer && elem.renderer.getTooltipData) {
                return elem.renderer.getTooltipData(elem, event);
            }
            return [{ source: elem, group: '', metrics: {} }];
        }
    }
}

function addClickCallback(elem: UIElement) {
    if (!elem.api) {
        elem.api = {}
    }
    if (!elem.api.select) {
        elem.api.select = function (event: IEvent): void {
            if (elem.renderer && elem.renderer.select) {
                return elem.renderer.select(elem, event);
            }
        }
    }
}

function addHoverCallback(elem: UIElement) {
    if (!elem.api) {
        elem.api = {}
    }
    if (!elem.api.cursorChange) {
        elem.api.cursorChange = function (event: IEvent): void {
            if (elem.renderer && elem.renderer.cursorChange) {
                return elem.renderer.cursorChange(elem, event);
            }
        }
    }

    if (!elem.api.focus) {
        elem.api.focus = function (event: IEvent): void {
            /** @deprecated ('Deprecated since 1.14.0 in favor of focus.  Will be removed in 2.x') */
            if (elem.renderer && !elem.renderer.focus && elem.renderer.hover) {
                return elem.renderer.hover(elem, event);
            }
            // end deprecated

            if (elem.renderer && elem.renderer.focus) {
                return elem.renderer.focus(elem, event);
            }
        }
        elem.api.hover = elem.api.focus;
    }

    if (!elem.api.brush) {
        elem.api.brush = function (event: IEvent): void {
            if (elem.renderer && elem.renderer.brush) {
                return elem.renderer.brush(elem, event);
            }
        }
    }

    if (!elem.api.zoom) {
        elem.api.zoom = function (event: IEvent): void {
            if (elem.renderer && elem.renderer.zoom) {
                return elem.renderer.zoom(elem, event);
            }
        }
    }
}

function addRenderCallback(elem: UIElement) {
    if (!elem.api) {
        elem.api = {}
    }
    if (!elem.api.brush) {
        elem.api.brush = function (event: IEvent): void {
            if (elem.renderer && elem.renderer.brush) {
                return elem.renderer.brush(elem, event);
            }
        }
    }
    if (!elem.api.render) {
        elem.api.render = function (renderer: UIRenderer, options: IOptions): Promise<any> {
            if (!renderer) {
                renderer = elem.renderer;
            } else {
                elem.renderer = renderer;
            }

            return new Promise<any>(function (resolve, reject) {
                if (renderer) {
                    elem.renderer.render(elem, options);
                    resolve('Ok');
                }
                reject('No renderer available');
            });
        }
    }
}

/** adds some default callbacks to a given UI object */
export function addCallbacks(elem: UIElement) {
    addTooltipCallback(elem);
    addHoverCallback(elem);
    addClickCallback(elem);
    addRenderCallback(elem);
}

/** used to group UI elements together.  Can be used to sync
 * selection/tooltips
 */
export class ElementManager implements UIElementManager {
    /** the list of elements managed by this manager */
    protected _elems: UIElement[] = [];

    /** the groups of elements created by this group */
    protected _groupInfo: GroupInfo[];

    protected _hoverCallback: (group: UIElement[], event: IEvent) => void;
    protected _clickCallback: (group: UIElement[], event: IEvent) => void;
    protected _zoomCallback: (group: UIElement[], event: IEvent) => void;
    protected _tooltipCallback: (group: UIElement[], event: IEvent) => ITooltipData;
    protected _cursorChangeCallback: (group: UIElement[], event: IEvent) => void;
    protected _brushCallback: (group: UIElement[], event: IEvent) => void;

    protected _onTooltipCallback: (event: IEvent) => ITooltipData[];
    protected _onZoomCallback: (event: IEvent) => void;
    protected _onHoverCallback: (event: IEvent) => void;
    protected _onClickCallback: (event: IEvent) => void;
    protected _onCursorChangeCallback: (event: IEvent) => void;
    protected _onBrushCallback: (event: IEvent) => void;
    protected _onUpdateCallback: (caller: UIElement, options: IOptions) => void;

    constructor() {
        let self = this;

        this._groupInfo = [];
        for (let i = 0; i < GroupType.None; ++i) {
            this._groupInfo.push(new GroupInfo());
        }

        this._onHoverCallback = function (event: IEvent): void {
            if (!event.caller) {
                console.warn('Warning no caller specified for this event, cannot propoate changes', event);
            }
            let elems = self._groupInfo[GroupType.Focus]._objectMap.get(event.caller);
            if (elems) {
                if (self._hoverCallback) {
                    self._hoverCallback(elems, event);
                } else {
                    for (let i = 0; i < elems.length; ++i) {
                        let elem = elems[i];
                        /** @deprecated to remove in 2.x */
                        if (event.caller !== elem && elem.api && !elem.api.focus && elem.api.hover) {
                            elem.api.hover(event);
                        }
                        // end deprecated
                        if (event.caller !== elem && elem.api && elem.api.focus) {
                            elem.api.focus(event);
                        }
                    }
                }
            }
        }

        let dispatch = function (groupType: GroupType, callback: any, apiName: string) {
            return function (event: IEvent) {
                if (!event.caller) {
                    console.warn('Warning no caller specified for this event, cannot propagate changes', event);
                }
                let elems = self._groupInfo[groupType]._objectMap.get(event.caller);
                if (elems) {
                    if (callback) {
                        callback(elems, event);
                    } else {
                        for (let i = 0; i < elems.length; ++i) {
                            let elem = elems[i];
                            if (event.caller !== elem && elem.api && elem.api[apiName]) {
                                elem.api[apiName](event);
                            }
                        }
                    }
                }
            }
        }
        this._onZoomCallback = dispatch(GroupType.Highlight, this._zoomCallback, 'zoom');
        this._onCursorChangeCallback = dispatch(GroupType.Highlight, this._cursorChangeCallback, 'cursorChange');
        this._onBrushCallback = dispatch(GroupType.Highlight, this._brushCallback, 'brush');
        this._onClickCallback = dispatch(GroupType.Select, this._clickCallback, 'select');

        this._onTooltipCallback = function (event: IEvent): ITooltipData[] {
            if (!event.caller) {
                console.warn('Warning no caller specified for this event, cannot propoate changes', event);
            }
            let ret: ITooltipData[] = [];
            let elems = self._groupInfo[GroupType.Tooltip]._objectMap.get(event.caller);
            if (elems) {
                if (self._tooltipCallback) {
                    ret = ret.concat(self._tooltipCallback(elems, event));
                } else {
                    for (let i = 0; i < elems.length; ++i) {
                        let elem = elems[i];
                        let data = elem.getTooltip(event);
                        ret = ret.concat(data);
                    }
                }
                if (event.data && event.data.tooltip) {
                    event.data.tooltip.setData(event.data.tooltip.getTitle(), ret);
                }
                return ret;
            }
        }
        this._onUpdateCallback = function (caller: UIElement,
            options: IOptions): void {
            if (!caller) {
                console.warn('Warning no caller specified for this event, cannot propoate changes');
            }
            let elems = self._groupInfo[GroupType.Render]._objectMap.get(caller);
            if (elems) {
                for (let i = 0; i < elems.length; ++i) {
                    let elem = elems[i];

                    if (elem.renderer) {
                        // use the previous renderer
                        elem.renderer.render(elem, options);
                    }
                }
            }
        }
    }

    private removeFromGroup(elem: UIElement, type: GroupType) {
        let list = this._groupInfo[type]._objectMap.get(elem);
        if (list) {
            removeFromList(elem, list);
        }
    }

    private addToGroup(elem: UIElement, groupName: string, type: GroupType) {
        if (!this._groupInfo[type]._nameMap.hasOwnProperty(groupName)) {
            this._groupInfo[type]._nameMap[groupName] = [];
        }
        this._groupInfo[type]._nameMap[groupName].push(elem);
        this._groupInfo[type]._objectMap.set(elem, this._groupInfo[type]._nameMap[groupName]);
    }

    /**
     * add a elem to the manager
     *
     * @param elem - the elem that should should be added
     * @param tooltipGroupName - Name of the group that this elem should be "ganged"
     *   with when showing tooltips.  If not specified, this elem will not be "ganged" with any
     *   other elem.
     * @param highlightGroupName - Name of the group that this elem should be "ganged"
     *   with when doing highlighting.  If not specified, this elem will not be "ganged" with any
     *   other elem.
     * @param renderGroupName - Name of the group that this elem should be "ganged"
     *   with when rerendering.  If not specified, this elem will not be "ganged" with any
     *   other elem.
     * @return - The elem manager instance.
     */
    public addElement(elem: UIElement, tooltipGroupName?: string,
        highlightGroupName?: string, renderGroupName?: string): ElementManager {

        if (!elem) {
            return this;
        }
        let index = this._elems.indexOf(elem);
        if (index === -1) {
            addCallbacks(elem);
            this._elems.push(elem);

            let renderedElements: UIElement[];
            if (!elem.getElements) {
                elem.getElements = function () { return [elem] }
            }

            renderedElements = elem.getElements();

            for (let i = 0; i < renderedElements.length; ++i) {
                let renderedElement = renderedElements[i];
                if (tooltipGroupName) {
                    this.addToTooltipGroup(renderedElement, tooltipGroupName);
                }
                if (highlightGroupName) {
                    this.addToHighlightGroup(renderedElement, highlightGroupName);
                }
                if (renderGroupName) {
                    this.addToRenderGroup(renderedElement, renderGroupName);
                }
            }
        } else {
            throw 'Element already exists in this manager';
        }
        elem.manager = this;
        return this;
    }

    /**
     * remove a elem from the manager, removes it from all groups
     *
     * @param elem - the elem that should should be removed
     *
     * @return - The elem manager instance.
     */
    public removeElement(elem: UIElement): ElementManager {
        if (!elem) {
            return this;
        }

        let renderedElements: UIElement[];
        if (elem.getElements) {
            renderedElements = elem.getElements();
        } else {
            renderedElements = [elem];
        }

        for (let i = 0; i < renderedElements.length; ++i) {
            let renderedElement = renderedElements[i];

            this.removeFromTooltipGroup(renderedElement);
            this.removeFromHighlightGroup(renderedElement);
            this.removeFromRenderGroup(renderedElement);
        }
        removeFromList(elem, this._elems);

        delete elem.manager;
        return this;
    }

    /**
     * Return all the elems in this list
     * @return the list of elems
     */
    public getElements(): UIElement[] {
        return this._elems;
    }

    /**
     * user callback called when a tooltip is created
     *
     * @param the functiotn to be called
     */
    public setZoomCallback(callback: (group: UIElement[],
        event: IEvent) => ITooltipData): ElementManager {
        this._zoomCallback = callback;
        return this;
    }

    /**
     * user callback called when a hover event happens
     *
     * @param the function to be called
     */
    public setHoverCallback(callback: (group: UIElement[], event: IEvent) => void): ElementManager {
        this._hoverCallback = callback;
        return this;
    }

    /**
     * user callback called when a hover event happens
     *
     * @param the function to be called
     */
    public setClickCallback(callback: (group: UIElement[], event: IEvent) => void): ElementManager {
        this._clickCallback = callback;
        return this;
    }

    /**
     * user callback called when a tooltip is created
     *
     * @param the functiotn to be called
     */
    public setTooltipCallback(callback: (group: UIElement[],
        event: IEvent) => ITooltipData): ElementManager {
        this._tooltipCallback = callback;
        return this;
    }

    /**
     * user callback called when a selection event happens
     *
     * @param the function to be called
     */
    public setBrushCallback(callback: (group: UIElement[], event: IEvent) => void): ElementManager {
        this._brushCallback = callback;
        return this;
    }

    /**
     * set the group this tooltip is associated with
     *
     * @param elem - the elem that should should be "ganged"
     * @param groupName - Name of the group that this elem should be "ganged"
     *   with.
     *
     * @return - The elem manager instance.
     */
    public addToTooltipGroup(elem: UIElement, groupName: string): ElementManager {
        addTooltipCallback(elem);
        this.removeFromTooltipGroup(elem);
        this.addToGroup(elem, groupName, GroupType.Tooltip);

        let self = this;
        if (elem.onTooltip) {
            let func = elem.onTooltip;
            elem.onTooltip = function (event: IEvent) {
                self._onTooltipCallback(event);
                func(event);
            }
        } else {
            elem.onTooltip = this._onTooltipCallback;
        }

        return this;
    }

    /**
     * remove the elem from the tooltip group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    public removeFromTooltipGroup(elem: UIElement): ElementManager {
        this.removeFromGroup(elem, GroupType.Tooltip);
        return this;
    }

    /**
    * set the group to sync this elem with
    *
    * @param elem - the elem that should should be "ganged"
    * @param groupName - Name of the group that this elem should be "ganged"
    *   with.
    *
    * @return - The elem manager instance.
    */
    public addToFocusGroup(elem: UIElement, groupName: string): ElementManager {
        addHoverCallback(elem);
        this.removeFromFocusGroup(elem);

        let self = this;
        if (elem.onHover) {
            let func = elem.onHover;
            elem.onHover = function (event: IEvent) {
                self._onHoverCallback(event);
                func(event);
            }
        } else {
            elem.onHover = self._onHoverCallback;
        }

        this.addToGroup(elem, groupName, GroupType.Focus);

        return this;
    }

    /**
     * remove the elem from the zoom group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    public removeFromFocusGroup(elem: UIElement): ElementManager {
        this.removeFromGroup(elem, GroupType.Focus);
        return this;
    }

    /**
    * set the group to sync this elem with
    *
    * @param elem - the elem that should should be "ganged"
    * @param groupName - Name of the group that this elem should be "ganged"
    *   with.
    *
    * @return - The elem manager instance.
    */
    public addToSelectGroup(elem: UIElement, groupName: string): ElementManager {
        addClickCallback(elem);
        this.removeFromSelectGroup(elem);

        let self = this;
        if (elem.onClick) {
            let func = elem.onClick;
            elem.onClick = function (event: IEvent) {
                self._onClickCallback(event);
                func(event);
            }
        } else {
            elem.onClick = self._onClickCallback;
        }

        this.addToGroup(elem, groupName, GroupType.Select);

        return this;
    }

    /**
     * remove the elem from the zoom group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    public removeFromSelectGroup(elem: UIElement): ElementManager {
        this.removeFromGroup(elem, GroupType.Select);
        return this;
    }

    /**
     * set the group to sync this elem with
     *
     * @param elem - the elem that should should be "ganged"
     * @param groupName - Name of the group that this elem should be "ganged"
     *   with.
     *
     * @return - The elem manager instance.
     */
    public addToHighlightGroup(elem: UIElement, groupName: string): ElementManager {
        addHoverCallback(elem);
        this.removeFromHighlightGroup(elem);

        this.addToFocusGroup(elem, groupName);
        this.addToSelectGroup(elem, groupName);

        let self = this;
        if (elem.onBrush) {
            let func = elem.onBrush;
            elem.onBrush = function (event: IEvent) {
                self._onBrushCallback(event);
                func(event);
            }
        } else {
            elem.onBrush = self._onBrushCallback;
        }

        if (elem.onCursorChanged) {
            let func = elem.onCursorChanged;
            elem.onCursorChanged = function (event: IEvent) {
                self._onCursorChangeCallback(event);
                func(event);
            }
        } else {
            elem.onCursorChanged = this._onCursorChangeCallback;
        }

        if (elem.onZoom) {
            let func = elem.onZoom;
            elem.onZoom = function (event: IEvent) {
                self._onZoomCallback(event);
                func(event);
            }
        } else {
            elem.onZoom = this._onZoomCallback;
        }

        let elems = this._groupInfo[GroupType.Highlight]._nameMap[groupName];
        if (elems && elems.length) {
            let oldElem = elems[0];
            if (oldElem.api.getOptions && elem.api && elem.api.zoom) {
                let options: IOptions = oldElem.api.getOptions();
                let zoomEvent: IEvent = copy(options);
                zoomEvent.event = EventType.Zoom;

                setTimeout(() => {
                    elem.api.zoom(zoomEvent);
                });
            }
        }
        this.addToGroup(elem, groupName, GroupType.Highlight);

        return this;
    }

    /**
     * remove the elem from the zoom group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    public removeFromHighlightGroup(elem: UIElement): ElementManager {
        this.removeFromFocusGroup(elem);
        this.removeFromSelectGroup(elem);
        this.removeFromGroup(elem, GroupType.Highlight);
        return this;
    }

    /**
     * set the group to select this elem with
     *
     * @param elem - the elem that should should be "ganged"
     * @param groupName - Name of the group that this elem should be "ganged"
     *   with.
     *
     * @return - The elem manager instance.
     */
    public addToRenderGroup(elem: UIElement, groupName: string): ElementManager {
        addRenderCallback(elem);
        this.removeFromRenderGroup(elem);
        this.addToGroup(elem, groupName, GroupType.Render);

        let self = this;
        if (elem.handleUpdate) {
            let func = elem.handleUpdate;
            elem.handleUpdate = function (caller: UIElement, options: IOptions) {
                self._onUpdateCallback(caller, options);
                func(caller, options);
            }
        } else {
            elem.handleUpdate = this._onUpdateCallback
        }

        return this;
    }

    /**
     * remove the elem from the zoom group it is in
     *
     * @param elem - the elem that should should be "unganged"
     *
     * @return - The elem manager instance.
     */
    public removeFromRenderGroup(elem: UIElement): ElementManager {
        this.removeFromGroup(elem, GroupType.Render);
        return this;
    }

    /** clear all the elements in this list */
    public clear() {
        this._elems.length = 0;
        this._groupInfo.length = 0;
        for (let i = 0; i < GroupType.None; ++i) {
            this._groupInfo.push(new GroupInfo());
        }
    }
}
