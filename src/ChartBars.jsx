import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

import ChartBarsRect from './ChartBarsRect'
import ChartAxis from './ChartAxis'
import ChartGrid from './ChartGrid'
import ChartTooltip from './ChartTooltip'
import {
  getLabeledAxis,
  getValuedAxis,
  getLabelScale,
  getValueScale,
  renderEmptyChart,
  getValueGrid,
  getLabelGrid,
  getTooltipPositionAndLayout,
} from './utils'

//
// ChartBars renders a set of SVG
// rectangles to be used in a bar chart
//
// "data" expected to be an array of objects:
// [{label: 'x label', value: 'value at x label'} ...]
//
//

const initialTooltipState = {
  layout: {
    horizontal: 'right',
    vertical: 'bottom',
  },
  position: {
    x: 0,
    y: 0,
  },
  data: {
    label: [],
  },
  visible: false,
}

const RenderAxisLabel = ({ label, ...props }) => {
  return (
    <g {...props}>
      <text textAnchor="middle">{label}</text>
    </g>
  )
}

class ChartBars extends Component {
  constructor(props) {
    super(props)

    this.state = {
      chartWidth: 0,
      tooltip: initialTooltipState,
    }
  }

  componentWillMount() {
    this.setState({
      chartWidth: this.props.chartWidth,
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.data !== nextProps.data ||
      this.state.chartWidth !== nextProps.chartWidth ||
      this.state.tooltip !== nextState.tooltip
    )
  }

  componentWillUpdate(nextProps) {
    this.setState({
      chartWidth: nextProps.chartWidth,
    })
  }

  isHorizontal() {
    return this.props.layout === 'horizontal'
  }

  getValueScale() {
    const max = d3.max(this.props.data, d => d.value)
    const size = this.isHorizontal() ? this.state.chartWidth : this.props.chartHeight
    return getValueScale(0, max, size, this.isHorizontal())
  }

  getLabelScale() {
    const data = this.props.data
    let size = this.isHorizontal() ? this.props.chartHeight : this.state.chartWidth

    if (this.props.barThickness) {
      size = data.length * this.props.barThickness
    }

    return getLabelScale(data, size, this.isHorizontal(), this.props.barInnerPadding)
  }

  getLabelAxis() {
    const { data, chartType } = this.props
    const xScale = this.getLabelScale()
    const xAxisLabels = data.map(d => d.label)
    return getLabeledAxis(chartType, xScale, xAxisLabels, this.isHorizontal())
  }

  getValueAxis() {
    const yScale = this.getValueScale()
    const size = this.isHorizontal() ? this.props.chartHeight : this.state.chartWidth
    const max = d3.max(this.props.data, d => d.value)
    return getValuedAxis(yScale, size, max, this.isHorizontal())
  }

  getValueGrid() {
    const yScale = this.getValueScale()
    const labelScaleSize = this.isHorizontal() ? this.props.chartHeight : this.state.chartWidth
    return getValueGrid(yScale, labelScaleSize, this.isHorizontal())
  }

  getLabelGrid() {
    const xScale = this.getLabelScale()
    const valueScaleSize = this.isHorizontal() ? this.state.chartWidth : this.props.chartHeight
    return getLabelGrid(xScale, valueScaleSize, this.props.data, this.isHorizontal())
  }

  renderAxis() {
    const { chartHeight } = this.props
    const yAxis = this.isHorizontal() ? this.getLabelAxis() : this.getValueAxis()
    const xAxis = this.isHorizontal() ? this.getValueAxis() : this.getLabelAxis()

    return (
      <g>
        <ChartAxis height={chartHeight} axisFunction={yAxis} axisType="y" />
        <ChartAxis height={chartHeight} axisFunction={xAxis} axisType="x" rotate={this.props.xAxisValueLabelRotate} />
      </g>
    )
  }

  renderAxisLabels() {
    const { chartHeight, chartWidth, chartMargin, xAxisUnitLabel, yAxisUnitLabel } = this.props
    const verticalTransform = `rotate(-90)translate(-${chartHeight / 2}, -${(chartMargin.right + chartMargin.left) /
      2})`
    const horizontalTransform = `translate(${chartWidth / 2},${chartHeight + 30})`
    const xAxisTransform = this.isHorizontal() ? verticalTransform : horizontalTransform
    const yAxisTransform = this.isHorizontal() ? horizontalTransform : verticalTransform

    return (
      <g>
        {xAxisUnitLabel && <RenderAxisLabel transform={xAxisTransform} label={xAxisUnitLabel} />}
        {yAxisUnitLabel && <RenderAxisLabel transform={yAxisTransform} label={yAxisUnitLabel} />}
      </g>
    )
  }

  renderGrids() {
    const xGrid = this.isHorizontal() ? this.getValueGrid() : this.getLabelGrid()
    const yGrid = this.isHorizontal() ? this.getLabelGrid() : this.getValueGrid()

    return (
      <g>
        <ChartGrid height={this.props.chartHeight} axisFunction={yGrid} axisType="y" />
        <ChartGrid height={this.props.chartHeight} axisFunction={xGrid} axisType="x" />
      </g>
    )
  }

  renderBars() {
    const { data, chartHeight, onBarClick, onBarMouseOver, onBarMouseOut, barColor } = this.props
    const showTooltip = this.showTooltip
    const hideTooltip = this.hideTooltip
    const moveTooltip = this.moveTooltip
    const chartWidth = this.state.chartWidth

    const valueScale = this.getValueScale()
    const labelScale = this.getLabelScale()
    const labelAxisFormatter = this.getLabelAxis().tickFormat()

    const isHorizontal = this.isHorizontal()
    const sizeFactor = isHorizontal ? chartWidth : chartHeight

    const bars = data.map(function(point, i) {
      // calculate position of bar
      const y = valueScale(point.value)
      const barHeight = sizeFactor - y
      const barWidth = labelScale.bandwidth()
      const x = labelScale(point.label)

      // for tooltips, we need the formatted label for the x value,
      // we also need the x position + 1/2 the bar width to correctly
      // line up the tooltip
      point.formattedLabel = labelAxisFormatter(point.label)
      point.tooltipXPosition = isHorizontal ? y - (chartWidth - barHeight) / 2 : x + barWidth / 2

      return (
        <ChartBarsRect
          index={i}
          data={point}
          height={isHorizontal ? barWidth : barHeight}
          width={isHorizontal ? chartWidth - barHeight : barWidth}
          x={isHorizontal ? 0 : x}
          y={isHorizontal ? x : y}
          key={i}
          onBarClick={onBarClick}
          onBarMouseOver={onBarMouseOver}
          onBarMouseOut={onBarMouseOut}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          color={barColor}
          moveTooltip={moveTooltip}
        />
      )
    })

    return bars
  }

  renderEmptyChart() {
    return renderEmptyChart(this.props.emptyChartMessage)
  }

  renderBarChart() {
    const { showGrid, showAxes, showBarTooltip, xAxisUnitLabel, yAxisUnitLabel } = this.props

    return (
      <g>
        {showGrid && this.renderGrids()}
        {showAxes && this.renderAxis()}
        {(xAxisUnitLabel || yAxisUnitLabel) && this.renderAxisLabels()}
        <g className="Chart__bars-arcs">{this.renderBars()}</g>
        {showBarTooltip && <ChartTooltip tooltip={this.state.tooltip} />}
      </g>
    )
  }

  render() {
    return !this.props.data || !this.props.data.length ? this.renderEmptyChart() : this.renderBarChart()
  }

  showTooltip = (data, e) => {
    const { layout, position } = getTooltipPositionAndLayout(e)

    this.setState({
      tooltip: {
        layout,
        position,
        data: {
          label: data.tooltipContent || [data.formattedLabel, data.value],
        },
        visible: true,
      },
    })
  }

  moveTooltip = (data, e) => {
    const { layout, position } = getTooltipPositionAndLayout(e)

    this.setState({
      tooltip: {
        ...this.state.tooltip,
        layout,
        position,
      },
    })
  }

  hideTooltip = () => {
    this.setState({
      tooltip: {
        ...this.state.tooltip,
        data: {
          label: [],
        },
        visible: false,
      },
    })
  }
}

ChartBars.propTypes = {
  chartHeight: PropTypes.number,
  chartWidth: PropTypes.number,
  showAxes: PropTypes.bool,
  showGrid: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.any.isRequired,
      // tooltipContent should be an array of strings or numbers,
      // each array item is a newline in the tooltip. there may be
      // additional lines if the tooltip content needs to wrap.
      tooltipContent: PropTypes.arrayOf(PropTypes.string, PropTypes.number),
    }),
  ).isRequired,
  chartType: PropTypes.oneOf(['date', 'integer', 'string']),
  onBarClick: PropTypes.func,
  onBarMouseOver: PropTypes.func,
  onBarMouseOut: PropTypes.func,
  showBarTooltip: PropTypes.bool,
  emptyChartMessage: PropTypes.any,
  xAxisValueLabelRotate: PropTypes.number,
  xAxisUnitLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  yAxisUnitLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  layout: PropTypes.oneOf(['vertical', 'horizontal']),
  barThickness: PropTypes.number,
  barInnerPadding: PropTypes.number,
  barColor: PropTypes.oneOf(['orange']),
}

ChartBars.defaultProps = {
  chartType: 'date',
  showGrid: true,
  showAxes: true,
  showBarTooltip: true,
  xAxisValueLabelRotate: -30,
  layout: 'vertical',
  barInnerPadding: 0.1,
}

export default ChartBars
