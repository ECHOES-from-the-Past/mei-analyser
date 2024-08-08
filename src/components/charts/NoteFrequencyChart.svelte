<script>
    /*
     * The chart analysis produces a chart that analyse an input chant
     */
    import { Chart } from "chart.js/auto";
    import { getNeumeComponentList } from "../../utility/components";
    import { onMount } from "svelte";
    import { Chant } from "../../utility/components";
    /** @type {Chant} */
    export let chant;

    // The place for the chart
    let chart;

    onMount(() => {
        let neumeComponents = getNeumeComponentList(chant.syllables);

        let noteCounts = {
            regular: {},
            rhombus: {},
        };

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

        let sortedCounts = {
            regular: new Map(),
            rhombus: new Map(),
        };

        for (let i in noteCounts) {
            console.log(noteCounts[i]);
            // Sort the countings of pitches
            let sortedKeys = Object.keys(noteCounts[i]).sort((a, b) => a - b);

            let sortedMap = sortedCounts[i];
            sortedKeys.forEach((e, idx, arr) => {
                let value = sortedKeys[idx];
                sortedMap.set(`${e}`, noteCounts[i][value]);
            });
        }

        console.log(sortedCounts);

        const normalBg = "rgba(255, 99, 132, 0.2)",
            rhombusBg = "rgba(55, 99, 132, 0.2)";
        const normalBorder = "rgb(255, 99, 132)",
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
                    stack: "0",
                },
                {
                    label: "Rhombus",
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                    stack: "0",
                },
            ],
        };

        Object.keys(sortedCounts).forEach((e, i, arr) => {
            // e is 'regular' and 'rhombus'
            for (let es of sortedCounts[e].keys()) {
                if (!chantData.labels.includes(es)) {
                    chantData.labels.push(es);
                }
                console.log(es);
                chantData.datasets[i].data.push(sortedCounts[e].get(es));
                chantData.datasets[i].backgroundColor.push(
                    e == "regular" ? normalBg : rhombusBg,
                );
                chantData.datasets[i].borderColor.push(
                    e == "regular" ? normalBorder : rhombusBorder,
                );
            }
        });

        console.log(chantData);

        new Chart(chart, {
            type: "bar",
            data: chantData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Notes frequency chart (${chant.notationType})`,
                    },
                },
                responsive: true,
                interaction: {
                    intersect: false,
                },
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                    },
                },
            },
        });
    });
</script>

<canvas bind:this={chart} />
