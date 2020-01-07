import { IColDef, IGrid, } from '../../interface/grid';
import {
    IContextMenuItem, IEvent, IOptions, EventType, UIElement, UIRenderer, UIType
} from '../../interface/ui-base';

import { getSelectionName } from '../utilities';
import { ColorManager } from '../color-manager';
import { showContextMenu } from '../context-menu';
import * as agGrid from 'ag-grid-community';

// from https://www.ag-grid.com/best-javascript-data-grid/#gsc.tab=0
export function percentCellRenderer(params: any) {
    var value = params.value;
    if (value === undefined || value === null) {
        value = 0;
    }

    var percentBar = document.createElement('div');
    percentBar.className = 'div-percent-bar';
    percentBar.style.width = value + '%';
    percentBar.style.height = '25px';
    percentBar.style.backgroundColor = '#B3E5FC';
    percentBar.innerHTML = value.toFixed(2) + '%';

    return percentBar;
}

export function computeMaxAndPercentage(rowData: any, columns: IColDef[]) {
    let columnMax: any = {};
    let total: any = {};
    for (let i = 0; i < columns.length; ++i) {
        let column = columns[i];
        if (!columnMax[column.field]) {
            columnMax[column.field] = 0;
        }
        if (!total[column.field]) {
            total[column.field] = 0;
        }
        for (let j = 0; j < rowData.length; ++j) {
            if (rowData[j][column.field]) {
                if (rowData[j][column.field].value) {
                    rowData[j][column.field] = rowData[j][column.field].value;
                }

                columnMax[column.field] = Math.max(columnMax[column.field], rowData[j][column.field]);
                total[column.field] += rowData[j][column.field];
            }
        }
    }

    for (let i = 0; i < columns.length; ++i) {
        let column = columns[i];
        for (let j = 0; j < rowData.length; ++j) {
            rowData[j][column.field] = {
                value: rowData[j][column.field],
                columnMax: columnMax[column.field],
                total: total[column.field]
            };
        }
    }
}

export function valueCellRenderer(params: any) {
    let value = params.value;
    value.value = value.value ? value.value : 0;

    let percentBar = document.createElement('div');
    let barWidth = value.columnMax ? (value.value / value.columnMax * 100) : 0;
    let percent = value.total ? (value.value / value.total * 100) : 0;
    percentBar.className = 'div-percent-bar';
    percentBar.style.height = '25px';
    percentBar.style.backgroundColor = '#B3E5FC';
    percentBar.style.width = barWidth + '%';

    if (params.colDef.showAsPercentage) {
        percentBar.innerHTML = percent.toFixed(2) + '%';
        percentBar.title = percent.toFixed(2) + '% (' + 'Value: ' + value.value + ')';
    } else {
        percentBar.innerHTML = value.value.toFixed(2);
        percentBar.title = 'Value: ' + value.value + ' (' + percent.toFixed(2) + '%)';
    }

    return percentBar;
}

export function valueComparator(valueA: any, valueB: any, nodeA: any, nodeB: any,
    isInverted: any) {
    return valueA.value - valueB.value;
}

export let menuItemShowAsPercentage = {
    title: 'Display Percentage', action: function (elem: any, data: any, index: any): void {
        let idx = data.colDef.contextMenuItems.indexOf(menuItemShowAsPercentage);
        data.colDef.contextMenuItems[idx] = menuItemShowAsTotal;
        data.colDef.showAsPercentage = true;
        data.api.refreshCells({ columns: [data.colDef], force: true });
    }
};

export let menuItemShowAsTotal = {
    title: 'Display Raw Values', action: function (elem: any, data: any, index: any): void {
        let idx = data.colDef.contextMenuItems.indexOf(menuItemShowAsTotal);
        data.colDef.contextMenuItems = [menuItemShowAsPercentage];
        data.colDef.showAsPercentage = false;
        data.api.refreshCells({ columns: [data.colDef], force: true });
    }
};

class AgGrid {
    private _element: IGrid;

    /** the parent renderer of this renderer */
    private _renderer: AgGridRenderer;

    /** the options for the render */
    private _options: any;

    /** the div for this grid */
    private _div: Element;

    private keyboardSelectionFocus: (params: any) => void;

    private onRowFocusDefaultCallback: (row: any) => void;

    private onRowUnfocusDefaultCallback: (row: any) => void;

    private onRowSelectedDefaultCallback: (row: any) => void;

    private _prevSelection: any;

    private _disableCallbacks: boolean;

    public api: {
        select: (event: IEvent) => void,

        /** @deprecated in favor of focus */
        hover: (event: IEvent) => void
    };

    /**
     * Append the div for this graph to the parent div. The div we create
     * will be filled when Render() is called
     *
     * @param parent - The div that will contain the div for this chart.
     *
     * @return - The chart instance
     */
    constructor(element: UIElement, renderer: AgGridRenderer, parent?: string, options: any = {}) {
        this._element = element as IGrid;
        this._renderer = renderer;
        this._options = options;
        this._disableCallbacks = false;

        if (parent) {
            this._div = document.querySelector(parent);
        }

        let self = this;
        let defaultCallback = function (row: any, eventType: EventType, callback: any) {
            if (self._disableCallbacks) {
                return;
            }

            let grid: IGrid = self._element as IGrid;
            let gridOptions: any = grid.gridOptions;
            if (callback) {
                let columns = gridOptions.columnApi.getAllColumns();
                if (columns && columns.length > 0) {
                    let key = columns[0].colDef.field;
                    let selection = row.node.data[key];
                    let event: IEvent = {
                        caller: grid,
                        selection: selection,
                        event: eventType,
                        data: { row: row }
                    }

                    callback(event);
                }
            }
        }

        this.onRowFocusDefaultCallback = function (row: any) {
            defaultCallback(row, EventType.HoverStart, self._element.onHover);
        }

        this.onRowUnfocusDefaultCallback = function (row: any) {
            defaultCallback(row, EventType.HoverEnd, self._element.onHover);
        }

        this.onRowSelectedDefaultCallback = function (row: any) {
            let eventType = row.node.isSelected() ?
                EventType.SelectStart : EventType.SelectEnd;

            defaultCallback(row, eventType, self._element.onClick);
        }

        this.api = {
            select: self.select,
            hover: self.select
        }

        this.keyboardSelectionFocus = function (params: any) {
            var previousCell = params.previousCellDef;
            var suggestedNextCell = params.nextCellDef;

            var KEY_UP = 38;
            var KEY_DOWN = 40;
            var KEY_LEFT = 37;
            var KEY_RIGHT = 39;

            let columns = (self._element.gridOptions as any).columnApi.getAllColumns();

            if (columns && columns.length > 0) {
                let selectionKey = self._element.gridOptions.selectionKey ?
                    self._element.gridOptions.selectionKey : columns[0].colDef.field;

                let helper = function (index: number) {
                    previousCell = params.previousCellDef;
                    // set selected cell on current cell + 1
                    self._element.gridOptions.api.forEachNode((node: any) => {
                        if (index === node.rowIndex) {
                            node.setSelected(true);
                        } else if (!params.event.shiftKey) {
                            self._renderer.focus(self._element, {
                                event: EventType.HoverEnd,
                                selection: getSelectionName(node.data[selectionKey])
                            });
                        }
                    });
                    return suggestedNextCell;
                }
                switch (params.key) {
                    case KEY_DOWN:
                        return helper(previousCell.rowIndex + 1);
                    case KEY_UP:
                        return helper(previousCell.rowIndex - 1);
                    case KEY_LEFT:
                    case KEY_RIGHT:
                        return suggestedNextCell;
                    default:
                        throw "this will never happen, navigation is always on of the 4 keys above";
                }
            }
        }
    }


    public setDiv(div: Element) {
        this._div = div;
    }

    protected select(event: IEvent) {
        let self = this;
        let selection = event.selection;

        // make typescript happy to hardcode some things
        let gridOptions: any = this._element.gridOptions;
        let columns = gridOptions.columnApi.getAllColumns();

        self._disableCallbacks = true;
        if (columns && columns.length > 0) {
            let selectionKey = gridOptions.selectionKey ? gridOptions.selectionKey :
                columns[0].colDef.field;

            let key = event.selectionKey ? event.selectionKey : selectionKey;
            if (event.event === EventType.SelectStart ||
                event.event === EventType.HoverStart) {
                this._prevSelection = event.selection;

                gridOptions.api.forEachNode(function (rowNode: any) {
                    if (getSelectionName(rowNode.data[key]) === getSelectionName(selection)) {
                        // select the node
                        rowNode.setSelected(true);
                        if (self._element.gridOptions.autoScrollToSelection) {
                            gridOptions.api.ensureNodeVisible(rowNode, 'middle');
                        }
                    }
                });
            } else if (event.event === EventType.SelectClear ||
                event.event === EventType.HoverClear) {
                gridOptions.api.deselectAll();
            } else {
                if (!event.selection) {
                    selection = self._prevSelection;
                }
                gridOptions.api.forEachNode(function (rowNode: any) {
                    if (getSelectionName(rowNode.data[key]) === getSelectionName(selection)) {
                        // deselect the node
                        rowNode.setSelected(false);
                        // clear the previous selection if it's what we just removed
                        if (event.selection === self._prevSelection) {
                            self._prevSelection = undefined;
                        }
                    }
                });
            }
        }
        self._disableCallbacks = false;
    }

    private setContextMenuItems(columnDefs: any[], contextMenuItems: IContextMenuItem[]) {
        if (columnDefs) {
            if (!contextMenuItems) {
                contextMenuItems = [];
            }
            for (let i = 0; i < columnDefs.length; ++i) {
                let column = columnDefs[i];
                column.onCellContextMenu = function (cell: any) {
                    showContextMenu(cell.event, cell,
                        cell.colDef.contextMenuItems ? contextMenuItems.concat(cell.colDef.contextMenuItems) : contextMenuItems);
                }
                if (column.children) {
                    this.setContextMenuItems(column.children, contextMenuItems);
                }
            }
        }
    }

    public invalidate(options: IOptions = {}) {
        let self = this;

        // make typescript happy to hardcode some things
        let gridOptions: any = this._element.gridOptions;
        gridOptions.animateRows = gridOptions.animateRows !== undefined ?
            gridOptions.animateRows : true;
        gridOptions.rowSelection = gridOptions.rowSelection !== undefined ?
            gridOptions.rowSelection : 'multiple';
        gridOptions.rowDeselection = gridOptions.rowDeselection !== undefined ?
            gridOptions.rowDeselection : true;
        gridOptions.suppressScrollOnNewData = gridOptions.suppressScrollOnNewData !== undefined ?
            gridOptions.suppressScrollOnNewData : true;
        gridOptions.suppressPropertyNamesCheck = gridOptions.suppressPropertyNamesCheck !== undefined ?
            gridOptions.suppressPropertyNamesCheck : true;
        gridOptions.defaultColDef = gridOptions.defaultColDef !== undefined ?
            gridOptions.defaultColDef : {};
        gridOptions.defaultColDef.sortable = gridOptions.defaultColDef.sortable !== undefined ?
            gridOptions.defaultColDef.sortable : true;
        gridOptions.defaultColDef.resizable = gridOptions.defaultColDef.resizable !== undefined ?
            gridOptions.defaultColDef.resizable : true;
        gridOptions.defaultColDef.filter = gridOptions.defaultColDef.filter !== undefined ?
            gridOptions.defaultColDef.filter : true;
        gridOptions.autoScrollToSelection = gridOptions.autoScrollToSelection !== undefined ?
            gridOptions.autoScrollToSelection : true

        let wrapCallback = function (userCallback: (row: any) => void,
            defaultCallback: (row: any) => void,
            eventType: EventType) {
            if (!userCallback) {
                return defaultCallback;
            } else {
                return function (row: any) {
                    if (self._disableCallbacks) {
                        return;
                    }
                    userCallback({
                        caller: self._element,
                        event: eventType,
                        data: { row: row.node.data }
                    });
                }
            }
        }
        gridOptions.onCellMouseOver = wrapCallback(gridOptions.onCellMouseOver,
            this.onRowFocusDefaultCallback, EventType.HoverStart);
        gridOptions.cellMouseOut = wrapCallback(gridOptions.onCellMouseOver,
            this.onRowUnfocusDefaultCallback, EventType.HoverEnd);
        gridOptions.onRowClicked = wrapCallback(gridOptions.onRowClicked,
            undefined, undefined);
        gridOptions.onRowDoubleClicked = wrapCallback(gridOptions.onRowDoubleClicked,
            undefined, undefined);
        if (gridOptions.onClick) {
            gridOptions.onRowClicked = wrapCallback(gridOptions.onClick,
                undefined, undefined);
        }
        if (gridOptions.onDoubleClick) {
            gridOptions.onRowDoubleClicked = wrapCallback(gridOptions.onDoubleClick,
                undefined, undefined);
        }

        if (!gridOptions.onRowSelected) {
            gridOptions.onRowSelected = this.onRowSelectedDefaultCallback;
        } else {
            if (!gridOptions.userOnRowSelected) {
                gridOptions.userOnRowSelected = gridOptions.onRowSelected;
            }

            gridOptions.onRowSelected = function (row: any) {
                if (self._disableCallbacks) {
                    return;
                }
                // TODO handle multiple selection clear correctly
                gridOptions.userOnRowSelected({
                    caller: self._element,
                    data: {
                        row: row.node.data,
                        isSelected: row.node.selected
                    },
                    event: row.node.selected ? EventType.SelectStart : EventType.SelectEnd
                });
            }
        }

        let hasGrouping = false;
        if (gridOptions.rowData && !gridOptions.getNodeChildDetails) {
            for (let i = 0; i < gridOptions.rowData.length; ++i) {
                let row = gridOptions.rowData[i];
                if (row.children && row.children.length > 0) {
                    hasGrouping = true;
                    break;
                }
            }
        }
        if (gridOptions.columnDefs) {
            let valueCellRendererColumns = [];
            for (let i = 0; i < gridOptions.columnDefs.length; ++i) {
                let column = gridOptions.columnDefs[i];

                if (column.canShowPercentage || column.showAsPercentage || column.showAsBar) {
                    valueCellRendererColumns.push(column);
                    column.cellRenderer = valueCellRenderer;
                    column.comparator = valueComparator;
                    if (!column.contextMenuItems) {
                        column.contextMenuItems = [];
                    }
                    let idx = 0;
                    if (column.showAsPercentage) {
                        idx = column.contextMenuItems.indexOf(menuItemShowAsPercentage);
                        if (idx !== -1) {
                            column.contextMenuItems[i] = menuItemShowAsTotal;
                        } else {
                            idx = column.contextMenuItems.indexOf(menuItemShowAsTotal);
                            if (idx === -1) {
                                column.contextMenuItems.push(menuItemShowAsTotal);
                            }
                        }
                    } else if (column.canShowPercentage) {
                        idx = column.contextMenuItems.indexOf(menuItemShowAsTotal);
                        if (idx !== -1) {
                            column.contextMenuItems[i] = menuItemShowAsPercentage;
                        } else {
                            idx = column.contextMenuItems.indexOf(menuItemShowAsPercentage);
                            if (idx === -1) {
                                column.contextMenuItems.push(menuItemShowAsPercentage);
                            }
                        }
                    }
                }
                if (column.onCellClicked) {
                    let onClick = column.onCellClicked;
                    column.onCellClicked = function (params: any) {
                        onClick({
                            caller: self._element,
                            data: { cell: params }
                        });
                    }
                }
                if (column.onCellDoubleClicked) {
                    let onDoubleClick = column.onCellDoubleClicked;
                    column.onCellDoubleClicked = function (params: any) {
                        onDoubleClick({
                            caller: self._element,
                            data: { cell: params }
                        });
                    }
                }
            }
            if (hasGrouping && gridOptions.columnDefs.length > 0) {
                let groupCol = gridOptions.columnDefs[0];
                groupCol.cellRenderer = 'agGroupCellRenderer';
                groupCol.cellRendererParams = {
                    innerRenderer: (params: any) => { return params.data[groupCol.field] },
                    suppressCount: true
                };
                gridOptions.getNodeChildDetails = (rowItem: any) => {
                    if (rowItem.children) {
                        return {
                            group: true,
                            expanded: rowItem.expanded,
                            children: rowItem.children,
                            key: rowItem[groupCol.field]
                        };
                    } else {
                        return null;
                    }
                }
            }
            if (valueCellRendererColumns.length > 0) {
                computeMaxAndPercentage(gridOptions.rowData, valueCellRendererColumns);
            }
        }
        if (gridOptions.enableSingleKeyboardSelection) {
            gridOptions.navigateToNextCell = this.keyboardSelectionFocus;
        }

        let noContextMenu = gridOptions.contextMenuItems == undefined;
        if (gridOptions.columnDefs) {
            for (let i = 0; noContextMenu && i < gridOptions.columnDefs.length; ++i) {
                let column = gridOptions.columnDefs[i];
                if (column.contextMenuItems) {
                    noContextMenu = false;
                }
            }
        }
        if (!noContextMenu) {
            this.setContextMenuItems(gridOptions.columnDefs, gridOptions.contextMenuItems);
        }

        while (this._div.firstChild) {
            this._div.removeChild(this._div.firstChild);
        }
        if (!this._element.api) {
            this._element.api = { select: undefined, hover: undefined }
        }
        this._element.api.select = function (event: IEvent) {
            self.select(event);
        }
        this._element.api.hover = this._element.api.select;
        new agGrid.Grid(this._div as HTMLElement, this._element.gridOptions as any); //create a new grid
    }
}

export class AgGridRenderer implements UIRenderer {
    /** The parent id of the div */
    private _parent: string;

    /** the options for the render */
    private _options: any;

    /** the colors for the render */
    private _colorMgr: any;

    // from UIRenderer
    public onRender: (elem: UIElement, options: IOptions) => void;

    /** maps to render elements if multiple renders are used
     *  through this interface */
    private _rendererMap: WeakMap<UIElement, AgGrid>;

    constructor(parent?: string, options = {}, colorMgr: ColorManager = new ColorManager()) {
        this._parent = parent;
        this._rendererMap = new WeakMap<UIElement, AgGrid>();
        this._options = options;
        this._colorMgr = colorMgr;
    }

    public getColorManager() {
        return this._colorMgr;
    }

    public setOnRenderCallback(callback: (elem: UIElement, options: IOptions) => void) {
        this.onRender = callback;
    }

    /** update any options */
    public setOptions(options: any) {
        for (let key in options) {
            this._options[key] = options[key];
        }
    }

    /** @deprecated ('Deprecated since 1.14.0 in favor of focus.  Will be removed in 2.x') */
    public hover(element: UIElement, event: IEvent) {
        this.focus(element, event);
    }

    public focus(element: UIElement, event: IEvent) {
        console.debug('currently no focus events can be created for the grid')
    }

    public select(element: UIElement, event: IEvent) {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).api.select(event);
        }
    }

    public setDiv(element: UIElement, div: Element) {
        if (!this._rendererMap.has(element)) {
            if (element.type === UIType.Grid) {
                this._rendererMap.set(element, new AgGrid(element, this));
            }
        }
        if (this._rendererMap.has(element)) {
            this._rendererMap.get(element).setDiv(div);
        }
    }

    /**
     * Render the given element
     *
     * @param the element to render
     */
    public render(element: UIElement, options: IOptions = {}) {
        let self = this;
        element.renderer = this;

        if (!this._rendererMap.has(element)) {
            if (element.type === UIType.Grid) {
                this._rendererMap.set(element, new AgGrid(element, this, this._parent));
            }
        }
        if (this._rendererMap.has(element)) {
            (this._rendererMap.get(element) as AgGrid).invalidate(options);
            if (this.onRender) {
                this.onRender(element, options);
            }
        }
    }

    public invalidate = this.render;

    /**
     * free the resources used by the renderer for this element
     */
    public destroy(element: UIElement) {
        this._rendererMap.delete(element);
    }

    public getOptions() { return this._options; }
}
