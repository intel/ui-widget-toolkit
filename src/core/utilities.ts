import { ITreeNode, ITraceValue, ISummaryValue } from '../interface/chart/series-data';
import { IBuffer, ICheckboxTreeNode } from '../interface/ui-base';

export function getSelectionName(className: string) {
    if (typeof (className) === 'number') {
        return 'n' + className;
    }
    if (!className) {
        return '';
    }
    if (className.length > 0 && !isNaN(Number(className[0]))) {
        className = 'z' + className;
    }
    className = className.replace(/[\*\%\#\[\]\/\>\<\s\+\(\)\;\@\:\?\"=.,]/g, '-');
    return className;
}


/**
* detect IE
* returns version of IE or false, if browser is not Internet Explorer
*/
// from https://codepen.io/gapcode/pen/vEJNZN
export function detectIE() {
    let ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    let msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    let trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        let rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    let edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

// from https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
// polyfill for old version of IE
export function useIEPolyfill(window: any) {
    try {
        new CustomEvent('test'); // No need to polyfill
    } catch (e) {
        // Polyfills DOM4 CustomEvent
        let MouseEvent = function (eventType: any, params: any) {
            params = params || { bubbles: false, cancelable: false };
            var mouseEvent = document.createEvent('MouseEvent');
            mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            return mouseEvent;
        }

        MouseEvent.prototype = Event.prototype;
        window.MouseEvent = MouseEvent;
    }
}

export function removeFromList(value: any, arr: any[]) {
    if (value) {
        let index = arr.indexOf(value);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }
}


/** taken from d3-array */
function ascending(a: any, b: any): number {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

/** taken from d3-array */
function ascendingComparator(f: (d: any) => number): (a: any, b: any) => number {
    return function (d: any, x: any): number {
        return ascending(f(d), x);
    };
}

/** modified from d3-array */
export function bisect(compare?: any): any {
    if (!compare) compare = ascending;
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
        left: function (a: any[], x: any, lo: number, hi: number) {
            if (lo == null) lo = 0;
            if (hi == null) hi = a.length;
            while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (compare(a[mid], x) < 0) lo = mid + 1;
                else hi = mid;
            }
            return lo;
        },
        right: function (a: any[], x: number, lo: number, hi: number) {
            if (lo == null) lo = 0;
            if (hi == null) hi = a.length;
            while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (compare(a[mid], x) > 0) hi = mid;
                else lo = mid + 1;
            }
            return lo;
        }
    };
}

/** puts all raw data into buckets based on thresholds and values */
export function bucketData(values: any[], thresholds: number[],
    accessor: (d: any) => number): { [index: string]: any[] } {

    let findRight = bisect().right;

    let buckets: any[][] = [];
    // need one less bucket than thresholds
    for (let i = 0; i < thresholds.length - 1; ++i) {
        buckets[i] = [];
    }

    let min = thresholds[0];
    let max = thresholds[thresholds.length - 1];

    let usedThresholds = thresholds.slice(1);
    for (let i = 0; i < values.length; ++i) {
        let compareValue = accessor(values[i]);
        if (compareValue < min || compareValue > max) {
            continue;
        }

        let valueIdx = findRight(usedThresholds, compareValue);
        buckets[valueIdx].push(values[i]);
    }

    // name the return buckets
    let ret: { [index: string]: any[] } = {};
    for (let i = 0; i < thresholds.length - 1; ++i) {
        let bucketName: string = thresholds[i] + '-' + thresholds[i + 1];
        ret[bucketName] = buckets[i];
    }

    return ret;
}

export function copy(obj: any): Object {
    let ret: any = {};
    for (let key in obj) {
        ret[key] = obj[key];
    }
    return ret;
}
export function merge(obj1: any, obj2: any): void {
    for (let key in obj2) {
        obj1[key] = obj2[key];
    }
}

export function convertTraceToTrees(input: ITraceValue[]): ITreeNode[] {
    let roots: ITreeNode[] = [];

    let stack: ITraceValue[] = []; // used to represent the current stack state
    let nodeStack: ITreeNode[] = []; // used to represent the current stack state
    for (let i = 0; i < input.length; i++) {
        let value = input[i];
        let parent = stack[stack.length - 1];

        // pop stuff off the stack
        while (stack.length && value.x > parent.x + parent.dx) {
            --stack.length;
            --nodeStack.length;
            parent = stack[stack.length - 1];
        }

        let parentNode = nodeStack[nodeStack.length - 1];
        let node: ITreeNode = {
            key: value.key,
            value: value.dx,
            children: [],
            parent: parentNode
        };

        if (value.name) {
            node.name = value.name;
        }

        if (parentNode) {
            parentNode.children.push(node);
        } else {
            roots.push(node);
        }

        stack.push(value);
        nodeStack.push(node);
    }

    return roots;
}

export class SimpleBuffer<DataType> implements IBuffer<DataType> {
    private _data: DataType[];

    constructor(data?: DataType[]) {
        if (data) {
            this._data = data;
        } else {
            this._data = [];
        }
    }

    public push(d: DataType) {
        this._data.push(d);
    }

    public get(index: number): DataType {
        return this._data[index];
    }

    public length(): number {
        return this._data.length;
    }

    public getData(): DataType[] {
        return this._data;
    }
}

export class RingBuffer<DataType> implements IBuffer<DataType> {
    private _data: DataType[];
    private _startIdx: number;
    private _count: number;
    private _isRotating: boolean;

    constructor(size: number) {
        this._data = new Array(size);
        this._startIdx = 0;
        this._count = 0;
        this._isRotating = false;
    }

    /** add a new value to the buffer */
    public push(d: DataType) {
        if (this._isRotating) {
            // the buffer is rotating
            this._data[this._startIdx] = d;
            ++this._startIdx;

            if (this._startIdx === this._count) {
                this._startIdx = 0;
            }

            this._isRotating = true;
        } else if (this._count === this._data.length - 1) {
            // here the buffer will start rotating as the buffer is full
            this._data[this._count] = d;
            ++this._count;
            this._isRotating = true;
        } else {
            // here the buffer has not been filled yet
            this._data[this._count] = d;
            ++this._count;
        }
    }

    /** return the value offset index from the start index
     * @param index the offset from the start of the buffer
     */
    public get(index: number): DataType {
        if (this._isRotating) {
            // the buffer is rotating
            index = index + this._startIdx;
            if (index >= this._count) {
                index = index - this._count;
            }
        }
        return this._data[index];
    }

    /** get the number of items in the buffer */
    public length() {
        return this._count;
    }

    public getData(): DataType[] {
        if (this._isRotating) {
            // the buffer is rotating
            let ret = [];
            for (let i = this._startIdx; i < this._data.length; ++i) {
                ret.push(this._data[i]);
            }
            for (let i = 0; i < this._startIdx; ++i) {
                ret.push(this._data[i]);
            }
            return ret;
        }
        return this._data;
    }
}

export function bisectBuffer(compare?: any): any {
    if (!compare) compare = ascending;
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
        left: function (a: IBuffer<any>, x: any, lo: number, hi: number) {
            if (lo == null) lo = 0;
            if (hi == null) hi = a.length();
            while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (compare(a.get(mid), x) < 0) lo = mid + 1;
                else hi = mid;
            }
            return lo;
        },
        right: function (a: IBuffer<any>, x: number, lo: number, hi: number) {
            if (lo == null) lo = 0;
            if (hi == null) hi = a.length();
            while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (compare(a.get(mid), x) > 0) hi = mid;
                else lo = mid + 1;
            }
            return lo;
        }
    };
}


export function transposeKeys(data: ISummaryValue[]): ISummaryValue[] {

    // this is used to map the keys to their indicies in the output summary data
    let keyIdxMapping: { [index: string]: number } = {};

    function transposeHelper(output: ISummaryValue[], parentKeys: string[],
        value: ISummaryValue, level: number) {

        let myKeys = [];
        for (let i = 0; i < parentKeys.length; ++i) {
            myKeys[i] = parentKeys[i];
        }
        myKeys.push(value.key);

        if (Array.isArray(value.data)) {
            for (let i = 0; i < value.data.length; ++i) {
                transposeHelper(output, myKeys, value.data[i], level + 1);
            }
        } else {
            let currSummaryArray = output;
            for (let keyIdx = myKeys.length - 1; keyIdx >= 0; --keyIdx) {
                let key = myKeys[keyIdx];
                let dataIdx: number;
                if (!keyIdxMapping.hasOwnProperty(key)) {
                    dataIdx = currSummaryArray.length;
                    keyIdxMapping[key] = dataIdx;
                } else {
                    dataIdx = keyIdxMapping[key];
                }

                // create the summary data if it doesn't exist yet
                if (!currSummaryArray[dataIdx]) {
                    currSummaryArray[dataIdx] = { key: key, data: [] };
                }

                // if we are the leaf add the data, else just move to the next level
                if (keyIdx === 0) {
                    currSummaryArray[dataIdx].data = value.data;
                } else {
                    currSummaryArray = currSummaryArray[dataIdx].data as ISummaryValue[];
                }
            }
        }
    }

    let output: ISummaryValue[] = [];
    for (let i = 0; i < data.length; ++i) {
        transposeHelper(output, [], data[i], 0);
    }
    return output;
}

export function runFunctionOnLeaf(node: ICheckboxTreeNode,
    func: (leafNode: ICheckboxTreeNode) => void
) {
    if (node && node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; ++i) {
            runFunctionOnLeaf(node.children[i], func);
        }
    } else {
        func(node);
    }
}