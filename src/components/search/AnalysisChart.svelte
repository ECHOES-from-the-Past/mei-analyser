<script>
    /*
     * The chart analysis produces a chart that analyse an input chant
     */
    import { Chant, septenaryToPitchOctave, toSeptenary } from "../../utility/components";
    import { Chart } from "chart.js/auto";
    import { getNeumeComponentList } from "../../utility/components";
    import { NeumeComponent } from "../../utility/components";
    import { onMount } from "svelte";
    /** @type {Chant} */
    export let chant;

    // The place for the chart
    let chart;

    // Colours
    const normalBg = "rgba(125, 179, 102, 0.2)";
    const normalBorder = "rgb(125, 179, 102)";
    const redBg = "rgba(255, 99, 132, 0.2)",
        rhombusBg = "rgba(55, 99, 132, 0.2)";
    const redBorder = "rgb(255, 99, 132)",
        rhombusBorder = "rgb(55, 99, 132)";

    /**
     * Take the Aquitanian neume component list, output useable chant data for the chart
     *
     * @param {NeumeComponent[]} chantNC
     */
    function getChantDataAquitanian(chantNC) {
        let chantData = {
            labels: [],
            datasets: [
                {
                    label: "Number of notes",
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                },
                {
                    label: "Rhombus",
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                },
            ],
        };

        const pitchList = chantNC.map((nc) => {
            return nc.loc;
        });

        let noteCounts = {
            rhombus: {},
            regular: {},
        };

        chantNC.map((nc) => {
            let note = nc.loc;

            if (nc.tilt == "se") {
                if (noteCounts.rhombus[note] === undefined) {
                    noteCounts.rhombus[note] = 1;
                } else {
                    noteCounts.rhombus[note] += 1;
                }
            }
        });

        let sortedCountsFreq = {
            regular: new Map(),
            rhombus: new Map(),
        };

        for (let i in noteCounts) {
            // Sort the countings of pitches
            let sortedKeys = Object.keys(noteCounts[i]).sort((a, b) => a - b);

            let sortedMap = sortedCountsFreq[i];
            sortedKeys.forEach((e, idx, arr) => {
                let value = sortedKeys[idx];
                sortedMap.set(`${e}`, noteCounts[i][value]);
            });
        }

        const finalis = chantNC[chantNC.length - 1];

        // Adding rhombus
        // TODO: Subtract the number of rhombus from the chart
        Object.keys(sortedCountsFreq).forEach((element, i, arr) => {
            // e is 'regular' and 'rhombus'
            for (let key of sortedCountsFreq[element].keys()) {
                if (!chantData.labels.includes(key)) {
                    chantData.labels.push(`${key}`);
                }
                chantData.datasets[i].data.push(
                    sortedCountsFreq[element].get(key),
                );
                chantData.datasets[i].backgroundColor.push(
                    element == "regular" ? normalBg : rhombusBg,
                );
                chantData.datasets[i].borderColor.push(
                    element == "regular" ? normalBorder : rhombusBorder,
                );
            }
        });

        chantNC.forEach((e, i, arr) => {});

        return chantData;
    }

    /**
     * Take the Square neume component list, output useable chant data for the chart
     *
     * @param {NeumeComponent[]} chantNC
     */
    function getChantDataSquare(chantNC) {
        let chantData = {
            labels: [],
            datasets: [
                {
                    label: "Number of notes",
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                },
            ],
        };

        let counts = {}
        let lowestSeptenary = 99, highestSeptenary = 0, temp;
        let pitchList = chantNC.map((nc) => {
            temp = toSeptenary(nc);
            if (temp > highestSeptenary) highestSeptenary = temp;
            if (temp < lowestSeptenary) lowestSeptenary = temp;
            return `${nc.pitch}${nc.octave}`;
        });

        console.log(septenaryToPitchOctave(lowestSeptenary), septenaryToPitchOctave(highestSeptenary))

        let highestNote = septenaryToPitchOctave(highestSeptenary);
        let lowestNote = septenaryToPitchOctave(lowestSeptenary);

        for (let i = lowestSeptenary; i <= highestSeptenary; i++) {
            let note = septenaryToPitchOctave(i);
            counts[note] = 0;
        }

        // Find the lowest note and find the highest note
        // Construct the entire range
        // Append count to all notes

        const finalis = chantNC[chantNC.length - 1];

        // Count the frequency of each note
        pitchList.forEach((note) => {
                counts[note] += 1;
        });

        let ambitusCount = new Map();

        let sortedKeys = Object.keys(counts).sort((a, b) => a - b);
        sortedKeys.forEach((e, i, arr) => {
            let value = sortedKeys[i];
            ambitusCount.set(`${e}`, counts[value]);
        });

        // chantNC.forEach((nc, i, arr) => {});

        for (let key of ambitusCount.keys()) {
            if (key == `${finalis.pitch}${finalis.octave}`) {
                chantData.labels.push(`${key} (finalis)`);
            } else {
                chantData.labels.push(key);
            }
            chantData.datasets[0].data.push(ambitusCount.get(key));
            chantData.datasets[0].backgroundColor.push(normalBg);
            chantData.datasets[0].borderColor.push(normalBorder);
        }

        return chantData;
    }

    // Basically the main function of the analysis chart
    onMount(() => {
        let notes = getNeumeComponentList(chant.syllables);
        let chantData;

        if (chant.notationType == "aquitanian") {
            chantData = getChantDataAquitanian(notes);
        } else if (chant.notationType == "square") {
            chantData = getChantDataSquare(notes);
        }

        new Chart(chart, {
            type: "bar",
            data: chantData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Frequency of the notes across the chant ambitus`,
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            padding: 1,
                            text: "Ambitus",
                        },
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: "Frequency",
                        },
                    },
                },
            },
        });
    });
</script>

<canvas bind:this={chart}> </canvas>
