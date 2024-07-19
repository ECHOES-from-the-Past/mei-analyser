<script>
    $: hidden = false;

    function toggle() {
        hidden = !hidden;
    }
</script>

<div id="refresh-wheel" hidden={hidden}></div>

<style>
    #refresh-wheel {
        --wheel-border: 0.4rem;
        --wheel-size: 1rem;
        --wheel-duration: 0.64s;

        border: var(--wheel-border) solid var(--background-hover);
        border-radius: 50%;
        border-top: var(--wheel-border) solid var(--button);
        width: 1rem;
        height: 1rem;
        animation: spin var(--wheel-duration) linear infinite;
        -webkit-animation: spin var(--wheel-duration) linear infinite;
    }

    @-webkit-keyframes spin {
        0% {
            -webkit-transform: rotate(0deg);
        }

        100% {
            -webkit-transform: rotate(360deg);
        }
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
</style>
