<script>
    import TextInput from "../components/TextInput.svelte";
    import Section from "../components/Section.svelte";
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import { env } from "../utility/utils";
    import { Chant } from "../utility/components";
    import { getNeumeComponentList } from "../utility/components";

    let testChart;

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
        console.log(notes);

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

        let chantData = [];
        for (let i in counts) {
            chantData.push({
                x: `loc ${i}`,
                y: counts[i],
            });
        }

        new Chart(testChart, {
            type: "bar",
            data: {
                datasets: [
                    {
                        data: chantData,
                    },
                ],
            },
        });
    });
</script>

<div id="experimental-panel" hidden>
    <Section>
        <canvas id="chart-test" bind:this={testChart}></canvas>
    </Section>
</div>

<style>
</style>
