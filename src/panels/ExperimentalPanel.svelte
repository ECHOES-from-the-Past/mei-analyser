<script>
    export let hidden = true;
    import Section from "@components/Section.svelte";
    import SearchDropdown from "@components/SearchDropdown.svelte";
    import { onMount } from "svelte";
    let allOptions = [];
    onMount(() => {
        allOptions = [
        "Apple",
        "Banana",
        "Cherry",
        "Date",
        "Elderberry",
        "Fig",
        "Grape",
        "Honeydew",
    ];
    })

</script>

<div id="experimental-panel" {hidden}>
    <Section>
        <SearchDropdown
            id="experimental-dropdown"
            {allOptions}
            placeholder="Search for chant title..."
        />
    </Section>
</div>

<style>
</style>
