import {
    IEvent, IOptions, UIElement, UIRenderer, Css, ITooltipData, UIType
} from '../interface/ui-base';
import { ColorManager } from './color-manager';
import { SVGRenderer } from './svg-helper';

import * as d3 from 'd3';

let UIRendererMap: { [index: number]: Object } = {};

let testContext: any;
if (document) {
    testContext = document.createElement('canvas').getContext('2d');
}
export function getTextWidth(text: string, font: string, size: string) {
    testContext.font = size + 'px ' + font;
    return testContext.measureText(text).width;
};

export class UIElementRenderer {
    protected _options: IOptions;
    protected _colorMgr: ColorManager;
    /** the original user defined element */
    protected _element: UIElement;

    /**
     * get the options the renderer is using for the given element
     *
     * @param the element to invalidate
     */
    getOptions(): IOptions { return this._options; }

    /**
     * get the colors the renderer is using for the given element
     *
     * @param the element to invalidate
     */
    getColorManager(): ColorManager { return this._colorMgr; }
    setColorManager(colorMgr: ColorManager) { this._colorMgr = colorMgr }
}

export class D3Renderer implements UIRenderer {
    public static register(type: UIType, renderer: Object) {
        UIRendererMap[type] = renderer;
    }

    /** The parent id of the div */
    protected _parent: d3.Selection<d3.BaseType, any, d3.BaseType, any>;
    protected _parentId: string;
    protected _colorMgr: ColorManager;

    /** maps to render elements if multiple renders are used
     *  through this interface */
    protected _rendererMap: WeakMap<UIElement, SVGRenderer>;

    // from UIRenderer
    public onRender: (elem: UIElement, options: IOptions) => void;

    constructor(parentId?: string, colorMgr: ColorManager = new ColorManager()) {
        if (parentId) {
            this._parentId = parentId;
            this._parent = d3.select('body').select(parentId);
        }
        if (colorMgr) {
            this._colorMgr = colorMgr;
        }

        this._rendererMap = new WeakMap<UIElement, SVGRenderer>();
    }

    public setOnRenderCallback(callback: (elem: UIElement, options: IOptions) => void) {
        this.onRender = callback;
    }

    public clearDiv(parentDiv: Element) {
        if (parentDiv) {
            while (parentDiv.firstChild) {
                parentDiv.removeChild(parentDiv.firstChild);
            }
        }
    }

    public setDiv(parentDiv: Element) {
        this._parent = d3.select(parentDiv);
    }

    /**
     * Get the css actually rendered. This is useful for legend swatches
     * and the like.
     *
     * @param the element to get the rendered CSS information for
     *
     * @return The css rendered, or undefined if called before the chart is
     *   rendered
     */
    public getRenderedCss(element: UIElement): Css {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).getRenderedCss();
        }
        return new Css();
    }

    /**
     * hover event
     *
     * @param element to fire the hover event on
     * @param event the event to pass to the renderer
     */
    public hover(element: UIElement, event: IEvent): void {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).hover(event);
        }
    }

    /**
     * zoom event
     *
     * @param element to fire the zoom event on
     * @param event the event to pass to the renderer
     */
    public zoom(element: UIElement, event: IEvent): void {
        if (this._rendererMap.has(element)) {
            this._rendererMap.get(element).zoom(event);
        }
    }

    /**
     * tooltip the element.
     *
     * @param renderer an IRenderer object that has the tooltip
     * @param event the event to pass to the renderer
     */
    public getTooltipData(element: UIElement, event: IEvent): ITooltipData[] {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).getTooltipData(event);
        }
        return [{ source: element, group: '', metrics: {} }];
    }

    /**
     * hover event
     *
     * @param element to fire the hover event on
     * @param event the event to pass to the renderer
     */
    public cursorChange(element: UIElement, event: IEvent): void {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).cursorChange(event);
        }
    }

    /**
     * brush event
     *
     * @param element to fire the brush event on
     * @param event the event to pass to the renderer
     */
    public brush(element: UIElement, event: IEvent): void {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).brush(event);
        }
    }

    protected configureElement(element: UIElement) {
        let self = this;
        element.renderer = this;

        if (!this._rendererMap.has(element)) {
            let node: any = this._parent.node();
            if (!node) {
                this._parent = d3.select(this._parentId);
            }

            let Renderer: any = UIRendererMap[element.type];
            if (Renderer) {
                let r = new Renderer(element, this, this._parent);
                r.setColorManager(this._colorMgr);
                this._rendererMap.set(element, r);
            }
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

        this.configureElement(element);
        if (this._rendererMap.has(element)) {
            this._rendererMap.get(element).render(options);
            if (element.onRender) {
                element.onRender(options);
            }
            if (this.onRender) {
                this.onRender(element, options);
            }
        }
    }

    /**
     * invalidate the given element
     *
     * @param the element to invalidate
     */
    public invalidate(element: UIElement, options: IOptions = {}) {
        let self = this;
        element.renderer = this;

        this.configureElement(element);
        if (this._rendererMap.has(element)) {
            this._rendererMap.get(element).invalidate(options);
            if (element.onRender) {
                element.onRender(options);
            }
            if (this.onRender) {
                this.onRender(element, options);
            }
        }
    }

    public setColorManager(colorManager: ColorManager) {
        this._colorMgr = colorManager;
    }

    /**
     * get color manager for this renderer
     */
    public getColorManager() {
        return this._colorMgr;
    }

    /**
     * free the resources used by the renderer for this element
     */
    public destroy(element: UIElement) {
        this._rendererMap.delete(element);
    }

    /**
     * get the options the renderer is using for the given element
     *
     * @param the element to invalidate
     */
    public getOptions(element: UIElement): IOptions {
        if (this._rendererMap.has(element)) {
            return this._rendererMap.get(element).getOptions();
        }
    }
}

export let D3ChartRenderer = D3Renderer;
export let D3GraphRenderer = D3Renderer;