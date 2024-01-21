/**
 * An "abstract" class for a Neume Component (`<nc>`).
 * All Neume Components has an id and an optional tilt field.
 */
export class NeumeComponent {
    /**
     * 
     * @param {String} id the @xml:id attribute of the neume component 
     * @param {*} tilt the tilt field. This is optional so the field might be null.
     */
    constructor(id, tilt) {
        this.id = id;
        this.tilt = tilt;
    }

    /**
     * Highlight the neume component.
     * @param {String} color the fill colour of the neume component (default: 'rgba(149, 48, 217, 0.6)' - purple)
     * @param {String} stroke_color the stroke colour of the neume component (default: 'rgba(149, 48, 217, 1)' - purple)
     */
    highlight(color = 'rgba(149, 48, 217, 0.6)', stroke_color = 'rgba(149, 48, 217, 1)') {
        const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
        nc_svg.forEach((nc) => {
            nc.style.fill = color;
            nc.style.stroke = stroke_color;
            nc.style.strokeWidth = '30px';
        });
    }

    /**
     * Put the neume component in a spotlight by surrounding it with a box.
     * @param {String} color the fill colour of the surrounding box (default: 'rgba(149, 48, 217, 0.6)' - purple)
     * @param {String} stroke_color the stroke colour of the surrounding box (default: 'rgba(149, 48, 217, 1)' - purple)
     */
    spotlight(color = 'rgba(149, 48, 217, 0.6)', stroke_color = 'rgba(149, 48, 217, 1)') {
        const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
        nc_svg.forEach((nc) => {
            const x_coord = nc.querySelector('use').attributes.getNamedItem('x').value;
            const y_coord = nc.querySelector('use').attributes.getNamedItem('y').value;
            const width = '300';
            const height = '400';

            // construct a spotlight rectangle to highlight the neume component
            const spotlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            spotlight.setAttribute('class', 'spotlight-rect');
            spotlight.setAttribute('x', x_coord - width / 3);
            spotlight.setAttribute('y', y_coord - height / 2);
            spotlight.setAttribute('width', width);
            spotlight.setAttribute('height', height);
            spotlight.setAttribute('fill', color);
            spotlight.setAttribute('stroke', stroke_color);
            spotlight.setAttribute('stroke-width', '30px');
            // Display the spotlight rectangle
            nc.appendChild(spotlight);
        });
    }

    unhighlight() {
        const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
        nc_svg.forEach((nc) => {
            nc.style.fill = 'black';
        });
    }

    /**
     * Log the neume component to the console.
     * Useful for debugging purposes.
     */
    log() {
        const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
        nc_svg.forEach((nc) => {
            console.log(nc);
        });
    }

    get_id() {
        return this.id;
    }
}

/**
 * The Neume Component class for Square notation.
 */
export class NeumeComponentSQ extends NeumeComponent {
    /**
     * 
     * @param {*} id 
     * @param {*} pname pitch name of the note. (e.g. "d")
     * @param {*} oct octave of the note. (e.g. 8)
     * @param {*} tilt 
     */
    constructor(id, pname, oct, tilt) {
        super(id, tilt);
        this.pname = pname;
        this.oct = oct;
    }

    /**
     * Represent square neume component using base-7 value
     * Septenary = pitch * 7^0 + octave * 7^1
     */
    septenary() {
        const sq_pitch = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
        return Number(sq_pitch.indexOf(this.pname)) + Number(this.oct) * 7;
    }

    get_pname() {
        return this.pname;
    }

    get_oct() {
        return Number(this.oct);
    }
}

/**
 * The Neume Component class for <b>Aquitanian</b> notation.
 */
export class NeumeComponentAQ extends NeumeComponent {
    /**
     * 
     * @param {*} id 
     * @param {Number} loc location of the note relative to the staff
     * @param {*} tilt 
     */
    constructor(id, loc, tilt) {
        super(id, tilt);
        this.loc = loc;
    }

    get_loc() {
        return Number(this.loc);
    }
}