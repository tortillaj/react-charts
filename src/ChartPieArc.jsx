import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './ChartPieArc.css'

//
// ChartPieArc renders a single SVG
// path to be used in a ChartPie
//

class ChartPieArc extends Component {
  shouldComponentUpdate(nextProps) {
    // the width changes when the chart width changes. (window resize event mostly)
    // and redraw the pie when data changes, of course.
    return nextProps.chartWidth !== this.props.chartWidth || nextProps.point !== this.props.point
  }

  getClassNames = () => {
    const classNames = ['arc', `arc-${this.props.index}`]
    if (this.props.point.data) classNames.push(this.props.point.data.className)
    if (this.props.onPieClick) classNames.push('arc--is-clickable')
    return classNames.join(' ')
  }

  onPieClick = e => {
    return this.props.onPieClick && this.props.onPieClick(this.props.point, e)
  }

  onPieMouseOver = e => {
    this.props.showTooltip && this.props.showTooltip(this.props.point, e)
    return this.props.onPieMouseOver && this.props.onPieMouseOver(this.props.point, e)
  }

  onPieMouseOut = e => {
    this.props.hideTooltip && this.props.hideTooltip(this.props.point, e)
    return this.props.onPieMouseOut && this.props.onPieMouseOut(this.props.point, e)
  }

  onPieMouseMove = e => {
    const { showTooltip } = this.props
    if (showTooltip) {
      const tooltipsSelection = this.refs.pieChartArc.closest('svg').getElementById('chart-tooltip')
      if (tooltipsSelection) {
        return this.props.moveTooltip && this.props.moveTooltip(this.props.data, e)
      }
    }
  }

  render() {
    const { radiusFn, point, fill } = this.props

    return (
      <path
        ref="pieChartArc"
        className={this.getClassNames()}
        fill={fill}
        d={radiusFn(point)}
        onClick={this.onPieClick}
        onMouseOver={this.onPieMouseOver}
        onMouseOut={this.onPieMouseOut}
        onMouseMove={this.onPieMouseMove}
      />
    )
  }
}

ChartPieArc.propTypes = {
  index: PropTypes.number.isRequired,
  point: PropTypes.object.isRequired,
  radiusFn: PropTypes.func.isRequired,
  fill: PropTypes.string,
  onPieClick: PropTypes.func,
  onPieMouseOut: PropTypes.func,
  onPieMouseOver: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
  isInnerChart: PropTypes.bool.isRequired,
}

export default ChartPieArc
