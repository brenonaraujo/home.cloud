import { defineComponent, h } from 'vue'

export const CheckmarkIcon = defineComponent({
  name: 'CheckmarkIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'M9 12l2 2 4-4' })
    ])
  }
})

export const BoltIcon = defineComponent({
  name: 'BoltIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M13 10V3L4 14h7v7l9-11h-7z' })
    ])
  }
})

export const CubeIcon = defineComponent({
  name: 'CubeIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('rect', { x: '3', y: '11', width: '4', height: '4' }),
      h('rect', { x: '8', y: '11', width: '4', height: '4' }),
      h('rect', { x: '13', y: '11', width: '4', height: '4' }),
      h('rect', { x: '8', y: '6', width: '4', height: '4' })
    ])
  }
})

export const ChartIcon = defineComponent({
  name: 'ChartIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }),
      h('path', { d: 'M4 12h3l2 3 3-6 2 3h6' })
    ])
  }
})

export const SettingsIcon = defineComponent({
  name: 'SettingsIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('circle', { cx: '12', cy: '12', r: '3' }),
      h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6c.22 0 .43-.04.63-.1H9a2 2 0 1 1 4 0h.09c.2.06.41.1.63.1a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c0 .22.04.43.1.63V9a2 2 0 1 1 0 4h-.09c-.2.06-.41.1-.61.1z' })
    ])
  }
})

export const WorkflowIcon = defineComponent({
  name: 'WorkflowIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('circle', { cx: '6', cy: '6', r: '3' }),
      h('circle', { cx: '18', cy: '6', r: '3' }),
      h('circle', { cx: '6', cy: '18', r: '3' }),
      h('path', { d: 'M9 6h6M6 9v6m12-9v12M9 18h6' })
    ])
  }
})

export const CloudStorageIcon = defineComponent({
  name: 'CloudStorageIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M22 12h-6l-2-3h-4l-2 3H2' }),
      h('path', { d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' })
    ])
  }
})

export const DrawIcon = defineComponent({
  name: 'DrawIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M12 20h9' }),
      h('path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' })
    ])
  }
})

export const ExternalIcon = defineComponent({
  name: 'ExternalIcon',
  props: {
    class: String
  },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
      h('polyline', { points: '15 3 21 3 21 9' }),
      h('line', { x1: '10', y1: '14', x2: '21', y2: '3' })
    ])
  }
})

function strokeIcon(name, nodes) {
  return defineComponent({
    name,
    props: { class: String },
    render() {
      return h('svg', {
        class: this.class,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true'
      }, nodes)
    }
  })
}

export const HomeIcon = strokeIcon('HomeIcon', [
  h('path', { d: 'M3 10.5 12 3l9 7.5' }),
  h('path', { d: 'M5 10v10h14V10' })
])

export const SearchIcon = strokeIcon('SearchIcon', [
  h('circle', { cx: '11', cy: '11', r: '7' }),
  h('path', { d: 'm20 20-3.5-3.5' })
])

export const StarIcon = strokeIcon('StarIcon', [
  h('polygon', { points: '12 3 14.5 8.8 21 9.5 16.2 13.8 17.5 20.2 12 17.2 6.5 20.2 7.8 13.8 3 9.5 9.5 8.8' })
])

export const StarSolidIcon = defineComponent({
  name: 'StarSolidIcon',
  props: { class: String },
  render() {
    return h('svg', {
      class: this.class,
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      'aria-hidden': 'true'
    }, [
      h('polygon', { points: '12 3 14.5 8.8 21 9.5 16.2 13.8 17.5 20.2 12 17.2 6.5 20.2 7.8 13.8 3 9.5 9.5 8.8' })
    ])
  }
})

export const ClockIcon = strokeIcon('ClockIcon', [
  h('circle', { cx: '12', cy: '12', r: '9' }),
  h('path', { d: 'M12 7v5l3 2' })
])

export const UserIcon = strokeIcon('UserIcon', [
  h('circle', { cx: '12', cy: '8', r: '3.5' }),
  h('path', { d: 'M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19' })
])

export const MenuIcon = strokeIcon('MenuIcon', [
  h('path', { d: 'M4 7h16M4 12h16M4 17h16' })
])

export const CloseIcon = strokeIcon('CloseIcon', [
  h('path', { d: 'M6 6l12 12M18 6 6 18' })
])

export const AlertIcon = strokeIcon('AlertIcon', [
  h('path', { d: 'M12 9v4' }),
  h('path', { d: 'M12 17h.01' }),
  h('path', { d: 'M10.3 4.7 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0z' })
])

export const RefreshIcon = strokeIcon('RefreshIcon', [
  h('path', { d: 'M20 12a8 8 0 1 1-2.3-5.7' }),
  h('path', { d: 'M20 5v5h-5' })
])

export const ChevronRightIcon = strokeIcon('ChevronRightIcon', [
  h('path', { d: 'm9 6 6 6-6 6' })
])

export const ArrowLeftIcon = strokeIcon('ArrowLeftIcon', [
  h('path', { d: 'M19 12H5' }),
  h('path', { d: 'm11 18-6-6 6-6' })
])

export const BellIcon = strokeIcon('BellIcon', [
  h('path', { d: 'M18 16v-5a6 6 0 1 0-12 0v5' }),
  h('path', { d: 'M5 16h14' }),
  h('path', { d: 'M9 16v1a3 3 0 0 0 6 0v-1' })
])

export const ReceiptIcon = strokeIcon('ReceiptIcon', [
  h('path', { d: 'M6 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1z' }),
  h('path', { d: 'M9 8h6M9 12h6M9 16h4' })
])

export const InboxIcon = strokeIcon('InboxIcon', [
  h('path', { d: 'M3 12h5l2 3h4l2-3h5' }),
  h('path', { d: 'M3 12v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M7 12V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7' })
])

export const GridIcon = strokeIcon('GridIcon', [
  h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' })
])