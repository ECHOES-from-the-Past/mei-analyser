<script>
    /*
     * The chart analysis produces a chart that analyse an input chant
     */
    import { Chant } from "../../utility/components";
    import { Chart } from "chart.js/auto";
    import { getNeumeComponentList } from "../../utility/components";
    import { onMount } from "svelte";
    /** @type {Chant} */
    export let chant;

    // The place for the chart
    let chart;

    onMount(() => {
        let notes = getNeumeComponentList(chant.syllables);
        const pitchFrequency = notes.map((nc) => {
            if (chant.notationType == "aquitanian") return nc.loc;
            if (chant.notationType == "square")
                return `${nc.pitch}${nc.octave}`;
        });

        let counts = {};
        // Count the frequency of each note
        pitchFrequency.forEach((note) => {
            if (counts[note] === undefined) {
                counts[note] = 1;
            } else {
                counts[note] += 1;
            }
        });

        let sortedKeys = Object.keys(counts).sort((a, b) => a - b);

        let sortedCounts = new Map();
        sortedKeys.forEach((e, i, arr) => {
            let value = sortedKeys[i];
            sortedCounts.set(`${e}`, counts[value]);
        });

        let noteCounts = {
            rhombus: {},
            regular: {},
        };

        let neumeComponents = notes;
        neumeComponents.map((nc) => {
            let note;
            if (chant.notationType == "aquitanian") {
                note = nc.loc;
            } else if (chant.notationType == "square") {
                note = nc.pitch;
            }

            if (nc.tilt == "se") {
                if (noteCounts.rhombus[note] === undefined) {
                    noteCounts.rhombus[note] = 1;
                } else {
                    noteCounts.rhombus[note] += 1;
                }
            } else {
                if (noteCounts.regular[note] === undefined) {
                    noteCounts.regular[note] = 1;
                } else {
                    noteCounts.regular[note] += 1;
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

        const finalis = notes[notes.length - 1];

        const normalBg = "rgba(125, 179, 102, 0.2)";
        const normalBorder = "rgb(125, 179, 102)";
        const redBg = "rgba(255, 99, 132, 0.2)",
            rhombusBg = "rgba(55, 99, 132, 0.2)";
        const redBorder = "rgb(255, 99, 132)",
            rhombusBorder = "rgb(55, 99, 132)";

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

        for (let key of sortedCounts.keys()) {
            chantData.datasets[0].data.push(sortedCounts.get(key));

            if (
                key == finalis.loc ||
                key == `${finalis.pitch}${finalis.octave}`
            ) {
                chantData.labels.push(`${key} (finalis)`);
            } else {
                chantData.labels.push(key);
            }
            chantData.datasets[0].backgroundColor.push(normalBg);
            chantData.datasets[0].borderColor.push(normalBorder);
        }

        // Adding rhombus
        if(chant.notationType == "aquitanian") {
            Object.keys(sortedCountsFreq).forEach((element, i, arr) => {
                // e is 'regular' and 'rhombus'
                for (let key of sortedCountsFreq[element].keys()) {
                    if (!chantData.labels.includes(key)) {
                        chantData.labels.push(`${key}`);
                    }
                    chantData.datasets[i].data.push(sortedCountsFreq[element].get(key));
                    chantData.datasets[i].backgroundColor.push(
                        element == "regular" ? normalBg : rhombusBg,
                    );
                    chantData.datasets[i].borderColor.push(
                        element == "regular" ? normalBorder : rhombusBorder,
                    );
                }
            });
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
