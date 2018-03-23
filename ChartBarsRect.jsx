import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import './ChartBarsRect.css'

//
// ChartBarsRect renders a single SVG
// rectangle to be used in a ChartBars
//

class ChartBarsRect extends Component {
  shouldComponentUpdate(nextProps) {
    // the height changes when data changes.
    // the width changes when the chart width changes.
    return nextProps.height !== this.props.height || nextProps.width !== this.props.width
  }

  getClassNames = () => {
    return classNames(
      'bar',
      `bar-${this.props.index}`,
      { 'bar--is-clickable': this.props.onBarClick },
      { [this.props.data.className]: this.props.data && this.props.data.className },
      { [this.props.color]: this.props.color },
    )
  }

  onBarClick = e => {
    return this.props.onBarClick && this.props.onBarClick(this.props.data, e)
  }

  onBarMouseOver = e => {
    this.props.showTooltip && this.props.showTooltip(this.props.data, e)
    return this.props.onBarMouseOver && this.props.onBarMouseOver(this.props.data, e)
  }

  onBarMouseOut = e => {
    this.props.hideTooltip && this.props.hideTooltip(this.props.data, e)
    return this.props.onBarMouseOut && this.props.onBarMouseOut(this.props.data, e)
  }

  onBarMouseMove = e => {
    const { showTooltip } = this.props
    if (showTooltip) {
      const tooltipsSelection = this.refs.barChartRect.closest('svg').getElementById('chart-tooltip')
      if (tooltipsSelection) {
        return this.props.moveTooltip && this.props.moveTooltip(this.props.data, e)
      }
    }
  }

  render() {
    const { y, height, x, width } = this.props

    return (
      <rect
        ref="barChartRect"
        className={this.getClassNames()}
        height={height}
        y={y}
        width={width}
        x={x}
        onClick={this.onBarClick}
        onMouseOver={this.onBarMouseOver}
        onMouseOut={this.onBarMouseOut}
        onMouseMove={this.onBarMouseMove}
      />
    )
  }
}

ChartBarsRect.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onBarClick: PropTypes.func,
  onBarMouseOver: PropTypes.func,
  onBarMouseOut: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
  color: PropTypes.oneOf(['orange']),
  moveTooltip: PropTypes.func,
}

export default ChartBarsRect
