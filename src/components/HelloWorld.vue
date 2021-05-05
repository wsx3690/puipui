<template>
  <div class="gauge">
    <svg :viewBox="`0 0 ${diameter} ${height}`" :style="style" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath :id="`clip-bottom-${_uid}`">
          <rect x="0" y="0" :width="diameter" :height="radius + 10" />
        </clipPath>

        <clipPath :id="`clip-min-${_uid}`" v-if="minThreshold">
          <Arc :radius="radius + 2" :thickness="thickness + 4" :offsetY="8" :offsetX="-2" :startAngle="0" :endAngle="minThresholdAngle" />
        </clipPath>

        <clipPath :id="`clip-max-${_uid}`" v-if="maxThreshold">
          <Arc :radius="radius + 2" :thickness="thickness + 4" :offsetY="8" :offsetX="-2" :startAngle="maxThresholdAngle" :endAngle="180" />
        </clipPath>
      </defs>

      <g :clip-path="`url(#clip-bottom-${_uid})`">
        <g :style="rotationStyle">
          <pointer-arcs
            :radius="radius"
            :thickness="thickness"
            :offsetY="10"
            :activeFill="activeFill"
            :inactiveFill="inactiveFill"
            :angle="pointerGap"
          />
        </g>
      </g>

      <g :clip-path="`url(#clip-min-${_uid})`" v-if="minThreshold">
        <g :style="rotationStyle">
          <pointer-arcs
            :radius="radius"
            :thickness="thickness"
            :offsetY="10"
            :activeFill="minThresholdFill"
            :activeStroke="minThresholdFill"
            :activeStrokeWidth="1"
            :inactiveFill="minThresholdFill"
            :inactiveStroke="minThresholdFill"
            :inactiveStrokeWidth="1"
            :angle="pointerGap"
            :style="minThresholdStyle"
          />
        </g>
      </g>

      <g :clip-path="`url(#clip-max-${_uid})`" v-if="maxThreshold">
        <g :style="rotationStyle">
          <pointer-arcs
            :radius="radius"
            :thickness="thickness"
            :offsetY="10"
            :activeFill="maxThresholdFill"
            :activeStroke="maxThresholdFill"
            :activeStrokeWidth="1"
            :inactiveFill="maxThresholdFill"
            :inactiveStroke="maxThresholdFill"
            :inactiveStrokeWidth="1"
            :angle="pointerGap"
            :style="maxThresholdStyle"
          />
        </g>
      </g>

      <g :style="rotationStyle">
        <pointer
          :radius="radius"
          :pointerStroke="pointerStroke"
          :pointerStrokeWidth="pointerStrokeWidth"
          :pivotRadius="pivotRadius"
          :pivotFill="pivotFill"
          :pivotStroke="pivotStroke"
          :pivotStrokeWidth="pivotStrokeWidth"
        />
      </g>

      <labels
        :min="minLabel ? minLabel : min"
        :max="maxLabel ? maxLabel : max"
        :value="displayValue"
        :dp="dp"
        :unit="unit"
        :unitOnArc="unitOnArc"
        :labelsOnArc="labelsOnArc"
        :radius="radius"
        :thickness="thickness"
        :calculatedFontSize="calculatedFontSize"
        :offsetY="10 + pivotRadius / 2"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Gauge',
  props: {
    heading: {
      type: String,
      required: false,
      default: null,
    },
    headingLevel: {
      type: Number,
      required: false,
      default: 2,
    },
    padding: {
      type: Boolean,
      required: false,
      default: true,
    },
    fontSize: {
      type: String,
      required: false,
      default: '1em',
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    minLabel: {
      type: String,
      required: false,
      default: null,
    },
    maxLabel: {
      type: String,
      required: false,
      default: null,
    },
    value: {
      type: Number,
      required: true,
    },
    maxThreshold: {
      type: Number,
      required: false,
      default: null,
    },
    minThreshold: {
      type: Number,
      required: false,
      default: null,
    },
    dp: {
      type: Number,
      required: false,
      default: 0,
    },
    unit: {
      type: String,
      required: false,
      default: null,
    },
    unitOnArc: {
      type: Boolean,
      required: false,
      default: true,
    },
    labelsOnArc: {
      type: Boolean,
      required: false,
      default: true,
    },
    valueToExceedLimits: {
      type: Boolean,
      required: false,
      default: false,
    },
    radius: {
      type: Number,
      required: false,
      default: 215,
    },
    thickness: {
      type: Number,
      required: false,
      default: 70,
    },
    pointerGap: {
      type: Number,
      required: false,
      default: 4,
    },
    pointerStroke: {
      type: String,
      required: false,
      default: 'currentcolor',
    },
    pointerStrokeWidth: {
      type: Number,
      required: false,
      default: 14,
    },
    pivotRadius: {
      type: Number,
      required: false,
      default: 20,
    },
    ...styleProps('pivot', {
      strokeWidth: 2,
      stroke: 'currentcolor',
      fill: 'currentcolor',
    }),
    minThresholdFill: {
      type: String,
      required: false,
      default: 'none',
    },
    maxThresholdFill: {
      type: String,
      required: false,
      default: 'none',
    },
    activeFill: {
      type: String,
      required: false,
      default: 'currentcolor',
    },
    inactiveFill: {
      type: String,
      required: false,
      default: 'currentcolor',
    },
    svgStyle: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
};
</script>
