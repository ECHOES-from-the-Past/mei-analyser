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
            if (chant.notationType == "square") return nc.pitch;
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

        // Sort the countings of pitches
        let sortedKeys = Object.keys(counts).sort((a, b) => a - b);

        let sortedCounts = new Map();
        sortedKeys.forEach((e, i, arr) => {
            let value = sortedKeys[i];
            sortedCounts.set(`${e}`, counts[value]);
        });

        const rhumbus = notes.filter((nc) => nc.tilt == "se");
        // console.log(rhumbus);

        const normalBg = "rgba(255, 99, 132, 0.2)";
        const normalBorder = "rgb(255, 99, 132)";

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
                    label: "Rhumbus",
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                    stack: "0",
                },
            ],
        };

        for (let key of sortedCounts.keys()) {
            chantData.datasets[0].data.push(sortedCounts.get(key));

            chantData.labels.push(key);
            chantData.datasets[0].backgroundColor.push(normalBg);
            chantData.datasets[0].borderColor.push(normalBorder);
        }

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
