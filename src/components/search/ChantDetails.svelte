<script>
    import { onMount } from "svelte";
    import { displayCertainty } from "../../utility/utils";
    import NoteFrequencyChart from "../charts/NoteFrequencyChart.svelte";
    import AmbitusChart from "../charts/AmbitusChart.svelte";
    import Section from "../Section.svelte";
    export let chant;
    let chantInfoDiv;

    let info = {
        Title: chant.title,
        Source: chant.source,
        "Music script": chant.notationType,
        Mode: chant.mode == -1 ? "Unknown" : chant.mode,
        "Mode Certainty": displayCertainty(chant.modeCertainty),
        "Mode Description": chant.modeDescription,
        "MEI File": chant.fileName,
        "PEM Database URL": chant.pemDatabaseUrls,
    };

    onMount(() => {
        for (let k in info) {
            let p = document.createElement("p");
            if (k == "PEM Database URL") {
                // Special rendering for PEM Database URL
                p.innerHTML = `<b>${k}</b>: `;
                for (let url of info[k]) {
                    let a = document.createElement("a");
                    a.href = url;
                    a.target = "_blank";
                    a.innerText = url;
                    p.appendChild(a);
                    // Add "or" if it is not the last URL
                    if (info[k].indexOf(url) != info[k].length - 1) {
                        p.innerHTML += " or ";
                    }
                }
            } else if (k == "MEI File") {
                // Links to the GitHub MEI files
                p.innerHTML = `<b>${k}</b>: `;
                const rootGABCtoMEI =
                    "https://github.com/ECHOES-from-the-Past/GABCtoMEI/blob/main/";

                let fileName = chant.fileName;
                let a = document.createElement("a");

                a.href = rootGABCtoMEI + fileName;
                a.target = "_blank";
                a.innerText = `${fileName.split("/").pop()} (GitHub)`; // showing the file name only
                p.appendChild(a);
            } else {
                // Default rendering
                p.innerHTML = `<b>${k}</b>: ${info[k]}`;
            }

            chantInfoDiv.appendChild(p);
        }
    });
</script>

<div id="chant-information">
    <div bind:this={chantInfoDiv}></div>
    <div>
        <Section id="chant-charts">
            <NoteFrequencyChart {chant}></NoteFrequencyChart>
        </Section>
        <Section>
            <AmbitusChart {chant}></AmbitusChart>
        </Section>
    </div>
</div>

<style>
    #chant-information {
        display: grid;
        grid-template-columns: 2fr 2fr;
        gap: 2rem;
        padding: 0 0 2rem 0;
    }
</style>
