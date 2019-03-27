import { copy, removeFromList } from './utilities';
import {
    UIElement, UIElementManager, UIRenderer, IEvent, IOptions,
    ITooltipData, EventType
} from '../interface/ui-base';

const enum GroupType {
    Tooltip,
    Highlight,
    Render,
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

    if (!elem.api.hover) {
        elem.api.hover = function (event: IEvent): void {
            if (elem.renderer && elem.renderer.hover) {
                return elem.renderer.hover(elem, event);
            }
        }
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
    protected _zoomCallback: (group: UIElement[], event: IEvent) => void;
    protected _tooltipCallback: (group: UIElement[], event: IEvent) => ITooltipData;
    protected _cursorChangeCallback: (group: UIElement[], event: IEvent) => void;
    protected _brushCallback: (group: UIElement[], event: IEvent) => void;

    protected _onTooltipCallback: (event: IEvent) => ITooltipData[];
    protected _onZoomCallback: (event: IEvent) => void;
    protected _onHoverCallback: (event: IEvent) => void;
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

            let elems = self._groupInfo[GroupType.Highlight]._objectMap.get(event.caller);
            if (elems) {
                if (self._hoverCallback) {
                    self._hoverCallback(elems, event);
                } else {
                    for (let i = 0; i < elems.length; ++i) {
                        let elem = elems[i];
                        if (elem.api && elem.api.hover) {
                            elem.api.hover(event);
                        }
                    }
                }
            }
        }
        this._onZoomCallback = function (event: IEvent): void {

            let elems = self._groupInfo[GroupType.Highlight]._objectMap.get(event.caller);
            if (elems) {
                if (self._zoomCallback) {
                    self._zoomCallback(elems, event);
                } else {
                    for (let i = 0; i < elems.length; ++i) {
                        let elem = elems[i];
                        if (elem.api && elem.api.zoom) {
                            elem.api.zoom(event);
                        }
                    }
                }
            }
        }
        this._onTooltipCallback = function (event: IEvent): ITooltipData[] {

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
        this._onCursorChangeCallback = function (event: IEvent): void {

            let elems = self._groupInfo[GroupType.Highlight]._objectMap.get(event.caller);
            if (elems) {
                if (self._cursorChangeCallback) {
                    self._cursorChangeCallback(elems, event);
                } else {
                    for (let i = 0; i < elems.length; ++i) {
                        let elem = elems[i];
                        if (elem.api && elem.api.cursorChange) {
                            elem.api.cursorChange(event);
                        }
                    }
                }
            }
        }
        this._onBrushCallback = function (event: IEvent): void {

            let elems = self._groupInfo[GroupType.Highlight]._objectMap.get(event.caller);
            if (elems) {
                if (self._brushCallback) {
                    self._brushCallback(elems, event);
                } else {
                    for (let i = 0; i < elems.length; ++i) {
                        let elem = elems[i];
                        if (elem.api && elem.api.brush) {
                            elem.api.brush(event);
                        }
                    }
                }
            }
        }
        this._onUpdateCallback = function (caller: UIElement,
            options: IOptions): void {

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
     * user callback called when a hover event happens
     *
     * @param the function to be called
     */
    public setHoverCallback(callback: (group: UIElement[], event: IEvent) => void): ElementManager {
        this._hoverCallback = callback;
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
        if (!elem.onTooltip) {
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
     * set the group to select this elem with
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

        if (!elem.onBrush) {
            elem.onBrush = this._onBrushCallback;
        }
        if (!elem.onHover) {
            elem.onHover = this._onHoverCallback;
        }
        if (!elem.onCursorChanged) {
            elem.onCursorChanged = this._onCursorChangeCallback;
        }
        if (!elem.onZoom) {
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
        if (!elem.handleUpdate) {
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
