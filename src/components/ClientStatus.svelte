<script>
    let hidden = $state(true);
    let status = $state("Client status...");

    export function hideStatus() {
        hidden = true;
    }

    export function showStatus(message) {
        hidden = false;
        status = String(message);
    }

    export function updateStatus(message) {
        status = String(message);
    }
</script>

<div class="flex flex-row items-center gap-2 my-2">
    <div
        {hidden}
        class="size-6 border-4 border-t-4 border-emerald-300 border-t-emerald-900 rounded-full animate-spin"
    ></div>
    <span {hidden} class="text-emerald-700 text-semibold"> {status} </span>
</div>
