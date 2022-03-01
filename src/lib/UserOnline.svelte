<script lang="ts">
  import { onMount } from 'svelte'

  export let color: string
  export let selectedLayer: string
  export let name: string
  export let picture: string

  let getColorName: (hex: string) => string = hex => hex

  onMount(async () => {
    const { default: ntc } = await import('$lib/nameThatColor.js')
    console.log(ntc)
    getColorName = hex => ntc.name(hex)[1]
  })
</script>

<div class="h-16 flex items-center justify-between px-5">
  <div class="flex items-center overflow-hidden">
    <div class="transparent-bg w-10 h-10 relative">
      <img
        alt="{name}'s avatar"
        src={picture}
      />
    </div>
    <div class="pl-3 overflow-hidden">
      <div class="font-medium">{name}</div>
      <div class="text-sm text-gray-500 whitespace-nowrap overflow-hidden overflow-ellipsis mr-2">
        <span class="font-semibold">{selectedLayer}</span>, {getColorName(color.slice(0, 7))}</div>
    </div>
  </div>
  <div class="transparent-bg w-[36px] h-[36px] relative">
    <div class="inner-border absolute inset-0 rounded-[4px]" style="background: {color};"></div>
  </div>
</div>
