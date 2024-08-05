<script>
    import TextInput from "../components/TextInput.svelte";
    import Section from "../components/Section.svelte";
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import { env } from "../utility/utils";
    import { Chant } from "../utility/components";
    import { getNeumeComponentList } from "../utility/components";

    class ChartDataset {}

    let testChart1, testChart2;

    const databaseURL =
        env == "development" ? "src/database/database.json" : "./database.json";

    onMount(async () => {
        /** Retrieving the locally stored list of chants */
        let resultChantList = await fetch(databaseURL).then((response) =>
            response.json(),
        );
        /** @type {Chant} */
        const testChant = resultChantList[0];

        let notes = getNeumeComponentList(testChant.syllables);
        // console.log(notes);

        const pitchFrequency = notes.map((nc) => {
            if (testChant.notationType == "aquitanian") return nc.loc;
            if (testChant.notationType == "square") return nc.pitch;
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

        const finalis = notes[notes.length - 1];

        const rhumbus = notes.filter((nc) => nc.tilt == "se")
        console.log(rhumbus)

        const normalBg = "rgba(255, 99, 132, 0.2)",
            finalisBg = "rgba(75, 192, 192, 0.2)";
        const normalBorder = "rgb(255, 99, 132)",
            finalisBorder = "rgb(75, 192, 192)";

        let chantData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                },
                {
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                },
            ],
        };

        for (let key in counts) {
            chantData.datasets[0].data.push(counts[key]);

            if (key == finalis.loc) {
                chantData.labels.push(`${key} (finalis)`);
                chantData.datasets[0].backgroundColor.push(finalisBg);
                chantData.datasets[0].borderColor.push(finalisBorder);
            } else {
                chantData.labels.push(key);
                chantData.datasets[0].backgroundColor.push(normalBg);
                chantData.datasets[0].borderColor.push(normalBorder);
            }
        }

        new Chart(testChart1, {
            type: "bar",
            data: chantData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Chart.js Bar Chart - Stacked",
                    },
                },
                // responsive: true,
                // interaction: {
                //     intersect: false,
                // },
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
        // end of creating chart
    });
</script>

<div id="experimental-panel">
    <Section>
        <canvas bind:this={testChart1}></canvas>
        <!-- <canvas bind:this={testChart2}></canvas> -->
    </Section>
</div>

<style>
    canvas {
        width: 42rem;
        height: 36rem;
    }
</style>
