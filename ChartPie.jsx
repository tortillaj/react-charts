import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

import { getTooltipPositionAndLayout } from 'utils/chartUtils'

import ChartPieArc from 'components/chart/ChartPieArc'
import ChartTooltip from 'components/chart/ChartTooltip'

//
// ChartPie renders a set of SVG
// paths to be used in a pie chart
//
// "data" expected to be an array of objects:
// [{label: 'x label', value: 'value at x label'} ...]
//
//

const initialTooltipState = {
  position: {
    x: 0,
    y: 0,
  },
  data: {
    label: [],
  },
  visible: false,
}

class ChartPie extends Component {
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

  getRadius = () => {
    const minViewport = Math.min(this.state.chartWidth, this.props.chartHeight)
    return minViewport / 2
  }

  getArcGenerator = (isInnerChart = false) => {
    const radius = this.getRadius()
    const nestedData = this.getNestedData()

    // if this is multi-level data, we
    // need a smaller inner radius to make
    // room for the nested chart
    const innerRadius = isInnerChart || !nestedData.length ? 75 : 35

    return d3
      .arc()
      .outerRadius(radius)
      .innerRadius(radius - innerRadius)
  }

  getPieGenerator = () => {
    return d3
      .pie()
      .value(d => d.value)
      .sort(null)
  }

  getColorSchemeGenerator = () => {
    return d3.scaleOrdinal(d3.schemeCategory20)
  }

  getNestedData = () => {
    let nestedData = []
    this.props.data.forEach(d => {
      if (d.children && d.children.length) {
        d.children.map(c => (c.parent = d))
        nestedData = nestedData.concat(d.children)
      }
    })
    return nestedData
  }

  getModifiedData = data => {
    const pieFn = this.getPieGenerator()
    return pieFn(data)
  }

  getPaths = (data, isInnerChart = false) => {
    const { chartWidth, onPieClick, onPieMouseOver, onPieMouseOut } = this.props

    const colorFn = this.getColorSchemeGenerator()
    const radiusFn = this.getArcGenerator(isInnerChart)
    const showTooltip = this.showTooltip
    const hideTooltip = this.hideTooltip
    const moveTooltip = this.moveTooltip

    const paths = data.map(function(point, i) {
      return (
        <ChartPieArc
          isInnerChart={isInnerChart}
          fill={colorFn(i)}
          key={i}
          point={point}
          index={i}
          radiusFn={radiusFn}
          chartWidth={chartWidth}
          onPieClick={onPieClick}
          onPieMouseOver={onPieMouseOver}
          onPieMouseOut={onPieMouseOut}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          moveTooltip={moveTooltip}
        />
      )
    })

    return paths
  }

  renderEmptyChart() {
    return (
      <g>
        <text>{this.props.emptyChartMessage}</text>
      </g>
    )
  }

  renderPieChartSegment(data, isInnerChart = false) {
    const radius = this.getRadius()
    const modifiedData = this.getModifiedData(data)
    const paths = this.getPaths(modifiedData, isInnerChart)
    const transform = isInnerChart ? `translate(${radius}, ${radius}) scale(0.7)` : `translate(${radius}, ${radius})`

    return (
      <g>
        <g transform={transform}>{paths}</g>
      </g>
    )
  }

  renderPieChart() {
    const { showPieTooltip, data } = this.props

    const nestedData = this.getNestedData()

    return (
      <g className="Chart__bars-arcs">
        {data.length > 0 && this.renderPieChartSegment(data)}

        {nestedData.length > 0 && this.renderPieChartSegment(nestedData, true)}

        {showPieTooltip && <ChartTooltip tooltip={this.state.tooltip} />}
      </g>
    )
  }

  render() {
    return !this.props.data || !this.props.data.length ? this.renderEmptyChart() : this.renderPieChart()
  }

  showTooltip = (point, e) => {
    const { layout, position } = getTooltipPositionAndLayout(e)

    this.setState({
      tooltip: {
        position,
        layout,
        data: {
          label: point.data.tooltipContent,
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

ChartPie.propTypes = {
  chartHeight: PropTypes.number,
  chartWidth: PropTypes.number,
  chartMargin: PropTypes.object,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.any,
      className: PropTypes.string,
      // tooltipContent should be an array of strings or numbers,
      // each array item is a newline in the tooltip. there may be
      // additional lines if the tooltip content needs to wrap.
      tooltipContent: PropTypes.arrayOf(PropTypes.string, PropTypes.number),
    }),
  ).isRequired,
  onPieClick: PropTypes.func,
  onPieMouseOver: PropTypes.func,
  onPieMouseOut: PropTypes.func,
  showPieTooltip: PropTypes.bool,
  emptyChartMessage: PropTypes.any,
}

ChartPie.defaultProps = {
  showPieTooltip: true,
}

export default ChartPie
