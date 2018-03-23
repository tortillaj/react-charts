import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

import './ChartGrid.css'

class ChartGrid extends Component {
  componentDidUpdate() {
    this.renderGrid()
  }

  componentDidMount() {
    this.renderGrid()
  }

  shouldRender = () => (this.props.height && !isNaN(this.props.height))

  renderGrid = () => {
    if (!this.shouldRender()) return
    const node = ReactDOM.findDOMNode(this)
    d3.select(node).call(this.props.axisFunction)
  }

  render() {
    if (!this.shouldRender()) return null
    const translate = `translate(0, ${this.props.height})`

    return <g className="grid" transform={this.props.axisType === 'x' ? translate : ''} />
  }
}

ChartGrid.propTypes = {
  height: PropTypes.number,
  axisType: PropTypes.oneOf(['x', 'y']),
}

export default ChartGrid
