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
            if (chant.notationType == "square") return `${nc.pitch}${nc.octave}`;
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

        const finalis = notes[notes.length - 1];

        const normalBg = "rgba(125, 179, 102, 0.2)", finalisBg = "rgba(75, 192, 192, 0.2)";
        const normalBorder = "rgb(125, 179, 102)", finalisBorder = "rgb(75, 192, 192)";


        let chantData = {
            labels: [],
            datasets: [
                {
                    label: 'Number of notes',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                },
            ],
        };

        for (let key of sortedCounts.keys()) {
            chantData.datasets[0].data.push(sortedCounts.get(key));

            if (key == finalis.loc || key == `${finalis.pitch}${finalis.octave}`) {
                chantData.labels.push(`${key} (finalis)`);
                chantData.datasets[0].backgroundColor.push(finalisBg);
                chantData.datasets[0].borderColor.push(finalisBorder);
            } else {
                chantData.labels.push(key);
                chantData.datasets[0].backgroundColor.push(normalBg);
                chantData.datasets[0].borderColor.push(normalBorder);
            }
        }

        new Chart(chart, {
            type: "bar",
            data: chantData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Ambitus chart (${chant.notationType} music script)`,
                    },
                },
                responsive: true,
                interaction: {
                    intersect: false,
                },
            },
        });
    });
</script>

<canvas bind:this={chart}> </canvas>
