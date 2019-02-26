import { ITooltipData } from '../interface/ui-base';
import * as d3 from 'd3';

/**
 * Defines the callback for tooltip enter, leave and move functions.
 *
 * @param d - Usually the data associated with the item the mouse is over.
 *
 * @return - Return false on failure. If the tooltip enter callback returns
 * false, the tooltip will not be displayed. The return value of other
 * callbacks is ignored.
 */
export interface ITooltipCallback {
    (d: any): boolean;
}

/**
 * Defines a tooltip placement function. This interface is used internally
 * to implement various tooltip placement algorithms.
 */
export interface ITooltipPlacementFunc {
    (event: { x: number, y: number, clientX: number, clientY: number }): void;
}

/**
 * The tooltip class provides a mechanism to display a tooltip, usually in
 * response to the mouse entering some region.
 */
export class BaseTooltip {

    /** div containing the tooltip to be displayed */
    protected _tooltipDiv: HTMLDivElement;

    /** Function to be called when the mouse enters the target region */
    protected _enterfunc: ITooltipCallback;

    /** Function to be called when the mouse leaves the target region */
    protected _leavefunc: ITooltipCallback;

    /** Function to be called when the mouse moves in the target region */
    protected _movefunc: ITooltipCallback;

    /** Width of the tooltip div */
    protected _tooltipWidth: number;

    /** Height of the tooltip div */
    protected _tooltipHeight: number;

    /** Tooltip background color */
    protected _tooltipBackgroundColor: string;

    /** Tooltip font color */
    protected _tooltipFontColor: string;

    /** Tooltip font type */
    protected _tooltipFontType: string;

    /** Tooltip font size */
    protected _tooltipFontSize: string;

    /** Width of the browser window */
    protected _windowWidth: number;

    /** Height of the browser window */
    protected _windowHeight: number;

    /** ID for the timer used to delay appearance of the tooltip */
    protected _timerId: number;

    /** Additional pixels to offset the tooltip from the mouse */
    protected _tooltipOffset: number;

    /** Debugging aid - set to a unique value for each tooltip instance */
    protected _counter: number;

    /** Set if the caller has decided to disable the tooltip by calling Enabled() */
    protected _disabled: boolean;

    /** Value to set 'display' attribute to to to hide tooltip */
    protected _hide: string;  //

    /** Name for analytics events for this tooltip */
    protected _analyticsName: string;

    /** Seconds a tooltip should be visible. 0 Specifies that there is no timeout. */
    protected _visibilityTimeoutSecs: number;

    /** Time ID for the visibility timeout */
    protected _visibilityTimerId: number;

    /** Whether the leave function should be called when the tooltip is hidden. */
    protected _visibilityTimeoutCallLeaveFunction: boolean;

    /** Delay in milliseconds for showing the tooltip when the mouse enters the target region */
    protected _lastShowTs: number;

    /** Delay in milliseconds for showing the tooltip when the mouse enters the target region */
    protected _delayMS: number;

    /** Function to place the tooltip */
    protected _tooltipPlacementFunc: ITooltipPlacementFunc;

    /** Default delay for showing a tooltip (.5 second) */
    protected static _defaultDelayMS: number = 500;   // Milliseconds to delay displaying tooltip (1 sec)

    /** Counter used to generate a unique value for each tooltip */
    protected static _counter: number = 0;

    /** Flag whether we should always recalcuate the tooltip width */
    protected _alwaysRecalcWidth: boolean;

    /**
     * Flag whether the tooltip should be shown to the left of the mouse.
     *
     * Only used by _PlaceTooltipLeftRight
     */
    protected _tooltipLeftOfMouse: boolean;

    /**
     * Mouse enter function applied to the target. The mouse enter function
     * handles calling an enter function, if one was specified, and delaying
     * the display of the tooltip
     */
    public onMouseEnter: (d: any) => void;

    /**
     * Mouse leave function applied to the target. The mouse leave function
     * cancels any pending timers, calls the exit function, if one was
     * specified, and hides the tooltip.
     */
    public onMouseLeave: (d: any) => void;

    /**
     * Mouse move function applied to the target. The mouse move function
     * calls the move function, if one was specifies, and then moves the
     * tooltip div to keep in near the mouse cursor.
     */
    public onMouseMove: (d: any, pos?: any) => void;

    /**
     * Create at tooltip instance.
     *
     * @params tooltipDivId - The ID for the div that is to be filled with the
     *   tooltip information.
     * @param tooltipStyle -  css class that describes tooltip format.  Defaults
     *   to tooltip-t.
     */
    constructor(tooltipDivId: string, tooltipStyle: string = 'tooltip-t') {

        if (!document.getElementById(tooltipDivId)) {
            this._tooltipDiv = document.createElement('div');
            this._tooltipDiv.style.overflow = 'auto';
            this._tooltipDiv.id = tooltipDivId;
            document.querySelector('body')
                .appendChild(this._tooltipDiv);
        } else {
            // Make sure the div ID has the leading '#' we need for selecting
            // a DOM object by id.
            let id = tooltipDivId;
            if ('#' !== tooltipDivId.charAt(0)) {
                id = '#' + tooltipDivId;
            }

            this._tooltipDiv = document.querySelector(id) as HTMLDivElement;
        }

        this._analyticsName = '';
        this._disabled = false;
        this._visibilityTimeoutSecs = 0;
        this._visibilityTimeoutCallLeaveFunction = true;
        this._delayMS = BaseTooltip._defaultDelayMS;
        this._tooltipPlacementFunc = this.defaultTooltipPlacement;
        this._alwaysRecalcWidth = false;
        this._tooltipLeftOfMouse = true;
        this._lastShowTs = Date.now();

        // Debugging aid
        this._counter = BaseTooltip._counter;
        BaseTooltip._counter++;

        this._hide = 'none';    // Value display property will be set to

        // Use the default offsets
        this._tooltipOffset = 0;

        // Note that we'll need to get the tooltip size on the first move
        this._tooltipHeight = 0;
        this._tooltipWidth = 0;
        this._windowWidth = 0;
        this._windowHeight = 0;

        // Ensure that the div has the tooltip-t class
        this._tooltipDiv.classList.add(tooltipStyle);

        // Default tooltip textures (null value results in css to be used)
        this._tooltipBackgroundColor = null;
        this._tooltipFontColor = null;
        this._tooltipFontType = null;
        this._tooltipFontSize = null;

        // Put 'this' into a variable that will be visible in the Mouse
        // callbacks which will have the entity being entered as their 'this'
        let self: BaseTooltip = this;

        // Since this is a callback, 'this' will be the selected object that
        // the mouse has just entered
        this.onMouseEnter = function (d: any): void {
            // If this tooltip is disabled, we're done
            if (self._disabled) {
                return;
            }

            // If there's an _enterfunc, call it. If it returns
            // false, there's been a failure
            if (undefined !== self._enterfunc) {
                if (!self._enterfunc.call(this, d)) {
                    self.onMouseLeave.call(this, d);
                    return;
                }

                // Delay making the tooltip visible
                self.displayTooltip(self._delayMS);
            }

            // Note that we'll need to get the tooltip size on the first move
            self._tooltipHeight = 0;
            self._tooltipWidth = 0;
            self._windowWidth = 0;
            self._windowHeight = 0;
        };   // onMouseEnter

        // Since this is a callback, 'this' will be the selected object that
        // the mouse has just entered
        this.onMouseLeave = function (d: any): void {

            // Cancel the timer, if it hasn't gone off yet
            if (undefined != self._timerId) {
                window.clearTimeout(self._timerId);
            }
            self._timerId = undefined;

            if (undefined != self._visibilityTimerId) {
                window.clearTimeout(self._visibilityTimerId);
            }

            // If we've got an exit function, call it, unless we're hiding the
            // tooltip after a visibility timeout and we've been told not to.
            // This is really ugly. We're depending on the fact that the
            // timeout is calling us with a null event.
            if (undefined !== self._leavefunc) {
                let callLeaveFunction: boolean = true;
                if (null === d) {
                    callLeaveFunction = self._visibilityTimeoutCallLeaveFunction;
                }

                if (callLeaveFunction) {
                    self._leavefunc.call(this, d);
                }
            }

            // Hide the tooltip div
            self.hideTooltip();
        };   // MouseLeave

        // Since this is a callback, 'this' will be the selected object that
        // the mouse has just entered
        this.onMouseMove = function (d: any, pos: any): void {

            // If this tooltip is disabled, we're done
            if (self._disabled) {
                return;
            }

            // If we've got a move function, call it
            if (undefined !== self._movefunc) {
                self._movefunc.call(this, d);
            }

            // If we haven't yet, get the width & height of the tooltip, including
            // the margins
            if (self._alwaysRecalcWidth || (0 === self._tooltipWidth)) {
                self._tooltipWidth = self._tooltipDiv.offsetWidth;

                let outerWidth = self._tooltipDiv.offsetHeight;

                let top = parseInt(self._tooltipDiv.style.marginTop);
                let bottom = parseInt(self._tooltipDiv.style.marginBottom);
                if (top) {
                    outerWidth += top;
                }
                if (bottom) {
                    outerWidth += bottom;
                }
                self._tooltipHeight = outerWidth;
            }

            // If we haven't yet, get the width & height of the window
            if (0 == self._windowWidth) {
                // Get the window's inner width, which doesn't include scrollbars or
                // or the like. Allow a little fudge, just to be safe
                self._windowWidth = window.innerWidth;

                // And the window's inner height
                self._windowHeight = window.innerHeight;
            }

            if (!pos || !pos.clientY) {
                pos = d3.event.clientY ? d3.event : d3.event.sourceEvent;
            }
            self._tooltipPlacementFunc(pos);
        };   // MouseMove

    }   // constructor

    protected adjustVerticalPosition(top: number, bottom: number) {
        // Now set the top edge
        top -= this._tooltipHeight / 2;

        // Make sure we're not off the top of the window
        if (top < window.pageYOffset) {
            top = window.pageYOffset;
        }

        // Make sure we're not off the bottom of the window
        bottom = top + this._tooltipHeight;
        if (bottom > (this._windowHeight + window.pageYOffset)) {
            top -= bottom - (this._windowHeight + window.pageYOffset);
        }

        if (top < 0) {
            top = 0;
            // THIS CAUSES TOOLTIP TO NOT RESIZE RIGHT IF IT GETS TOO BIG...
            // NEED TO UPDATE LOGIC THAT GETS TOOLTIP HEIGHT AND THEN COMMENT
            // THIS BACK IN
            // height of tooltip minux 30 for scrollbar
            // if (this._tooltipHeight > this._windowHeight) {
            //     this._tooltipDiv.style.height =
            //         Math.min(this._tooltipHeight, this._windowHeight) - 30 + 'px';
            // } else {
            //     this._tooltipDiv.style.height = 'auto';
            // }
        }
        // Set the tooltip div position.
        this._tooltipDiv.style.top = top + 'px';
    }
    /**
     * Tooltip placement routine to place the tooltip to the left of
     * the mouse. Designed to be used for the chart value tooltip.
     */
    protected placeTooltipLeft(event: any) {
        // Start by trying to put the tooltip above or below the pointer
        let top: number, bottom: number, right: number, left: number;

        // Cast the event the mouse event we know that it is. After all,
        // this is the MouseMove callback!
        top = window.pageYOffset + event.clientY;
        left = window.pageXOffset + event.clientX;

        // Put the tooltip in the left half of the window. The 10 is
        // an offset to allow some space between the tooltip and the
        // pointer
        left -= this._tooltipWidth + 10;

        // Make sure the tooltip isn't off the left edge
        if (left < window.pageXOffset) {
            left = window.pageXOffset;
        }
        this._tooltipDiv.style.left = left + 'px';

        this.adjustVerticalPosition(top, bottom);
    }

    /**
     * Tooltip placement routine to place the tooltip to the right or left of
     * the mouse. Designed to be used for the chart value tooltip.
     *
     * The placement (left or right of the mouse) is changed if the mouse is
     * in the left or right third of the window. Placement is left alone in
     * the middle third.
     */
    protected placeTooltipLeftRight(event: any) {
        // Start by trying to put the tooltip above or below the pointer
        let top: number, bottom: number, right: number, left: number;

        // Cast the event the mouse event we know that it is. After all,
        // this is the MouseMove callback!
        top = window.pageYOffset + event.clientY;
        left = window.pageXOffset + event.clientX;

        // If the mouse is in the left third of the screen, show the tooltip
        // to the right of the mouse. If the mouse is in the right third of
        // the screen, show the tooltip to the left of the mouse. Otherwise,
        // just keep the existing placement
        if (left < this._windowWidth / 3) {
            this._tooltipLeftOfMouse = false;
        }

        if (left > 2 * (this._windowWidth / 3)) {
            this._tooltipLeftOfMouse = true;
        }

        if (this._tooltipLeftOfMouse) {
            // Put the tooltip in the left half of the window. The 10 is
            // an offset to allow some space between the tooltip and the
            // pointer
            left -= this._tooltipWidth + 10;
        } else {
            left += 10;
        }

        // Make sure the tooltip isn't off the left edge
        if (left < window.pageXOffset) {
            left = window.pageXOffset;
        }
        this._tooltipDiv.style.left = left + 'px';

        this.adjustVerticalPosition(top, bottom);
    }

    /**
     * Default Tooltip placement routine. Attempts to make the entire
     * tooltip visibile without covering the mouse.
     */
    protected defaultTooltipPlacement(event: {
        x: number, y: number,
        clientY: number, clientX: number
    }) {
        // Start by trying to put the tooltip above or below the pointer
        let top: number, bottom: number, right: number, left: number;

        // Cast the event the mouse event we know that it is. After all,
        // this is the MouseMove callback!
        top = window.pageYOffset + event.clientY;
        left = window.pageXOffset + event.clientX;

        // If the pointer is in the upper half of the screen, try to put
        // the tooltip below the pointer
        if (event.y < (this._windowHeight / 2)) {
            // Put the top of the tooltip below the pointer. The 20 is a
            // guess for how much to offset so the tooltip isn't obscured
            // by the cursor. Unfortunately there's no API to query the
            // cursor, and it can be an arbitrary shape, with an arbitary
            // hotspot
            top += 20 + this._tooltipOffset;
            bottom = top + this._tooltipHeight;

            // Make sure the bottom of the tooltip is visible
            if (bottom < (this._windowHeight + window.pageYOffset)) {
                // We're good. Now set the left edge
                left -= this._tooltipWidth / 2;

                // Make sure we're not off the left or right edge of the window
                right = left + this._tooltipWidth;
                if (right > this._windowWidth) {
                    left -= right - this._windowWidth;
                }
                if (left < window.pageXOffset) {
                    left = window.pageXOffset;
                }
                this._tooltipDiv.style.left = left + 'px';

                this.adjustVerticalPosition(top, bottom);
                return;
            }
        } else {
            // Initially guess the tooltip goes above the pointer. The
            // 10 gives some space between the tooltip and the pointer
            top -= this._tooltipHeight + 10 + this._tooltipOffset;

            // Make sure the top of the tooltip is visible
            if (top >= window.pageYOffset) {
                // We're good. Now set the left edge
                left -= this._tooltipWidth / 2;

                // Make sure we're not off the left or right edge of the window
                right = left + this._tooltipWidth;
                if (right > this._windowWidth) {
                    left -= right - this._windowWidth;
                }
                if (left < window.pageXOffset) {
                    left = window.pageXOffset;
                }
                this._tooltipDiv.style.left = left + 'px';

                this.adjustVerticalPosition(top, bottom);
                return;
            }
        }

        // If we got here, putting the tooltip in the upper or lower half
        // of the window didn't work. Try for the right or left half

        // Choose the left or right half
        if (event.clientX > (this._windowWidth / 2)) {
            // Put the tooltip in the left half of the window. The 10 is
            // an offset to allow some space between the tooltip and the
            // pointer
            left -= this._tooltipWidth + 10;

            // Make sure the tooltip isn't off the left edge
            if (left < window.pageXOffset) {
                left = window.pageXOffset;
            }
        } else {
            // Try putting the tooltip in the right half of the window
            // Put the tooltip in the left half of the window. The 10 is
            // an offset to allow some space between the tooltip and the
            // pointer
            left += 10;
            right = left + this._tooltipWidth;

            // Make sure the tooltip isn't off the right edge
            if (right > this._windowWidth) {
                left -= right - this._windowWidth;
            }
        }

        // Set the tooltip div position.
        this._tooltipDiv.style.left = left + 'px';

        this.adjustVerticalPosition(top, bottom);
    }   // _DefaultTooltipPlacement

    /**
     * Override the default offset of the tooltip from the mouse.
     */
    public setOffset(value: number): BaseTooltip {
        this._tooltipOffset = value;
        return this;
    }

    public setEnabled(enable: boolean): BaseTooltip {
        this._disabled = !enable;
        return this;
    }

    /**
     * HideDisplayValue
     *
     * The value the CSS 'display' attribute will be set to to hide the
     * tooltip. This defaults to 'none'. 'display' will be set to 'block'
     * when the tooltip is to be visible.
     */
    public setHideDisplayValue(hide: string): BaseTooltip {
        this._hide = hide;
        return this;
    }

    /**
     * When the mouse enters the target region, instead of instantly showing
     * the tooltip, there's a small delay. This prevents the tooltip from
     * popping up and disappearing if the user is just moving the mouse over
     * the target region instead of waiting for information. By default, the
     * delay is 1 second.
     *
     * @param milliseconds - The number of milliseconds to delay showing the
     * tooltip after the mouse enters the target region.
     *
     * @return - The tooltip instance.
     */
    public setDelay(milliseconds: number): BaseTooltip {
        this._delayMS = milliseconds;
        return this;
    }

    public setPlaceTooltipLeft(): BaseTooltip {
        this._tooltipPlacementFunc = this.placeTooltipLeft;
        return this;
    }

    public setPlaceTooltipLeftRight(): BaseTooltip {
        this._tooltipPlacementFunc = this.placeTooltipLeftRight;
        return this;
    }

    /**
     * Release all tooltip listeners on the target. Failure to release the
     * listeners can prevent the target from being freed.
     *
     * @param target - The object to have any tooltip listeners reset.
     */

    public static releaseListeners(target: any): void {
        target
            .on('mouseenter.tooltip', null)
            .on('mouseleave.tooltip', null)
            .on('mousemove.tooltip', null);
    }

    /**
     * Sets a limit on the time a tooltip is visible.
     *
     * @param seconds - Seconds the tooltip should be visible
     * @param callLeaveFunctionOnTimeout - True if the leave function should
     *  be called when the timeout occurs.
     *
     * @return - The tooltip instance.
     */
    public setVisibilityTimeout(seconds: number,
        callLeaveFunctionOnTimeout: boolean = true): BaseTooltip {
        this._visibilityTimeoutSecs = seconds;
        this._visibilityTimeoutCallLeaveFunction = callLeaveFunctionOnTimeout;
        return this;
    }

    /**
     * Set whether to recalculate the tooltip width every time the cursor moves.
     *
     * Defaults to false
     *
     * @param value - Whether to recalculate the tooltip width every time the
     *   cursor moves.
     */
    public alwaysRecalcWidth(value: boolean): BaseTooltip {
        this._alwaysRecalcWidth = value;
        return this;
    }

    /**
     * Override tooltip background color. The background color is applied to
     * the tooltip div immediately.
     *
     * @param value - color encoding, for example '#000000'
     *
     * @returns - The tooltip instance.
     */
    public setBackgroundColor(color: string): BaseTooltip {
        this._tooltipBackgroundColor = color;
        this._tooltipDiv.style['background-color'] = this._tooltipBackgroundColor;
        return this;
    }

    /**
    * Override tooltip font color.  The font color is applied to
    * the tooltip div immediately.
    *
    * @param value - color encoding, for example '#000000'
    *
    * @returns - The tooltip instance.
    */
    public setFontColor(color: string): BaseTooltip {
        this._tooltipFontColor = color;
        this._tooltipDiv.style.color = this._tooltipFontColor;
        return this;
    }

    /**
     * Override tooltip font type. The font family is applied to
     * the tooltip div immediately.
     *
     * @param value - string, for example 'Segoe UI'
     *
     * @returns - The tooltip instance.
     */
    public setFontType(font: string): BaseTooltip {
        this._tooltipFontType = font;
        this._tooltipDiv.style.font = this._tooltipFontType;
        return this;
    }

    /**
     * Override tooltip font size. The font size is applied to
     * the tooltip div immediately.
     *
     * @param value - font size in pixels, for example '8px'
     *
     * @returns - The tooltip instance.
     */
    public setFontSize(size: string): BaseTooltip {
        this._tooltipFontSize = size;
        this._tooltipDiv.style.font = this._tooltipFontSize;
        return this;
    }   // FontSize

    /**
     * Set the analytics name for the tooltip. Not currently used.
     *
     * @param value - The analytics name to report when this tooltip is shown
     *   or hidden.
     *
     * @returns - The tooltip instance.
     */
    public setAnalyticsName(value: string): BaseTooltip {
        this._analyticsName = value;
        return this;
    }   // AnalyticsName

    /**
     * Set the CSS class for the tooltip. The class is applied immediately.
     *
     * @param cssClass - The CSS class(es) to apply to this tooltip.
     *
     * @returns - The tooltip instance.
     */
    public setCssClass(cssClass: string): BaseTooltip {
        this._tooltipDiv.classList.add(cssClass);
        return this;
    }   // CssClass

    /**
     * Set the target for the tooltip
     *
     * @param target - The selection of DOM objects that should cause the
     *   tooltip to appear.
     *
     * @returns - The tooltip instance.
     */
    public setTarget(target: any): BaseTooltip {
        if (target) {
            target
                .on('mouseenter.tooltip', this.onMouseEnter)
                .on('mouseleave.tooltip', this.onMouseLeave)
                .on('mousemove.tooltip', this.onMouseMove);
        }
        return this;
    }   // Target

    /**
     * Set the function to be called when the mouse moves into the target
     * DOM object(s)
     *
     * @param enterfunc - The function to be called when the mouse moves into
     *   the target DOM object. If the tooltip will only be shown if the
     *   enterfunc returns true.
     *
     * @returns - The tooltip instance.
     */
    public setEnterCallback(enterfunc: ITooltipCallback): BaseTooltip {
        this._enterfunc = enterfunc;
        return this;
    }   // EnterFunc

    /**
     * Set the function to be called when the mouse moves off of the target
     * DOM object(s)
     *
     * @param leavefunc - The function to be called when the mouse moves off of
     *   the target DOM object.
     *
     * @returns - The tooltip instance.
     */
    public setLeaveCallback(leavefunc: ITooltipCallback): BaseTooltip {
        this._leavefunc = leavefunc;
        return this;
    }   // LeaveFunc

    /**
     * Set the function to be called when the mouse moves while it is on the
     * target DOM object(s)
     *
     * @param movefunc - The function to be called when the mouse moves while
     *   it is on the target DOM object.
     *
     * @returns - The tooltip instance.
     */
    public setMoveCallback(moveFunc: ITooltipCallback): BaseTooltip {
        this._movefunc = moveFunc;
        return this;
    }   // MoveFunc

    /**
     * Display the tooltip div after a delay
     *
     * @param delayMS - milliseconds to delay before showing the tooltip
     *
     * @returns - The tooltip instance.
     */
    public displayTooltip(delayMS: number): BaseTooltip {

        // If tooltips are disabled, don't do anything
        if (this._disabled) {
            return this;
        }

        // Save this for callbacks
        let self: BaseTooltip = this;

        // If there's no delay display the tooltip now
        if (0 === delayMS) {
            displayTooltipNow();
            return this;
        }

        // If there's already a timer running, don't start another
        if (undefined !== this._timerId) {
            return this;
        }

        // Display the tooltip 'in a bit'
        this._timerId = window.setTimeout(displayTooltipNow, delayMS);

        return this;

        // Make the tooltip div visible
        function displayTooltipNow(): void {

            // If tooltips are dispabled, don't do anything
            if (self._disabled) {
                return;
            }

            // Display the tooltip
            self._tooltipDiv.style.display = 'block';

            // If the tooltip is supposed to 'self hide', start a timer
            if (self._visibilityTimeoutSecs > 0) {
                self._visibilityTimerId = window.setTimeout(hideTooltip, self._visibilityTimeoutSecs * 1000);
            }

            // Function to hide the tooltip
            function hideTooltip(): void {
                self.onMouseLeave(null);
            }
        }   // function DisplayTooltipNow

    }   // _DisplayTooltip

    /**
     * Hide the tooltip div
     *
     * @returns - The tooltip instance.
     */
    public hideTooltip(): BaseTooltip {
        // If there's a delayed display pending, cancel it
        if (this._timerId) {
            window.clearTimeout(this._timerId);
        }

        // Reset the timerid so we can display the tooltip next time
        this._timerId = undefined;
        this._tooltipDiv.style.display = this._hide;

        return this;
    }   // _HideTooltip
}   // class Tooltip

export class OneLineTooltip extends BaseTooltip {
    protected _title: string;

    constructor(tooltipDivId: string, tooltipStyle: string = 'tooltip-t') {
        super(tooltipDivId, tooltipStyle);
    }

    public getTitle() {
        return this._title;
    }
    public setData(title: string, data: string) {
        // If the data already exists, remove any children
        while (this._tooltipDiv.hasChildNodes()) {
            this._tooltipDiv.removeChild(this._tooltipDiv.lastChild);
        }

        this._title = title;

        let table = document.createElement('table');
        table.classList.add('tooltip-table');

        this._tooltipDiv.appendChild(table);

        let tr = document.createElement('tr');
        table.appendChild(tr);

        let td = document.createElement('td');
        td.classList.add('tooltip-title');
        td.setAttribute('colspan', '2');
        td.textContent = title;
        tr.appendChild(td);

        if (data != undefined) {
            // now get text from any associated graphs
            tr = document.createElement('tr');
            table.appendChild(tr);
            td = document.createElement('td');
            td.setAttribute('colspan', '2');
            td.textContent = data;
            tr.appendChild(td);
        }
    }
}

export class MetricListTooltip extends BaseTooltip {
    protected _title: string;

    constructor(tooltipDivId: string, tooltipStyle: string = 'tooltip-t') {
        super(tooltipDivId, tooltipStyle);
    }

    public getTitle() {
        return this._title;
    }

    public setData(title: string, ttList: ITooltipData[]) {
        // If the data already exists, remove any children
        while (this._tooltipDiv.hasChildNodes()) {
            this._tooltipDiv.removeChild(this._tooltipDiv.lastChild);
        }

        this._title = title;

        let table = document.createElement('table');
        table.classList.add('tooltip-table');

        this._tooltipDiv.appendChild(table);

        let tr = document.createElement('tr');
        table.appendChild(tr);

        let td = document.createElement('td');
        td.classList.add('tooltip-title');
        td.setAttribute('colspan', '2');
        td.textContent = title;
        tr.appendChild(td);

        // now get text from any associated graphs
        for (let i = 0; i < ttList.length; ++i) {
            let data = ttList[i];

            if (Object.keys(data.metrics).length > 0) {
                let sourceChart: any = data.source;
                if (sourceChart && sourceChart.title && ttList.length !== 1) {
                    let tr = document.createElement('tr');
                    table.appendChild(tr);

                    let td = document.createElement('td');
                    td.classList.add('tooltip-group-title');
                    td.setAttribute('colspan', '2');
                    td.textContent = sourceChart.title;
                    tr.appendChild(td);
                }

                if (data.group && data.group.length > 0) {
                    let tr = document.createElement('tr');
                    table.appendChild(tr);

                    let td = document.createElement('td');
                    td.classList.add('tooltip-group-title');
                    td.setAttribute('colspan', '2');
                    td.textContent = data.group;
                    tr.appendChild(td);
                }

                for (let metricName in data.metrics) {
                    let tr = document.createElement('tr');
                    table.appendChild(tr);

                    let td = document.createElement('td');
                    td.classList.add('tooltip-metric-name');
                    td.textContent = metricName;
                    tr.appendChild(td);

                    td = document.createElement('td');
                    td.classList.add('tooltip-metric-value');
                    td.textContent = data.metrics[metricName];
                    tr.appendChild(td);
                }
            }
        }
    }
}

export class CustomDivTooltip extends MetricListTooltip {
    constructor(tooltipDivId: string, tooltipStyle: string = 'tooltip-t') {
        super(tooltipDivId, tooltipStyle);
    }

    public clearTooltip() {
        // If the data already exists, remove any children
        while (this._tooltipDiv.hasChildNodes()) {
            this._tooltipDiv.removeChild(this._tooltipDiv.lastChild);
        }
    }

    public getTooltipDiv(): any {
        return this._tooltipDiv;
    }
}
