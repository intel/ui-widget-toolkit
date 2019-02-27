import { IContextMenuItem, IEvent, UIElement, UIType } from './ui-base';

// based off of ag-grid structures
export interface AbstractColDef {
    /** The name to render in the column header */
    headerName: string;
    /** CSS class for the header */
    headerClass?: string | string[] | ((params: any) => string | string[]);
}
// based off of ag-grid structures
export interface IColGroupDef extends AbstractColDef {
    /** Columns in this group */
    children: (IColDef | IColGroupDef)[];
}
// based off of ag-grid structures
export interface IColDef extends AbstractColDef {
    /** The field of the row to get the cells data from */
    field?: string;
    /** If sorting by default, set it here. Set to 'asc' or 'desc' */
    sort?: string;
    /** Whether this column is pinned or not. */
    pinned?: boolean | string;
    /** The field where we get the tooltip on the object */
    tooltipField?: string;
    /** Tooltip for the column header */
    headerTooltip?: string;
    /** Initial width, in pixels, of the cell */
    width?: number;
    /** Min width, in pixels, of the cell */
    minWidth?: number;
    /** Max width, in pixels, of the cell */
    maxWidth?: number;
    /** Class to use for the cell. Can be string, array of strings, or function. */
    cellClass?: string | string[] | ((cellClassParams: any) => string | string[]);
    /** An object of css values. Or a function returning an object of css values. */
    cellStyle?: {} | ((params: any) => {});
    /** renderer used to render the cell information */
    cellRenderer?: (params: any) => (HTMLElement | string);
    /** called when a cell is clicked */
    onCellClicked?: (event: IEvent) => void;
    /** called when a cell is double clicked */
    onCellDoubleClicked?: (event: IEvent) => void;
    /** used to translate the data in the data set into the value shown to the user */
    valueGetter?: (rowData: any) => void;
    /** the context menu definitions for when the user right clicks */
    contextMenuItems?: IContextMenuItem[];
    /** whether the value is numerical and can be shown as a percentage */
    canShowPercentage?: boolean;
    /** the value is numerical and should be shown as a percentage by default */
    showAsPercentage?: boolean;
}

export interface IGridOptions {
    rowData?: any[];
    columnDefs?: (IColDef | IColGroupDef)[];
    gridClass?: string;
    defaultColDef?: {
        sortable?: boolean;
    };
    enableSingleKeyboardSelection?: boolean;
    animateRows?: boolean;
    api?: any;
    /** called when a row is selected */
    onRowSelected?: (event: IEvent) => void;
    /** called when a row is clicked */
    onRowClicked?: (event: IEvent) => void;
    /** called when a row is double clicked */
    onRowDoubleClicked?: (event: IEvent) => void;
    /** used when there is a period in field data to ignore the dot */
    suppressFieldDotNotation?: boolean,
    /** the context menu definitions for when the user right clicks */
    contextMenuItems?: IContextMenuItem[];
    /** called after the grid is rendered */
    onGridReady?: (event: any) => void;
    selectionKey?: any;
}

export interface IGrid extends UIElement {
    type: UIType;
    gridOptions: IGridOptions;
}

export class Column implements IColDef {
    public headerName: string;
    public field: string;

    constructor(headerName: string, field: string) {
        this.headerName = headerName;
        if (!field) {
            this.field = headerName;
        } else {
            this.field = field;
        }
    }
}
