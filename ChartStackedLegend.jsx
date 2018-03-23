import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ChartStackedLegend extends Component {
  constructor(props) {
    super(props)

    this.state = {
      windowWidth: 0,
    }
  }
  componentDidMount() {
    this.updateWindowWidth()
    window.addEventListener('resize', this.updateWindowWidth, false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowWidth)
  }

  updateWindowWidth = () => {
    this.setState({
      windowWidth: document.getElementsByTagName('body')[0].clientWidth,
    })
  }

  renderBottomText() {
    const { data, legendMargin, legendItemWidth } = this.props

    return data.map((d, i) => {
      const xPosition = (legendItemWidth + legendMargin) * i
      const transform = `translate(${xPosition}, 0)`

      return (
        <g transform={transform} key={i}>
          <rect width="15" height="15" rx="2" ry="2" className={d.className} />
          <text x="17" y="13">
            {d.label}
          </text>
        </g>
      )
    })
  }

  renderRightText() {
    const { data, legendItemHeight, legendMargin } = this.props

    return data.map((d, i) => {
      const yPosition = legendItemHeight * i
      const transform = `translate(${legendMargin}, ${yPosition})`

      return (
        <g transform={transform} key={i}>
          <rect width="15" height="15" rx="2" ry="2" className={d.className} />
          <text x="17" y="13">
            {d.label}
          </text>
        </g>
      )
    })
  }

  render() {
    const { chartWidth, chartHeight, legendPosition, legendMargin, legendItemHeight } = this.props

    if (legendPosition === 'right') {
      const transform = `translate(${chartWidth + legendMargin}, 0)`

      // this isn't going to render well
      // for small screens or small element
      // containers. so hide it if the window
      // width is smaller than the chart width.
      // TODO: fix if the client really cares
      const visibility = this.state.windowWidth <= chartWidth ? 'hidden' : 'visible'

      return (
        <g transform={transform} style={{ visibility: visibility }}>
          {this.renderRightText()}
        </g>
      )
    } else {
      const transform = `translate(0, ${chartHeight + legendItemHeight + legendMargin})`

      // this isn't going to render well
      // for small screens or small element
      // containers. so hide it if the window
      // width is smaller than the chart width.
      // TODO: fix if the client really cares
      const visibility = this.state.windowWidth <= chartWidth ? 'hidden' : 'visible'

      return (
        <g transform={transform} style={{ visibility: visibility }}>
          {this.renderBottomText()}
        </g>
      )
    }
  }
}

ChartStackedLegend.propTypes = {
  chartWidth: PropTypes.number.isRequired,
  chartHeight: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  legendItemHeight: PropTypes.number,
  legendItemWidth: PropTypes.number,
  legendMargin: PropTypes.number,
  legendPosition: PropTypes.string,
}

ChartStackedLegend.defaultProps = {
  legendItemWidth: 110,
  legendMargin: 20,
  legendItemHeight: 20,
  legendPosition: 'right',
}

export default ChartStackedLegend
