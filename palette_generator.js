/** Store pixels as rgba */
class Pixel {
    red;
    green;
    blue;
    alpha;

    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

/** Class for generating palettes*/
class PaletteGenerator {

    /**
     * Calculate the variance between two pixel objects
     * @param {*} pixel_1 - Pixel object
     * @param {*} pixel_2 - Pixel object
     * @returns {int} variance between the two pixels
     */
    static colorVariance(pixel_1, pixel_2) {
        return ((pixel_1.red - pixel_2.red) * (pixel_1.red - pixel_2.red)) + ((pixel_1.green - pixel_2.green) * (pixel_1.green - pixel_2.green)) + ((pixel_1.blue - pixel_2.blue) * (pixel_1.blue - pixel_2.blue))
    }

    /**
     * Returns an array of most common colored pixels from an image
     * 
     * @param {*} image_element - html <img> tag
     * @param {int} palette_length - number of colors that will be return
     * @param {dec} tolerance - [0,1] decimal, percent similarity difference between return results
     * @return {Pixel[]} array of most common pixels from image
     */
    static imgToPalette(img_element, palette_length = 5, tolerance = 0.1) {

        let canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');

        canvas.width = img_element.width;
        canvas.height = img_element.height;

        ctx.drawImage(img_element, 0, 0);

        // Get array of image pixels
        const rgba = ctx.getImageData(
            0, 0, img_element.width, img_element.height
        ).data;

        let pixel_map = new Map();

        // Group the like colors together, and get counts of how many per pixel there are
        for (let index = 0; index < rgba.length; index += 4) {
            let pxl_key = `${rgba[index]}${rgba[index + 1]}${rgba[index + 2]}`;
            if (pixel_map.has(pxl_key)) {
                pixel_map.get(pxl_key).count++;
            } else {
                pixel_map.set(pxl_key, { pixel: new Pixel(rgba[index], rgba[index + 1], rgba[index + 2], rgba[index + 3]), count: 1 });
            }
        }

        // Sort the colors by frequency in the image
        let pixel_array = Array.from(pixel_map.values())
        pixel_array.sort((p1, p2) => {
            if (p1.count < p2.count) {
                return -1;
            } return 1;
        })
        pixel_array.reverse();

        // max possible variance between two pixels
        // used to calculate percentage for tolerance comparison 
        // TODO possible optimization: store this as its reciprocal
        let max_variance = (255 * 255) + (255 * 255) + (255 * 255);
        let final_palette = [];
        for (let color of pixel_array) {
            color = color.pixel;

            if (!final_palette.length) {
                final_palette.push(color);
            } else {
                let is_new_color = false;
                for (let palette_color of final_palette) {
                    if ((PaletteGenerator.colorVariance(palette_color, color) / max_variance) > tolerance){
                        is_new_color = true;
                        break;
                    }
                }

                if (is_new_color){
                    final_palette.push(color)

                    if (final_palette.length == palette_length) {
                        return final_palette;
                    }
                }
            }
        }

        return final_palette
    }
}

