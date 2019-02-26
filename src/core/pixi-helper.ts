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

    public add(mainKey: string, altKey: string, create: () => PIXI.DisplayObject): any {
        // create a texture and save it for faster rendering
        let sprite;
        if (mainKey) {
            if (!this._graphicsMap[mainKey]) {
                this._graphicsMap[mainKey] = this._renderer.generateTexture(create(), PIXI.SCALE_MODES.LINEAR, 5);
            }
            sprite = new PIXI.Sprite(this._graphicsMap[mainKey]);
        } else {
            if (!this._graphicsMap[altKey]) {
                this._graphicsMap[altKey] = this._renderer.generateTexture(create(), PIXI.SCALE_MODES.LINEAR, 5);
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
    protected _selectionItems = {};

    constructor(useWebGLRenderer = true) {
        if (useWebGLRenderer) {
            this._renderer = new PIXI.WebGLRenderer(
                { transparent: true, antialias: true });
        } else {
            this._renderer = new PIXI.CanvasRenderer(
                { transparent: true, antialias: true });
        }

        let rect = new PIXI.Graphics();
        rect.beginFill(0xFFFFFF);
        rect.drawRect(0, 0, 2, 2); // draw rect)
        rect.endFill();

        this._rectTexture = this._renderer.generateTexture(rect);
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

    public createRectangle(x, y, width, height,
        backgroundColor, borderColor) {

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

    public addInteractionHelper(target: PIXI.DisplayObject,
        onClick: (event: IEvent) => void, onDoubleClick: (event: IEvent) => void,
        contextMenuItems: IContextMenuItem[], hoverStart: (event: IEvent) => void,
        hoverEnd: (event: IEvent) => void,
        tooltip: BaseTooltip, caller: UIElement, value: any) {

        target.interactive = true;

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

        function showMenu(e) {
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
                        tooltip.onMouseEnter(value);
                        tooltip.onMouseMove(value, e.data.originalEvent);
                    }
                }
            });
        }

        if (hoverEnd) {
            target.on('mouseout', function (e) {
                hoverEnd.call(this);
                if (tooltip) {
                    tooltip.onMouseLeave(value);
                }
            });
        }
    }

    public clearSelections() {
        this._selectionItems = {};
    }
    public addSelection(key, item) {
        if (!this._selectionItems.hasOwnProperty(key)) {
            this._selectionItems[key] = [];
        }
        this._selectionItems[key].push(item);
    }

    public getSelection(key): any[] {
        return this._selectionItems[key];
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
