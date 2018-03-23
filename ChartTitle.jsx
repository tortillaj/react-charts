import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './ChartTitle.css'

class ChartTitle extends Component {
  render() {
    return (
      <g transform={this.props.transform} className="chart-title">
        <text>
          <tspan x="0">{this.props.title}</tspan>
        </text>
      </g>
    )
  }
}

ChartTitle.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  transform: PropTypes.string.isRequired,
}

export default ChartTitle
