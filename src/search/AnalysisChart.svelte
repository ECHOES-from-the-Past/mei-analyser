<script>
    /*
     * The chart analysis produces a chart that analyse an input chant
     */
    import {
        Chant,
        septenaryToPitchOctave,
        toSeptenary,
    } from "@utility/components";
    import { Chart } from "chart.js/auto";
    import { getNeumeComponentList } from "@utility/components";
    import { NeumeComponent } from "@utility/components";
    import { onMount } from "svelte";
    import Section from "@/components/Section.svelte";

    /**
     * @typedef {Object} Props
     * @property {Chant} chant
     */

    /** @type {Props} */
    let { chant } = $props();

    // The place for the chart
    let chart = $state();

    // Colours
    const normalBg = "#10b98180",
        normalBorder = "#047857aa";
    const rhombusBg = "#67e8f980",
        rhombusBorder = "#06b6d4aa";

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

        let maxLoc = -99,
            minLoc = 99,
            temp;

        chantNC.forEach((nc) => {
            temp = nc.loc;
            if (temp > maxLoc) maxLoc = temp;
            if (temp < minLoc) minLoc = temp;
            return nc.loc;
        });

        // Construct empty objects of the entire ambitus
        let counts = {},
            rhombus = {};
        for (let i = minLoc; i <= maxLoc; i++) {
            counts[i] = 0;
            rhombus[i] = 0;
        }

        // Count normal notes

        // Count rhombuses
        chantNC.forEach((nc) => {
            if (nc.tilt == "se") {
                rhombus[nc.loc] += 1;
            } else {
                counts[nc.loc] += 1;
            }
        });

        let sortedCountsFreq = {
            regular: new Map(),
            rhombus: new Map(),
        };

        // Sort the countings of pitches
        let sortedKeys = Object.keys(counts).sort((a, b) => a - b);

        sortedKeys.forEach((e, i) => {
            let value = sortedKeys[i];
            sortedCountsFreq.regular.set(`${e}`, counts[value]);
            sortedCountsFreq.rhombus.set(`${e}`, rhombus[value]);
        });

        const finalis = chantNC[chantNC.length - 1];

        // Adding labels
        for (let key of sortedCountsFreq.regular.keys()) {
            if (key == finalis.loc) {
                chantData.labels.push(`${key} (finalis)`);
            } else {
                chantData.labels.push(key);
            }
        }

        // Adding colours
        Object.keys(sortedCountsFreq).forEach((e, i, arr) => {
            // e = 'regular' and 'rhombus'
            for (let key of sortedCountsFreq[e].keys()) {
                chantData.datasets[i].data.push(sortedCountsFreq[e].get(key));
                chantData.datasets[i].backgroundColor.push(
                    e == "regular" ? normalBg : rhombusBg,
                );
                chantData.datasets[i].borderColor.push(
                    e == "regular" ? normalBorder : rhombusBorder,
                );
            }
        });

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

        let counts = {};
        let lowestSeptenary = 99,
            highestSeptenary = 0,
            temp;
        let pitchList = chantNC.map((nc) => {
            temp = toSeptenary(nc);
            if (temp > highestSeptenary) highestSeptenary = temp;
            if (temp < lowestSeptenary) lowestSeptenary = temp;
            return `${nc.pitch}${nc.octave}`;
        });

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
                        font: {
                            size: 18,
                            weight: "bold",
                        },
                    },
                    legend: {
                        labels: {
                            display: true,
                            font: {
                                size: 14,
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            padding: 1,
                            text: "Ambitus",
                            font: {
                                size: 16,
                                weight: "bold",
                            },
                        },
                        ticks: {
                            font: {
                                size: 14,
                            },
                        },
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: "Frequency",
                            font: {
                                size: 16,
                                weight: "bold",
                            },
                        },
                        ticks: {
                            font: {
                                size: 14,
                            },
                        },
                    },
                },
            },
        });
    });
</script>

<div
    class="flex items-center justify-center w-full lg:w-4/5 border-2 rounded-lg border-gray-300 mx-auto mt-4"
>
    <canvas bind:this={chart} class="m-4"> </canvas>
</div>
