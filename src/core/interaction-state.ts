import { getSelectionName } from './utilities';
import {
    IEvent, EventType
} from '../interface/ui-base';

import * as d3 from 'd3';

export class InteractionState {
    protected _doBlink: boolean;
    protected _highlightTimer: any;
    protected _currFocus: any[];
    protected _currSelection: any[];
    protected _focus: (d: any) => void;
    protected _unfocus: (d: any) => void;
    protected _select: (d: any) => void;
    protected _unselect: (d: any) => void

    constructor(focus: (d: any) => void,
        unfocus: (d: any) => void,
        doBlink = false,
        select: (d: any) => void = undefined,
        unselect: (d: any) => void = undefined) {

        this._currFocus = [];
        this._currSelection = [];
        this._focus = focus;
        this._unfocus = unfocus;
        this._select = select;
        this._unselect = unselect;
        this._doBlink = doBlink;
    }
    static getFocusColor(input: string) {
        let color = d3.color(input);
        let hoverColor = d3.color(color).darker(2).toString();
        if (hoverColor === color.toString()) {
            color.opacity = color.opacity * .6;
            hoverColor = color.toString();
        }
        return hoverColor;
    }

    /** add a selection from all of the elements */
    protected _addFocusHelper(selection: any) {
        let self = this;

        this._focus(selection);

        if (self._doBlink) {
            clearTimeout(this._highlightTimer);
            this._highlightTimer = setTimeout(function () {
                self._unfocusHelper(selection, true);
            }, 500);
        }
    }

    /** remove a selection from all of the elements */
    protected _unfocusHelper(selection: any, isFlashing: boolean = false) {
        let self = this;

        this._unfocus(selection);

        if (this._doBlink) {
            if (isFlashing) {
                clearTimeout(this._highlightTimer);
                this._highlightTimer = setTimeout(function () {
                    self._addFocusHelper(selection);
                }, 500);
            }
        }
    }

    /** add a selection from all of the elements */
    protected _addSelectionHelper(selection: any) {
        let self = this;

        this._select(selection);

        if (self._doBlink) {
            clearTimeout(this._highlightTimer);
            this._highlightTimer = setTimeout(function () {
                self._removeSelectionHelper(selection, true);
            }, 500);
        }
    }

    /** remove a selection from all of the elements */
    protected _removeSelectionHelper(selection: any, isFlashing: boolean = false) {
        let self = this;

        this._unselect(selection);

        if (this._doBlink) {
            if (isFlashing) {
                clearTimeout(this._highlightTimer);
                this._highlightTimer = setTimeout(function () {
                    self._addSelectionHelper(selection);
                }, 500);
            }
        }
    }

    public focus(event: IEvent) {
        if (!isNaN(Number(event.selection))) {
            if (event.selection === undefined) {
                console.debug('Chart unable to fire focus event with undefined selection');
            } else if (event.selection.length === 0) {
                console.debug('Chart unable to fire focus event with an empty string selection');
            } else {
                console.debug('Chart unable to fire focus event using a number ' +
                    'as the selection class due to CSS limitations');
            }
            return;
        }
        let selection = getSelectionName(event.selection);
        let selectionIdx = this._currFocus.indexOf(selection);
        switch (event.event) {
            case EventType.SelectAdd: // here for legacy reasons
            case EventType.HoverStart:
            case EventType.FocusStart:
                if (selectionIdx === -1) {
                    this._currFocus.push(selection);
                    this._addFocusHelper(selection);
                }
                break;
            case EventType.SelectRemove: // here for legacy reasons
            case EventType.HoverEnd:
            case EventType.FocusEnd:
                if (selectionIdx !== -1) {
                    clearTimeout(this._highlightTimer);
                    this._currFocus.splice(selectionIdx, 1);
                    this._unfocusHelper(selection);
                }
                break;
            case EventType.SelectClear: // here for legacy reasons
            case EventType.HoverClear:
            case EventType.FocusClear:
                clearTimeout(this._highlightTimer);
                for (let i = 0; i < this._currFocus.length; ++i) {
                    this._unfocusHelper(this._currFocus[i]);
                }
                this._currFocus = [];
                break;
        }
    }

    public select(event: IEvent) {
        if (!isNaN(Number(event.selection))) {
            if (event.selection === undefined) {
                console.debug('Chart unable to fire focus event with undefined selection');
            } else if (event.selection.length === 0) {
                console.debug('Chart unable to fire focus event with an empty string selection');
            } else {
                console.debug('Chart unable to fire focus event using a number ' +
                    'as the selection class due to CSS limitations');
            }
            return;
        }
        let selection = getSelectionName(event.selection);
        let selectionIdx = this._currSelection.indexOf(selection);
        switch (event.event) {
            case EventType.SelectAdd:
                if (selectionIdx === -1) {
                    this._currSelection.push(selection);
                    this._addSelectionHelper(selection);
                }
                break;
            case EventType.SelectRemove:
                if (selectionIdx !== -1) {
                    clearTimeout(this._highlightTimer);
                    this._currSelection.splice(selectionIdx, 1);
                    this._removeSelectionHelper(selection);
                }
                break;
            case EventType.SelectClear:
                clearTimeout(this._highlightTimer);
                for (let i = 0; i < this._currSelection.length; ++i) {
                    this._removeSelectionHelper(this._currSelection[i]);
                }
                this._currSelection = [];
                break;
        }
    }

    /** used to restore any selections on a redraw */
    public onRedraw() {
        this._currFocus.forEach((selection) => {
            // we have this code here because normally we don't
            // allow reselecting the same event over and over for
            // performance reasons
            this._addFocusHelper(selection);
        });
        this._currSelection.forEach((selection) => {
            // we have this code here because normally we don't
            // allow reselecting the same event over and over for
            // performance reasons
            this._addSelectionHelper(selection);
        });
    }
}

/** @deprecated to be renamed to StateHelper in 2.x */
export let SelectionHelper = InteractionState;
