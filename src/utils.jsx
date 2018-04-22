import * as d3 from 'd3'
import React from 'react'

export const TICK_COUNT_LIMIT = 20
export const PX_SPACING_BETWEEN_VALUE_TICKS = 50

export const getLabeledAxis = (type, scale, labels, isHorizontal = false, showAllTicks = false) => {
  const d3Axis = isHorizontal ? d3.axisLeft(scale) : d3.axisBottom(scale)
  let axisLabels = labels.slice()

  const isLargeDataset = axisLabels.length > TICK_COUNT_LIMIT
  if (isLargeDataset && !showAllTicks) {
    const numberOfTicks = getNumberOfTicks(axisLabels.length)
    axisLabels = axisLabels.filter((d, i) => !(i % numberOfTicks))
  }

  switch (type) {
    case 'date':
      const dateFormat = isLargeDataset ? '%x' : '%b %y'
      return d3Axis.tickValues(axisLabels).tickFormat(d3.utcFormat(dateFormat))
    case 'integer':
      return d3Axis.tickValues(axisLabels).tickFormat(d3.format('d'))
    case 'string':
      return d3Axis.tickValues(axisLabels).tickFormat(d => d)
    default:
      return d3Axis
  }
}

export const getValuedAxis = (scale, size, valueMax, isHorizontal = false) => {
  const numberFormat = valueMax > 1000 ? d3.formatPrefix(',.1', 1e3) : null

  if (!isHorizontal) {
    const numberOfTicks = size / PX_SPACING_BETWEEN_VALUE_TICKS

    return d3
      .axisLeft(scale)
      .ticks(numberOfTicks)
      .tickFormat(numberFormat)
  }

  return d3.axisBottom(scale).tickFormat(numberFormat)
}

export const getLabelScale = (data, size, isHorizontal = false, innerPadding = 0.1) => {
  const range = isHorizontal ? [size, 0] : [0, size]
  return d3
    .scaleBand()
    .domain(data.map(d => d.label))
    .range(range)
    .paddingInner(innerPadding)
}

export const getValueScale = (valueMin, valueMax, size, isHorizontal = false) => {
  const range = isHorizontal ? [0, size] : [size, 0]
  return d3
    .scaleLinear()
    .domain([valueMin, valueMax])
    .range(range)
}

export const getValueGrid = (scale, size, isHorizontal = false) => {
  if (!isHorizontal) {
    const numberOfTicks = size / PX_SPACING_BETWEEN_VALUE_TICKS
    return d3
      .axisLeft(scale)
      .ticks(numberOfTicks)
      .tickSize(-size)
      .tickFormat('')
  } else {
    return d3
      .axisBottom(scale)
      .tickSize(-size)
      .tickFormat('')
  }
}

export const getLabelGrid = (scale, size, data, isHorizontal = false) => {
  const numberOfTicks = getNumberOfTicks(data.length)
  const tickValues =
    numberOfTicks >= TICK_COUNT_LIMIT
      ? data.map(d => d.label).filter((d, i) => !(i % numberOfTicks))
      : data.map(d => d.label)
  const axis = !isHorizontal ? d3.axisBottom(scale) : d3.axisLeft(scale)
  return axis
    .tickValues(tickValues)
    .tickSize(-size)
    .tickFormat('')
}

export const getNumberOfTicks = count => {
  return count > TICK_COUNT_LIMIT ? Math.floor(count / 15) : count
}

export const renderEmptyChart = message => {
  return (
    <g className="empty-chart">
      <text>{message}</text>
    </g>
  )
}

/**
 * Get position and layout direction of tooltip
 * @param event - a mouse hover event, usually inside
 *    a <rect> (bar chart) or <path> (pie chart)
 * @param container - DOM node which contains the chart
 * @returns {{layout: {horizontal: string, vertical: string}, position: {x: number, y: number}}}
 */
export const getTooltipPositionAndLayout = (event, container = null) => {
  // get tooltip size
  const tooltip = event.target
    .closest('svg')
    .getElementById('chart-tooltip')
    .getBBox()

  // get the tooltip's container size and offset
  container = container || event.target.closest('g.Chart__bars-arcs')
  const containerOffset = container.getBoundingClientRect()
  const containerSize = container.getBBox()

  // if the cursor position is on the right size of the chart, float tooltip left, and vice versa for left side of chart.
  const horizontalLayout = event.clientX - containerOffset.left > containerSize.width / 2 ? 'left' : 'right'

  // if the cursor position is on the bottom size of the chart, float tooltip up, and vice versa for top side of chart.
  const verticalLayout = event.clientY - containerOffset.top > containerSize.height / 2 ? 'top' : 'bottom'

  // move the tooltip off the cursor an extra, arbitrary amount
  const extraOffset = 10

  // calculate x and y position of the tooltip based on
  // the tooltip size
  const xPosition =
    horizontalLayout === 'right'
      ? event.clientX - containerOffset.left + extraOffset
      : event.clientX - containerOffset.left - tooltip.width - extraOffset
  const yPosition =
    verticalLayout === 'top'
      ? event.clientY - containerOffset.top - tooltip.height - extraOffset
      : event.clientY - containerOffset.top + extraOffset

  return {
    layout: {
      horizontal: horizontalLayout,
      vertical: verticalLayout,
    },
    position: {
      x: xPosition,
      y: yPosition,
    },
  }
}
