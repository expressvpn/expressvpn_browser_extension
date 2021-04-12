<template>
  <svg width="350" height="185">
    <defs :class="['visual-state', `visual-state-${currentInfo.state}`]">
      <radialGradient id="c" cx="50%" cy="50%" r="50.1795332%" fx="50%" fy="50%" gradientTransform="matrix(0 .99642 -1 0 1 .001789)">
        <stop offset="0%" />
        <stop offset="100%" />
      </radialGradient>
      <radialGradient id="d" cx="50%" cy="50%" r="50.2331002%" fx="50%" fy="50%" gradientTransform="matrix(0 .99536 -1 0 1 .00232)">
        <stop offset="0%" />
        <stop offset="100%" />
      </radialGradient>
      <radialGradient id="e" cx="50%" cy="50%" r="50.166113%" fx="50%" fy="50%" gradientTransform="matrix(0 .99669 -1 0 1 .0016555)">
        <stop offset="0%" />
        <stop offset="100%" />
      </radialGradient>
      <path id="a" d="M0 0h350v185H0z"/>
      <path id="g" d="M99 276h360v5H99z"/>
      <filter id="f" width="106.7%" height="580%" x="-3.3%" y="-240%" filterUnits="objectBoundingBox">
        <feOffset in="SourceAlpha" result="shadowOffsetOuter1"/>
        <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="4"/>
        <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
      </filter>
    </defs>
    <g fill="none" fill-rule="evenodd">
      <mask id="b" fill="#fff">
        <use xlink:href="#a"/>
      </mask>
      <use fill="#F4A377" transform="matrix(1 0 0 -1 0 185)" xlink:href="#a"/>
      <g mask="url(#b)">
        <g transform="translate(-103 -94)">
          <ellipse cx="278.5" cy="279.5" fill="url(#c)" rx="278.5" ry="279.5"/>
          <ellipse cx="278.5" cy="278.5" fill="url(#d)" rx="214.5" ry="215.5"/>
          <ellipse cx="278.5" cy="278" fill="url(#e)" rx="150.5" ry="151"/>
          <use fill="#000" filter="url(#f)" xlink:href="#g"/>
        </g>
      </g>
    </g>
</svg>
</template>
<script>
export default {
  name: 'visualState',
};
</script>
<style lang="scss" scoped>
.visual-state {
  radialGradient {
    stop[offset="0%"] {
      stop-color: var(--visual-state-default-0);
    }
    stop[offset="100%"] {
      stop-color: var(--visual-state-default-100);
    }
  }

  &-connecting radialGradient, &-disconnecting radialGradient, &-reconnecting radialGradient {
    stop[offset="0%"] {
      stop-color: var(--visual-state-connecting-0);
    }
    stop[offset="100%"] {
      stop-color: var(--visual-state-connecting-100);
    }
  }

  &-connected radialGradient {
    stop[offset="0%"] {
      stop-color: var(--visual-state-connected-0);
    }
    stop[offset="100%"] {
      stop-color: var(--visual-state-connected-100);
    }
  }
}

@media (prefers-color-scheme: light) {
  .visual-state {
    --visual-state-default-0: #{$eds-color-berry};
    --visual-state-default-100: #{$eds-color-peach};
    --visual-state-connecting-0: #{$eds-color-grey-10};
    --visual-state-connecting-100: #{$eds-color-grey-40};
    --visual-state-connected-0: #{$eds-color-mint-20};
    --visual-state-connected-100: #{$eds-color-neon};
  }
}
@media (prefers-color-scheme: dark) {
  .visual-state {
    --visual-state-default-0: #{$eds-color-peach};
    --visual-state-default-100: #{$eds-color-berry};
    --visual-state-connecting-0: #{$eds-color-grey-40};
    --visual-state-connecting-100: #{$eds-color-grey-10};
    --visual-state-connected-0: #{$eds-color-neon};
    --visual-state-connected-100: #{$eds-color-mint-20};
  }
}
</style>
