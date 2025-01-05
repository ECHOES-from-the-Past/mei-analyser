<script>
    import Button from "./Button.svelte";
    import { Dialog, Tooltip } from "bits-ui";
    import { fly } from "svelte/transition";
</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Tooltip.Root>
            <Tooltip.Trigger
                class="inline-flex size-6 items-center justify-center rounded-full mx-1
	border-2 border-emerald-800 hover:border-emerald-400 shadow-md bg-white transition-colors"
            >
                i
            </Tooltip.Trigger>

            <Tooltip.Content
                transition={fly}
                transitionConfig={{ y: 2, duration: 200 }}
                sideOffset={5}
                side="right"
            >
                <div class="border-2 border-emerald-600 p-2 rounded-lg bg-white"> Need more info? </div>
            </Tooltip.Content>
        </Tooltip.Root>
    </Dialog.Trigger>

    <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content
            transition={fly}
            class="fixed left-[50%] top-[50%] z-50 w-[80%] translate-x-[-50%] translate-y-[-50%] border-4 border-emerald-700 bg-white p-5"
        >
            <Dialog.Title
                class="flex w-full items-center justify-center text-lg font-semibold tracking-tight"
            >
                <slot name="title">
                    Tooltip title. To fill in the title, use
                    <code>{`<div slot="title"> Title </div>`}</code>
                    in your component.
                </slot>
            </Dialog.Title>
            <Dialog.Description>
                <slot name="content">
                    Tooltip description placeholder. To fill in the content, use
                    <code>{`<div slot="content"> Content </div>`}</code>
                    in your component.
                </slot>
            </Dialog.Description>

            <Dialog.Close>
                <Button>Close</Button>
            </Dialog.Close>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>

<style>
    /* .tooltip {
        width: 80%;
        padding: 2rem;
        background-color: var(--background);
        border: 4px solid var(--button);
        border-radius: 0.5rem;
        margin: auto;
    }

    .tooltip-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    } */
</style>
