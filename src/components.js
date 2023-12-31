/**
 * An "abstract" class for a Neume Component (<nc>).
 * 
 * All Neume Components has an id and an optional tilt field.
 * id: the xml:id attribute
 * tilt: the tilt field. This is optional so the field might be null.
 */
class NeumeComponent {
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
 * On top of `id` and `tilt`, the component also contains:
 * - pname: pitch name of the note. (e.g. "d")
 * - oct: octave of the note. (e.g. 8)
 */
export class NeumeComponentSQ extends NeumeComponent {
    constructor(id, pname, oct, tilt) {
        super(id, tilt);
        this.pname = pname;
        this.oct = oct;
    }
}

/**
 * The Neume Component class for Square notation.
 * On top of `id` and `tilt`, the component also contains:
 * @param loc location of the note relative to the staff
 */
export class NeumeComponentAQ extends NeumeComponent {
    constructor(id, loc, tilt) {
        super(id, tilt);
        this.loc = loc;
    }
}