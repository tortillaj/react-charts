import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ChartTitle from './ChartTitle'

class ChartContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      chartWidth: 0,
      chartHeight: 0,
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateWidth, false)

    // If there is no chartWidth property, try to get the width of the parent container
    const width = this.props.chartWidth || this.chartContainer.parentNode.clientWidth
    const height = this.props.chartHeight || this.chartContainer.parentNode.clientHeight

    const chartWidth = this.getChartInnerWidth(width)
    const chartHeight = height - this.props.margin.top - this.props.margin.bottom

    this.setState({
      chartWidth,
      chartHeight,
    })

    this.updateWidth()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth)
  }

  getChartInnerWidth(assignedWidth) {
    return assignedWidth - this.props.margin.left - this.props.margin.right
  }

  updateWidth = (e = undefined) => {
    let width = this.chartContainer.parentNode.clientWidth

    // Respect the hard coded chart width until a resize event comes through
    // unless the parent is smaller than the hard coded chart width. We still
    // want the chart to fit inside the smaller parent.
    if (!e && this.props.chartWidth && this.props.chartWidth < this.chartContainer.parentNode.clientWidth) {
      width = this.props.chartWidth
    }

    this.setState({
      chartWidth: this.getChartInnerWidth(width),
    })
  }

  getTopMargin = () => {
    // add more to the top margin to make
    // room for the title to sit above the chart
    return this.props.title ? this.props.margin.top + 20 : this.props.margin.top
  }

  render() {
    const chartTransform = `translate(${this.props.margin.left}, ${this.getTopMargin()})`
    const titleTransform = `translate(${this.props.margin.left}, ${this.props.margin.top})`

    // let the width from this parent component
    // filter down into its children
    const children = React.Children.map(this.props.children, el => {
      return React.cloneElement(el, {
        chartWidth: this.state.chartWidth,
        chartHeight: this.state.chartHeight,
        chartMargin: this.props.margin,
      })
    })

    return (
      <div ref={e => (this.chartContainer = e)} className="Chart">
        <svg
          width={this.state.chartWidth + this.props.margin.left + this.props.margin.right}
          height={this.state.chartHeight + this.props.margin.top + this.props.margin.bottom}>
          {this.props.title && <ChartTitle title={this.props.title} transform={titleTransform} />}
          <g transform={chartTransform} className="Chart__contents">
            {children}
          </g>
        </svg>
      </div>
    )
  }
}

ChartContainer.propTypes = {
  chartWidth: PropTypes.number,
  chartHeight: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  margin: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
}

ChartContainer.defaultProps = {
  margin: {
    top: 20,
    right: 0,
    bottom: 55,
    left: 40,
  },
}

export default ChartContainer
