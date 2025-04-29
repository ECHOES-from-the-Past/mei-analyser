<script>
  import { env } from "@utility/utils";
  import Button from "./Button.svelte";
  import ExternalLink from "./ExternalLink.svelte";

  let clientVersion = $state();
  export function setVersion(version) {
    clientVersion = version;
    if (env == "development") {
      clientVersion += " (development)";
    }
  }
</script>

<div id="navbar" class="flex items-center justify-between gap-3 px-2 pt-2">
    <p class="font-sans text-emerald-900 font-bold">
      <span class="underline">P</span>lainchant
      <span class="underline">A</span>nalyser for <br />
      <span class="underline">M</span>EI Neumes 🎶
    </p>
  <!-- <img src="/images/PAMLogo.png" alt="PAM Logo" class='max-h-20'> -->

  <ExternalLink href="https://github.com/ECHOES-from-the-Past/PAM/wiki">
    <Button>Project Wiki</Button>
  </ExternalLink>
  <ExternalLink href="https://github.com/ECHOES-from-the-Past/PAM">
    <Button>Source Code</Button>
  </ExternalLink>

  <p id="client-version" class="text-base text-emerald-900 ml-auto">
    Version: {clientVersion}
  </p>
</div>
