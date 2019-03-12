import {
    EventType, IContextMenuItem, IEvent, UIElement
} from '../interface/ui-base';
import { BaseTooltip } from './tooltip';
import { showContextMenu } from './context-menu';

import * as PIXI from 'pixi.js';

export class GraphicsManager {
    protected _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    protected _graphicsMap: { [index: string]: any } = {}

    constructor(renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
        this._renderer = renderer;
    }

    public add(mainKey: string, altKey: string, scaleMode: any, resolution: number,
        create: () => PIXI.DisplayObject): any {
        // create a texture and save it for faster rendering
        let sprite;
        if (mainKey) {
            if (!this._graphicsMap[mainKey]) {
                this._graphicsMap[mainKey] = this._renderer.generateTexture(create(), scaleMode, resolution);
            }
            sprite = new PIXI.Sprite(this._graphicsMap[mainKey]);
        } else {
            if (!this._graphicsMap[altKey]) {
                this._graphicsMap[altKey] = this._renderer.generateTexture(create(), scaleMode, resolution);
            }
            sprite = new PIXI.Sprite(this._graphicsMap[altKey]);
        }
        return sprite;
    }
}

export class PIXIHelper {
    protected _stage: PIXI.Container;
    protected _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    protected _rectTexture: PIXI.Texture;
    protected _selectionItems: { [index: string]: any } = {};

    constructor(useWebGLRenderer = true) {
        PIXI.utils.skipHello();
        if (useWebGLRenderer) {
            this._renderer = new PIXI.WebGLRenderer(
                { transparent: true, antialias: true });
        } else {
            this._renderer = new PIXI.CanvasRenderer(
                { transparent: true, antialias: true });
        }

        let rect = new PIXI.Graphics();
        rect.beginFill(0xFFFFFF);
        rect.drawRect(0, 0, 1, 1); // draw rect)
        rect.endFill();

        this._rectTexture = this._renderer.generateTexture(rect, PIXI.SCALE_MODES.LINEAR, 128);
    }

    public getRenderer() {
        return this._renderer;
    }

    public createGraphicsManager() {
        return new GraphicsManager(this._renderer);
    }

    public addPixiSvg(svg: d3.Selection<any, any, any, any>,
        classes: string, width: number, height: number):
        d3.Selection<any, any, any, any> {

        let oldNodes = (svg.node() as any).getElementsByClassName(classes);
        for (let i = 0; i < oldNodes.length; ++i) {
            let node = oldNodes[i];
            node.parentNode.removeChild(node);
        }

        let foreignObject = svg
            .append('foreignObject')
            .attr('class', classes)
            .attr('width', width)
            .attr('height', height); // just for legend

        let foreignObjectElem = (foreignObject.node() as any);
        let canvas = foreignObjectElem
            .appendChild(this._renderer.view);

        // this is a hack to fix the fact that transforms aren't working
        // in chrome
        canvas.style.position = 'fixed';
        canvas.style.top = -window.scrollY + 'px';

        let top = -window.scrollY;
        let oldY = window.scrollY;
        document.addEventListener('scroll', function () {
            top = top - (window.scrollY - oldY)
            canvas.style.top = top + 'px';
            oldY = window.scrollY;
        });
        // end hack

        this._renderer.resize(width, height);

        return foreignObject;
    }

    public createRectangleContainer(x: number, y: number, width: number,
        height: number, backgroundColor: number) {

        var box = new PIXI.Container();
        var background = new PIXI.Sprite(this._rectTexture);
        background.tint = backgroundColor;
        background.width = width;
        background.height = height;

        box.addChild(background);
        box.position.x = x;
        box.position.y = y;
        return box;
    };

    public renderText(name: string, parent: any, color: number = 0,
        resolution: number = 2, scaling: number = .5) {
        // double font resolution for sharpness
        let fontSize = parent.style('font-size');
        fontSize =
            Number(fontSize.substring(0, fontSize.length - 2)) * resolution + 'px';
        let text = new PIXI.Text(name,
            {
                fill: color,
                fontFamily: parent.style('font-family'),
                fontSize: fontSize,
                fontWeight: parent.style('font-weight')
            });

        // scale text down
        text.scale = new PIXI.Point(scaling, scaling);
        return text;
    }

    private _tooltipTarget: any;
    public addInteractionHelper(target: PIXI.DisplayObject,
        onClick: (event: IEvent) => void, onDoubleClick: (event: IEvent) => void,
        contextMenuItems: IContextMenuItem[], hoverStart: (event: IEvent) => void,
        hoverEnd: (event: IEvent) => void,
        tooltip: BaseTooltip, caller: UIElement, value: any) {

        target.interactive = true;
        let self = this;

        let wait: any;
        if (onClick || onDoubleClick) {
            target.on('click', function (e: any) {
                e.stopPropagation();
                if (onDoubleClick) {
                    if (wait) {
                        window.clearTimeout(wait);
                        wait = null;
                        onDoubleClick({
                            caller: caller,
                            event: EventType.DoubleClick,
                            data: value
                        });
                    } else {
                        wait = setTimeout(function () {
                            if (wait) {
                                onClick({
                                    caller: caller, event: EventType.Click,
                                    data: value
                                });
                                wait = null;
                            }
                        }, 300);
                    }
                } else {
                    onClick({
                        caller: caller, event: EventType.Click,
                        data: value
                    });
                }
            });
        }

        function showMenu(e: any) {
            e.stopPropagation();
            if (tooltip) {
                tooltip.onMouseLeave(e);
            }
            showContextMenu(e.data.originalEvent, value, contextMenuItems);
        }

        if (contextMenuItems && contextMenuItems.length) {
            target
                .on('rightupoutside', showMenu)
                .on('rightup', showMenu);
        }

        if (hoverStart) {
            target.on('mouseover', function (e) {
                if (e.target) {
                    this.__data__ = value;
                    hoverStart.call(this);

                    if (tooltip) {
                        self._tooltipTarget = e.target;
                        tooltip.onMouseEnter(value);
                        tooltip.onMouseMove(value, e.data.originalEvent);
                    }
                }
            });
        }

        if (hoverEnd) {
            target.on('mouseout', function (e) {
                hoverEnd.call(this);
                if (tooltip && e.currentTarget === self._tooltipTarget) {
                    tooltip.onMouseLeave(value);
                }
            });
        }
    }

    public clearSelections(): void {
        this._selectionItems = {};
    }
    public addSelection(key: string, item: any): void {
        if (!this._selectionItems.hasOwnProperty(key)) {
            this._selectionItems[key] = [];
        }
        this._selectionItems[key].push(item);
    }

    public getSelection(key: string): any[] {
        return this._selectionItems[key];
    }

    public getStage(): PIXI.Container {
        return this._stage;
    }

    public render(stage?: PIXI.Container) {
        if (!stage) {
            if (this._stage) {
                this._renderer.render(this._stage);
            }
            return;
        }
        this._stage = stage;
        this._renderer.render(stage);
    }
}
