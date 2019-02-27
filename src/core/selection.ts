import { getSelectionName } from './utilities';
import {
    IEvent, EventType
} from '../interface/ui-base';

import * as d3 from 'd3';

export class SelectionHelper {
    protected _doBlink: boolean;
    protected _highlightTimer: any;
    protected _currSelections: any[];
    protected _addSelection: (d: any) => void;
    protected _removeSelection: (d: any) => void

    constructor(onAdd: (d: any) => void, onRemove: (d: any) => void,
        doBlink = false) {
        this._currSelections = [];
        this._addSelection = onAdd;
        this._removeSelection = onRemove;
        this._doBlink = doBlink;
    }
    static getHoverColor(input: string) {
        let color = d3.color(input);
        let hoverColor = d3.color(color).darker(2).toString();
        if (hoverColor === color.toString()) {
            color.opacity = color.opacity * .6;
            hoverColor = color.toString();
        }
        return hoverColor;
    }

    /** add a selection from all of the elements */
    public _addSelectionHelper(selection: any) {
        let self = this;

        this._addSelection(selection);

        if (self._doBlink) {
            clearTimeout(this._highlightTimer);
            this._highlightTimer = setTimeout(function () {
                self._removeSelectionHelper(selection, true);
            }, 500);
        }
    }

    /** remove a selection from all of the elements */
    public _removeSelectionHelper(selection: any, isFlashing: boolean = false) {
        let self = this;

        this._removeSelection(selection);

        if (this._doBlink) {
            if (isFlashing) {
                clearTimeout(this._highlightTimer);
                this._highlightTimer = setTimeout(function () {
                    self._addSelectionHelper(selection);
                }, 500);
            }
        }
    }

    public onSelect(event: IEvent) {
        if (!isNaN(Number(event.selection))) {
            console.log('Warnging - chart unable to fire hover event using a number ' +
                'as the selection class due to CSS limitations');
            return;
        }
        let selection = getSelectionName(event.selection);
        let selectionIdx = this._currSelections.indexOf(selection);
        switch (event.event) {
            case EventType.HoverStart:
                if (selectionIdx === -1) {
                    this._currSelections.push(selection);
                    this._addSelectionHelper(selection);
                }
                break;
            case EventType.HoverEnd:
                if (selectionIdx !== -1) {
                    clearTimeout(this._highlightTimer);
                    this._currSelections.splice(selectionIdx, 1);
                    this._removeSelectionHelper(selection);
                }
                break;
            case EventType.HoverClear:
                clearTimeout(this._highlightTimer);
                for (let i = 0; i < this._currSelections.length; ++i) {
                    this._removeSelectionHelper(this._currSelections[i]);
                }
                this._currSelections = [];
                break;
        }
    }

    /** used to restore any selections on a redraw */
    public onRedraw() {
        for (let i = 0; i < this._currSelections.length; ++i) {
            // we have this code here because normally we don't
            // allow reselecting the same event over and over for
            // performance reasons
            let selection = this._currSelections[i];
            this._addSelectionHelper(selection);
        }
    }
}
