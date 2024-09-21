<script>
    import { onMount } from "svelte";
    import AnalysisChart from "./AnalysisChart.svelte";
    import Section from "../Section.svelte";
    import { capitalizeFirstLetter } from "../../utility/utils";
    export let chant;
    let chantInfoDiv;

    let modeCalcLink = document.createElement("a");
    modeCalcLink.rel = "external";
    modeCalcLink.target = "_blank";
    if (chant.notationType == "square") {
        modeCalcLink.innerText = "Mode Detection for Square Script (github.com)";
        modeCalcLink.href =
            "https://github.com/ECHOES-from-the-Past/mei-analyser/wiki/Mode-Detection-for-Square-Script";
    } else if (chant.notationType == "aquitanian") {
        modeCalcLink.innerText = "Mode Detection for Aquitanian Script (github.com)";
        modeCalcLink.href +=
            "https://github.com/ECHOES-from-the-Past/mei-analyser/wiki/Mode-Detection-for-Aquitanian-Script";
    }

    let modeMoreInfoLink = document.createElement("p");
    modeMoreInfoLink.innerHTML =
        "For more information, see ";
    modeMoreInfoLink.append(modeCalcLink);

    let info = {
        Title: chant.title,
        Source: chant.source,
        "Music Script": capitalizeFirstLetter(chant.notationType),
        "Possible Mode(s)":
            chant.mode == -1 ? "Unknown" : chant.mode.join(", "),
        "Mode Description": chant.modeDescription + modeMoreInfoLink.outerHTML,
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
        <Section>
            <AnalysisChart {chant}></AnalysisChart>
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
