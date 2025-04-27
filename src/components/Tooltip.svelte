<script>
    import Button from "./Button.svelte";
    import { Dialog, Tooltip } from "bits-ui";
    import { fly } from "svelte/transition";
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} [title]
     * @property {import('svelte').Snippet} [content]
     */

    /** @type {Props} */
    let { title, content } = $props();
</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Tooltip.Provider>
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
                    <div
                        class="border-2 border-emerald-600 p-2 rounded-lg bg-white"
                    >
                        Need more info?
                    </div>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    </Dialog.Trigger>

    <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content
            transition={fly}
            class="fixed left-[50%] top-[50%] z-50 w-[80%] translate-x-[-50%] translate-y-[-50%] border-4 border-emerald-700 bg-white p-5 rounded-xl shadow-lg"
        >
            <Dialog.Title
                class="flex w-full mb-4 items-center justify-center text-lg font-semibold tracking-tight border-b-2 border-b-emerald-900 border-dotted"
            >
                {#if title}{@render title()}{:else}
                    Tooltip title. To fill in the title, use
                    <code>{`{#snippet title()} Title {/snippet}`}</code>
                    in your component.
                {/if}
            </Dialog.Title>
            <Dialog.Description>
                {#if content}{@render content()}{:else}
                    Tooltip description placeholder. To fill in the content, use
                    <code>{`{#snippet content()} Content, in HTML {/snippet}`}</code>
                    in your component.
                {/if}
            </Dialog.Description>

            <div class="flex w-full justify-center mt-5">
                <Dialog.Close>
                    <Button>Close</Button>
                </Dialog.Close>
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
