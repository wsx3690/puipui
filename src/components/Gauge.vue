<template>
  <div class="gauge" ref="root">
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
import styleProps from '../lib/svgStyleProps';
import { innerAnglePointerAdjustment } from '../lib/chart';
import { easingInverse } from '../lib/easing';
import Arc from './Gauge/Arc.vue';
import Labels from './Gauge/Labels.vue';
import Pointer from './Gauge/Pointer.vue';
import PointerArcs from './Gauge/PointerArcs.vue';

export default {
  name: 'Gauge',
  components: {
    Arc,
    Labels,
    Pointer,
    PointerArcs,
  },
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
  data() {
    return {
      minTransitionDelay: 0,
      maxTransitionDelay: 0,
      calculatedFontSize: null,
      timeStamp: null,
    };
  },
  mounted() {
    this.calculatedFontSize = 15;
    this.date = new Date();
  },
  computed: {
    _uid() {
      return this.timeStamp ? this.hashCode(this.timeStamp) : null;
    },
    style() {
      return {
        fontSize: this.fontSize,
        maxWidth: `${this.diameter}px`,
        maxHeight: `${this.height}px`,
        ...this.svgStyle,
      };
    },
    height() {
      return this.radius + 20 + this.pivotRadius / 2 + this.calculatedFontSize * 6.25;
    },
    inverseMode() {
      return this.min > this.max;
    },
    diameter() {
      return this.radius * 2;
    },
    displayValue() {
      if (this.valueToExceedLimits) {
        return this.value;
      }

      if (this.inverseMode) {
        if (this.value > this.min) {
          return this.min;
        }

        if (this.value < this.max) {
          return this.max;
        }
      } else {
        if (this.value > this.max) {
          return this.max;
        }

        if (this.value < this.min) {
          return this.min;
        }
      }

      return this.value;
    },
    innerAngleAdjustment() {
      return innerAnglePointerAdjustment(this.pointerGap, this.radius, this.radius - this.thickness);
    },
    needleAngle() {
      const angle = this.calcArcAngle(this.displayValue);

      if (angle < 0) {
        return 0;
      }

      if (angle > 180) {
        return 180;
      }

      return angle;
    },
    rotationStyle() {
      return {
        transition: '1s ease-in-out transform',
        transformOrigin: `${this.radius}px ${this.radius + 10}px`,
        willChange: 'transform',
        transform: `rotate(${this.needleAngle}deg)`,
      };
    },
    minThresholdAngle() {
      return this.calcArcAngle(this.minThreshold);
    },
    minThresholdActive() {
      if (this.inverseMode) {
        return this.value >= this.minThreshold;
      }

      return this.value <= this.minThreshold;
    },
    minThresholdStyle() {
      return {
        transitionDelay: `${this.minTransitionDelay}s`,
        transition: 'opacity 0.15s ease-out',
        opacity: this.minThresholdActive ? 1 : 0,
        willChange: 'opacity',
      };
    },
    maxThresholdAngle() {
      return this.calcArcAngle(this.maxThreshold);
    },
    maxThresholdActive() {
      if (this.inverseMode) {
        return this.value <= this.maxThreshold;
      }

      return this.value >= this.maxThreshold;
    },
    maxThresholdStyle() {
      return {
        transitionDelay: `${this.maxTransitionDelay}s`,
        transition: 'opacity 0.15s ease-out',
        opacity: this.maxThresholdActive ? 1 : 0,
        willChange: 'opacity',
      };
    },
  },
  methods: {
    calcArcAngle(value) {
      return ((value - this.min) / (this.max - this.min)) * 180;
    },
    hashCode(s) {
      var h = 0,
        l = s.length,
        i = 0;
      if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
      return h;
    },
  },
  watch: {
    value(newValue, oldValue) {
      const newValueAngle = this.calcArcAngle(newValue);
      const oldValueAngle = this.calcArcAngle(oldValue);
      const easingFunction = easingInverse('ease-in-out');

      this.minTransitionDelay = easingFunction(Math.abs((this.minThresholdAngle - oldValueAngle) / (newValueAngle - oldValueAngle)));

      this.maxTransitionDelay = easingFunction(Math.abs((this.maxThresholdAngle - oldValueAngle) / (newValueAngle - oldValueAngle)));

      return this.newValue;
    },
  },
};
</script>
