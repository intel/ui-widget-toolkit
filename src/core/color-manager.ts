function numberToHex(number: string) {
    var hex = Number(number).toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}
function rgbToHex(color: string) {
    let rgb = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',');
    return numberToHex(rgb[0]) + numberToHex(rgb[1]) + numberToHex(rgb[2]);
}

/** used to organize and create colors for the UI */
export class ColorManager {
    private _colorMap: { [index: string]: string };
    private getRandomColor: () => string;

    constructor(randomColorFunc?: () => string) {
        this._colorMap = {}
        if (randomColorFunc) {
            this.getRandomColor = randomColorFunc;
        } else {
            this.getRandomColor = function (): string {
                var letters = '0123456789ABCDEF';
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
        }
    }

    /**
     * check if an existing color exists for a given key
     *
     * @param the key associated with your data
     */
    public hasColor(key: string): boolean {
        return this._colorMap.hasOwnProperty(key);
    }

    /**
     * set the color associated with a given key
     *
     * @param key associated with your data
     * @param color to associate with the key
     */
    public setColor(key: string, color: string): void {

        if (color.indexOf('rgb') === 0) {
            color = ColorManager.RgbToHex(color);
        }
        this._colorMap[key] = color;
    }

    /**
     * get the color associated with a given key
     *
     * @param key associated with your data
     */
    public getColor(key: string): string {
        if (!this.hasColor(key)) {
            this._colorMap[key] = this.getRandomColor();
        }
        return this._colorMap[key];
    }

    static IntToHex(value: number): string {
        return '#' + value.toString(16).padStart(6, '0');
    }

    static RgbToHex(color: string): string {
        return '#' + rgbToHex(color);
    }

    static RgbToInt(color: string): number {
        return parseInt(rgbToHex(color), 16);
    }
}
