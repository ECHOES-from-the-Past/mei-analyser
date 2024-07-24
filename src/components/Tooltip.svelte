<button
    class="tooltip"
    id="pattern-search-tooltip"
    popovertarget="pattern-search-tooltip-content"
>
    ⓘ
</button>

<div class="tooltip-content" id="pattern-search-tooltip-content" popover>
    <ul>
        <li>
            <p>
                <b>Exact pitch (only for Square music script chants)</b>: Enter
                pitch names of the melodic pattern. For example, "a b a f" will
                search for a melodic pattern that follows the sequence A-B-A-F.
                <!-- Use uppercase letters for a lower octave and lowercase letters for an upper octave. -->
            </p>
        </li>
        <li>
            <p>
                <b> Contour (Melodic intervals) </b> in the form of positive or negative
                integers (e.g., +1 indicates one step up - either a semitone or a
                tone - from the previous note; 0 indicates unison; and -2 indicates
                two steps down - either a major or minor third - from the previous
                note). When looking for a series of notes, the integers can be separated
                by a space (e.g., "0 +2 -1 +1 +1").
            </p>
        </li>
    </ul>
</div>

<style>
    .tooltip {
        color: white;
        font-weight: bold;
        cursor: pointer;
        background-color: var(--button);
        padding: 0.1rem 0.5rem;
        border-radius: 0.5rem;
    }

    .tooltip-content {
        padding: 2rem;
        margin: 8rem;
        background-color: var(--background);
        border: 4px solid var(--button);
        border-radius: 0.5rem;
    }
</style>
