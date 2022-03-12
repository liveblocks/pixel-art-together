<script lang="ts">
  import { onMount } from 'svelte'
  import { contrastingTextColour } from '$lib/utils/contrastingTextColour'

  export let brush: {}
  export let selectedLayer: string
  export let name: string
  export let picture: string
  export let tool: string

  let getColorName: (hex: string) => string = hex => hex

  onMount(async () => {
    const { default: ntc } = await import('$lib/utils/nameThatColor.js')
    getColorName = hex => ntc.name(hex)[1]
  })

  let blackText = false
  $: {
    if (brush.opacity < 35) {
      blackText = true
    } else {
      blackText = contrastingTextColour(brush.rgb)
    }
  }
</script>

<div class="h-16 flex items-center justify-between px-5">
  <div class="flex items-center overflow-hidden">
    <div class="transparent-bg w-10 h-10 relative">
      <img
        alt="{name}'s avatar"
        src={picture}
      />
    </div>
    <div class="pl-3">
      <div class="font-medium">{name}</div>
      <div class="text-sm text-gray-500 truncate mr-2 max-w-[160px] w-full">
        <span class="font-semibold">Layer {selectedLayer}</span>, {getColorName(brush.color.slice(0, 7))}
      </div>
    </div>
  </div>
  <div class="transparent-bg w-[36px] h-[36px] relative">
    <div class="inner-border absolute inset-0 rounded-[4px] flex justify-center items-center mix" style="background: {brush.color};">
      <div class="{blackText ? 'text-black' : 'text-white'}">
        {#if tool === 'brush'}
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z" />
          </svg>
        {/if}
        {#if tool === 'eraser'}
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z" />
          </svg>
        {/if}
        {#if tool === 'fill'}
          <svg class="w-6 h-6 mt-1.5 ml-0.5 scale-x-[-1]" viewBox="0 0 24 24">
            <path fill="currentColor"  d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z" />
          </svg>
        {/if}
      </div>
    </div>
  </div>
</div>
