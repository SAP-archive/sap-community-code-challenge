/**
 * @module svgRender - Utilities to help with the SVG Rendering
 */

/**
 * svg Header
 * @param {number} width 
 * @param {number} height 
 * @returns {string}
 */
export function svgHeader(width, height) {
    let content =
        `<svg
    width="${width.toString()}"
    height="${height.toString()}"
    viewBox="0 0 ${width.toString()} ${height.toString()}"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">\n`
    return content
}

/**
 * svg Styles block
 * @param  {...string} styles 
 * @returns {string}
 */
export function svgStyles(...styles) {
    let content = '<style>\n'
    for (let style of styles) {
        content += style
    }
    content += '</style>\n'
    return content
}

/**
* svg Style header
* @returns {string}
*/
export function svgStyleHeader() {
    return `
      .header {
          font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
          fill: #fff;
          animation: fadeInAnimation 0.8s ease-in-out forwards;
        }\n
        .headerGroup {
          font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif;
          fill: #fff;
          animation: fadeInAnimation 0.8s ease-in-out forwards;
        }\n`
}


/**
 * svg Style bold
 * @returns {string}
 */
export function svgStyleBold() {
    return `
      .bold { font-weight: 700 }\n`
}

/**
* Render a primary item Item
* @param {number} x
* @param {number} y 
* @param {number} delay - animation delay in milliseconds
* @param {string} image - Base64 encoded image data 
* @param {number} scaleX - Scale image X coordinate
* @param {number} scaleY - Scale image Y coordinate
* @param {boolean} [png] - alter rendering for png
* @param {string} [animation] - Special Animation
* @param {string} [onclick] - onclick event handler
* @param {string} [style] - custom style
* @param {string} [imageName] - imageName
* @returns {string}
*/
export function svgItem(x, y, delay, image, scaleX, scaleY, png = false, animation, onclick, style, imageName) {
    let content =
        `
     <g transform="translate(${y.toString()}, ${x.toString()})">\n`

    if (png) {
        content += `
      <g transform="translate(0, 0)">
      `
    } else {  //stagger style="animation-delay: ${delay.toString()}ms" transform="translate(0, 0)"
        if (style) {
            content += `
        <g class="${style}" style="animation-delay: ${delay.toString()}ms" transform="translate(0, 0)">
        `
        } else {
            content += `
      <g class="stagger" style="animation-delay: ${delay.toString()}ms" transform="translate(0, 0)">
      `
        }
    }

    let imageType = 'png'
    if (imageName && imageName.slice(-3) === 'svg') {
        imageType = `svg+xml`
    }

    if (onclick) {
        content += `
      <image ${onclick} class="icon" href="data:image/${imageType};base64,${image}" height="${scaleX.toString()}" width="${scaleY.toString()}">\n`

    } else {

        content += `
      <image class="icon" href="data:image/${imageType};base64,${image}" height="${scaleX.toString()}" width="${scaleY.toString()}">\n`

    }

    if (animation) {
        content += animation
    }

    content += `</image>    
         </g>
     </g>\n`

    return content

}

/**
 * svg Final End
 * @returns {string}
 */
export function svgEnd() {
    return `
      </svg>    
      `
}

