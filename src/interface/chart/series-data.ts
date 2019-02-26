export interface IXYValue {
    x: any,
    y: any,
    info?: { title?: string, colorKey?: string }
}

export interface IXYRect {
    x: any,
    x1: any,
    y: any,
    y1: any
}

export interface ITraceValue {
    key: number | string;
    name?: string;
    desc?: string;
    x: number;
    dx?: number;
}

export interface ITreeNode {
    key: number | string;
    value: number;
    children: ITreeNode[];
    parent: ITreeNode;
    name?: string;
    displayValue?: any;
}

export interface IMinMaxValue {
    x: any;
    y: number;
    min: number;
    max: number;
}

export interface ICandlestickValue {
    x: any;
    min: any;
    max: any;
    entry: any;
    exit: any;
}

export interface IFlameChartValue {
    depth: number;
    traceValue: ITraceValue;
    decimatedValues?: ITraceValue[],
}

export interface IFunctionMap {
    y: (x: any) => any;
    xMin?: any;
    xMax?: any;
    yMin?: any;
    yMax?: any;
}

export interface ISummaryValue {
    key: string;
    data: { [index: string]: number } | number | ISummaryValue[];
}
