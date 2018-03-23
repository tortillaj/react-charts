import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { find, isEqual } from 'lodash-es'

import ChartBarsRect from 'components/chart/ChartBarsRect'
import ChartAxis from 'components/chart/ChartAxis'
import ChartGrid from 'components/chart/ChartGrid'
import ChartTooltip from 'components/chart/ChartTooltip'
import ChartStackedLegend from 'components/chart/ChartStackedLegend'
import {
  getLabeledAxis,
  getValuedAxis,
  getLabelScale,
  getValueScale,
  renderEmptyChart,
  getValueGrid,
  getLabelGrid,
  getTooltipPositionAndLayout,
} from 'utils/chartUtils'

//
// ChartStacked renders a set of SVG
// rectangles to be used in a stacked bar chart
//
// "data" expected to be an array of objects:
// [
//   {
//     label: 'x axis label',
//     values: [{
//       value: 'value at stacked segment label',
//       label: 'stacked segment label',
//       ... any other data properties you added
//     }]
//   }
// ]
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

class ChartStacked extends Component {
  constructor(props) {
    super(props)

    this.state = {
      chartWidth: 0,
      tooltip: initialTooltipState,
      data: [],
      stackData: [],
    }
  }

  componentWillMount() {
    this.setState({
      chartWidth: this.props.chartWidth,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.data, nextProps.data)) {
      this.setState({
        data: this.modifyData(nextProps.data),
        stackData: this.getStackData(nextProps.data),
      })
    }

    if (this.state.chartWidth !== nextProps.chartWidth) {
      this.setState({
        chartWidth: nextProps.chartWidth,
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.stackData !== nextState.stackData ||
      this.state.chartWidth !== nextState.chartWidth ||
      this.state.tooltip !== nextState.tooltip
    )
  }

  isHorizontal() {
    return this.props.layout === 'horizontal'
  }

  getChartInnerWidth = width => {
    // "inner" width matters if the legend is
    // to the right of the chart. we just
    // have to subtract the legend width from the
    // requested chart width.
    return this.props.legendPosition === 'right' ? width - this.props.legendItemWidth - this.props.legendMargin : width
  }

  getChartInnerHeight = height => {
    // "inner" height matters if the legend is
    // to the bottom of the chart. we just
    // have to subtract the legend height from the
    // requested chart height.
    return this.props.legendPosition === 'bottom'
      ? height - this.props.legendItemHeight - this.props.legendMargin
      : height
  }

  modifyData = data => {
    for (let x = 0; x < data.length; ++x) {
      data[x].total = data[x].values.reduce((a, b) => a + b.value, 0)
    }
    return data
  }

  getStackData = data => {
    const keys = this.getChartKeys(data)
    const temp = []

    // first format the data in a way that D3
    // likes to do math with
    data.forEach(d => {
      var tempObj = {}
      tempObj.label = d.label
      tempObj.originalData = d.values
      d.values.forEach(e => {
        tempObj[e.label] = e.value
      })
      temp.push(tempObj)
    })

    // now backfill any keys (i.e. stacked bar segments)
    // with empty values if they don't exist. this is
    // just in case one stacked bar column/row does not
    // have a segment that others do have.
    temp.forEach(d => {
      keys.forEach(k => {
        if (!d[k]) d[k] = 0
      })
    })

    return d3.stack().keys(keys)(temp)
  }

  getChartKeys = data => {
    // this function creates an array
    // of unique value keys so that D3
    // knows the bins needed to create
    // stacked bar segments
    const keys = []
    for (let x = 0; x < data.length; ++x) {
      data[x].values.map(d => {
        if (keys.indexOf(d.label) < 0) {
          return keys.push(d.label)
        }
        return false // calming linter warnings
      })
    }
    return keys
  }

  getChartKeysAndClasses = data => {
    // this function exists to pass class names and
    // legend labels down to the legend component
    const keys = []
    const keysAndClasses = []
    for (let x = 0; x < data.length; ++x) {
      data[x].values.map(d => {
        if (keys.indexOf(d.label) < 0) {
          keys.push(d.label)
          return keysAndClasses.push({ label: d.label, className: d.className })
        }
        return false // calming linter warnings
      })
    }
    return keysAndClasses.reverse()
  }

  getValueScale() {
    const max = d3.max(this.state.data, d => d.total)
    const size = this.isHorizontal()
      ? this.getChartInnerWidth(this.state.chartWidth)
      : this.getChartInnerHeight(this.props.chartHeight)
    return getValueScale(0, max, size, this.isHorizontal())
  }

  getLabelScale() {
    const data = this.state.data
    const size = this.isHorizontal()
      ? this.getChartInnerHeight(this.props.chartHeight)
      : this.getChartInnerWidth(this.state.chartWidth)
    return getLabelScale(data, size, this.isHorizontal())
  }

  getLabelAxis() {
    const xScale = this.getLabelScale()
    const xAxisLabels = this.state.data.map(d => d.label)
    return getLabeledAxis(this.props.chartType, xScale, xAxisLabels, this.isHorizontal())
  }

  getValueAxis() {
    const yScale = this.getValueScale()
    const labelScaleSize = this.isHorizontal()
      ? this.getChartInnerHeight(this.props.chartHeight)
      : this.getChartInnerWidth(this.state.chartWidth)
    const max = d3.max(this.state.data, d => d.total)
    return getValuedAxis(yScale, labelScaleSize, max, this.isHorizontal())
  }

  getValueGrid() {
    const yScale = this.getValueScale()
    const labelScaleSize = this.isHorizontal()
      ? this.getChartInnerHeight(this.props.chartHeight)
      : this.getChartInnerWidth(this.state.chartWidth)
    return getValueGrid(yScale, labelScaleSize, this.isHorizontal())
  }

  getLabelGrid() {
    const xScale = this.getLabelScale()
    const valueScaleSize = this.isHorizontal()
      ? this.getChartInnerWidth(this.state.chartWidth)
      : this.getChartInnerHeight(this.props.chartHeight)
    return getLabelGrid(xScale, valueScaleSize, this.state.data, this.isHorizontal())
  }

  renderGrids() {
    const chartInnerHeight = this.getChartInnerHeight(this.props.chartHeight)
    const xGrid = this.isHorizontal() ? this.getValueGrid() : this.getLabelGrid()
    const yGrid = this.isHorizontal() ? this.getLabelGrid() : this.getValueGrid()

    return (
      <g>
        <ChartGrid height={chartInnerHeight} axisFunction={yGrid} axisType="y" />
        <ChartGrid height={chartInnerHeight} axisFunction={xGrid} axisType="x" />
      </g>
    )
  }

  renderAxis() {
    const { chartHeight } = this.props
    const chartInnerHeight = this.getChartInnerHeight(chartHeight)
    const yAxis = this.isHorizontal() ? this.getLabelAxis() : this.getValueAxis()
    const xAxis = this.isHorizontal() ? this.getValueAxis() : this.getLabelAxis()

    return (
      <g>
        <ChartAxis height={chartInnerHeight} axisFunction={yAxis} axisType="y" />
        <ChartAxis
          height={chartInnerHeight}
          axisFunction={xAxis}
          axisType="x"
          rotate={this.props.xAxisValueLabelRotate}
        />
      </g>
    )
  }

  renderBarSegments(row) {
    const { onBarClick, onBarMouseOver, onBarMouseOut } = this.props
    const isHorizontal = this.isHorizontal()

    const labelScale = this.getLabelScale()
    const labelAxisFormatter = this.getLabelAxis().tickFormat()

    const valueScale = this.getValueScale()

    const showTooltip = this.showTooltip
    const hideTooltip = this.hideTooltip
    const moveTooltip = this.moveTooltip

    return row.map(function(r, j) {
      let originalDataSet = find(r.data.originalData, o => o.label === row.key)
      originalDataSet = { ...originalDataSet }

      // calculate position of bar
      const y = valueScale(r[1])
      const barHeight = isHorizontal ? valueScale(r[1]) - valueScale(r[0]) : valueScale(r[0]) - valueScale(r[1])

      const x = labelScale(r.data.label)
      const barWidth = labelScale.bandwidth()

      // for tooltips, we need the formatted label for the x value,
      // we also need the x position + 1/2 the bar width to correctly
      // line up the tooltip
      originalDataSet.formattedLabel = originalDataSet.label || labelAxisFormatter(r.data.label)
      originalDataSet.tooltipXPosition = isHorizontal ? y - barHeight + barHeight / 2 : x + barWidth / 2

      return (
        <ChartBarsRect
          index={j}
          data={originalDataSet}
          height={isHorizontal ? barWidth : barHeight}
          width={isHorizontal ? barHeight : barWidth}
          x={isHorizontal ? y - barHeight : x}
          y={isHorizontal ? x : y}
          key={j}
          onBarClick={onBarClick}
          onBarMouseOver={onBarMouseOver}
          onBarMouseOut={onBarMouseOut}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          moveTooltip={moveTooltip}
        />
      )
    })
  }

  renderBars() {
    return this.state.stackData.map((row, i) => {
      return <g key={i}>{this.renderBarSegments(row)}</g>
    })
  }

  renderEmptyChart() {
    return renderEmptyChart(this.props.emptyChartMessage)
  }

  renderLegend(chartInnerWidth, chartInnerHeight) {
    const legendKeysAndClasses = this.getChartKeysAndClasses(this.state.data)
    const { legendPosition, legendItemWidth, legendItemHeight, legendMargin } = this.props

    return (
      <ChartStackedLegend
        data={legendKeysAndClasses}
        chartWidth={chartInnerWidth}
        chartHeight={chartInnerHeight}
        legendPosition={legendPosition}
        legendItemHeight={legendItemHeight}
        legendItemWidth={legendItemWidth}
        legendMargin={legendMargin}
      />
    )
  }

  renderBarChart() {
    const { showGrid, showAxes, showBarTooltip, chartHeight, legendPosition } = this.props
    const chartInnerWidth = this.getChartInnerWidth(this.state.chartWidth)
    const chartInnerHeight = this.getChartInnerHeight(chartHeight)

    return (
      <g>
        {showGrid && this.renderGrids()}
        {showAxes && this.renderAxis()}
        <g className="Chart__bars-arcs">{this.renderBars()}</g>
        {showBarTooltip && <ChartTooltip tooltip={this.state.tooltip} />}
        {legendPosition !== 'none' && this.renderLegend(chartInnerWidth, chartInnerHeight)}
      </g>
    )
  }

  render() {
    return !this.state.data || !this.state.data.length ? this.renderEmptyChart() : this.renderBarChart()
  }

  showTooltip = (data, e) => {
    const { layout, position } = getTooltipPositionAndLayout(e)

    this.setState({
      tooltip: {
        layout,
        position,
        data: {
          label: data.hasOwnProperty('tooltipContent') ? data.tooltipContent : [data.formattedLabel, data.value],
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

ChartStacked.propTypes = {
  chartHeight: PropTypes.number,
  chartWidth: PropTypes.number,
  showAxes: PropTypes.bool,
  showGrid: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.any.isRequired,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.any.isRequired,
          value: PropTypes.number.isRequired,
          className: PropTypes.string,
          // tooltipContent should be an array of strings or numbers,
          // each array item is a newline in the tooltip. there may be
          // additional lines if the tooltip content needs to wrap.
          tooltipContent: PropTypes.arrayOf(PropTypes.string, PropTypes.number),
        }),
      ).isRequired,
    }),
  ).isRequired,
  chartType: PropTypes.oneOf(['date', 'integer', 'string']),
  onBarClick: PropTypes.func,
  onBarMouseOver: PropTypes.func,
  onBarMouseOut: PropTypes.func,
  showBarTooltip: PropTypes.bool,
  emptyChartMessage: PropTypes.any,
  xAxisValueLabelRotate: PropTypes.number,
  legendPosition: PropTypes.oneOf(['right', 'bottom', 'none']),
  legendItemWidth: PropTypes.number,
  legendItemHeight: PropTypes.number,
  legendMargin: PropTypes.number,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
}

ChartStacked.defaultProps = {
  chartType: 'date',
  showGrid: true,
  showAxes: true,
  showBarTooltip: true,
  xAxisValueLabelRotate: -30,
  legendPosition: 'right',
  legendItemWidth: 110,
  legendItemHeight: 20,
  legendMargin: 20,
  layout: 'vertical',
}

export default ChartStacked
