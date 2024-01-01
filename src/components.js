/**
 * An "abstract" class for a Neume Component (`<nc>`).
 * All Neume Components has an id and an optional tilt field.
 */
class NeumeComponent {
    /**
     * 
     * @param {String} id the @xml:id attribute of the neume component 
     * @param {*} tilt the tilt field. This is optional so the field might be null.
     */
    constructor(id, tilt) {
        this.id = id;
        this.tilt = tilt;
    }

    highlight() {
        const nc_svg = document.getElementById(this.id);
        nc_svg.style.fill = 'rgba(149, 48, 217, 0.6)';
        nc_svg.style.stroke = 'rgba(149, 48, 217, 1)';
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
}

/**
 * The Neume Component class for <b>Aquitanian</b> notation.
 */
export class NeumeComponentAQ extends NeumeComponent {
    /**
     * 
     * @param {*} id 
     * @param {*} loc location of the note relative to the staff
     * @param {*} tilt 
     */
    constructor(id, loc, tilt) {
        super(id, tilt);
        this.loc = loc;
    }
}