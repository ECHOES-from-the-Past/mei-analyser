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

    highlight(color = 'rgba(149, 48, 217, 0.6)', stroke_color = 'rgba(149, 48, 217, 1)') {
        const nc_svg = document.getElementById(this.id);
        nc_svg.style.fill = color;
        nc_svg.style.stroke = stroke_color;
        nc_svg.style.strokeWidth = '30px';
    }

    unhighlight() {
        const nc_svg = document.getElementById(this.id);
        nc_svg.style.fill = 'black';
    }

    log() {
        const nc_svg = document.getElementById(this.id);
        console.log(nc_svg);
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