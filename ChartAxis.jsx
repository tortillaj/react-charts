import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

class ChartAxis extends Component {
  componentDidUpdate() {
    this.renderAxis()
  }

  componentDidMount() {
    this.renderAxis()
  }

  renderAxis = () => {
    const node = ReactDOM.findDOMNode(this)
    d3.select(node).call(this.props.axisFunction)

    if (this.props.rotate !== 0) {
      d3
        .select(node)
        .selectAll('.tick text')
        .attr('dy', '0.5em')
        .attr('dx', '-2em')
        .attr('transform', `rotate(${this.props.rotate})`)
    }
  }

  render() {
    const translate = 'translate(0, ' + this.props.height + ')'

    return <g className="axis" transform={this.props.axisType === 'x' ? translate : ''} />
  }
}

ChartAxis.propTypes = {
  height: PropTypes.number,
  axisFunction: PropTypes.func,
  axisType: PropTypes.oneOf(['x', 'y']),
  rotate: PropTypes.number,
}

ChartAxis.defaultProps = {
  rotate: 0,
}

export default ChartAxis
