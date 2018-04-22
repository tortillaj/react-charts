import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ChartPieLegend extends Component {
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

  renderText() {
    const { colorFn, data, legendItemMargin, legendItemWidth } = this.props

    return data.map((d, i) => {
      const xPosition = (legendItemWidth + legendItemMargin) * i
      const transform = `translate(${xPosition}, 0)`

      return (
        <g transform={transform} key={i}>
          <rect width="15" height="15" fill={colorFn(i)} rx="2" ry="2" className={d.data.className} />
          <text x="17" y="13">
            {d.data.legendLabel}
          </text>
        </g>
      )
    })
  }

  render() {
    const { chartWidth, chartRadius, yPositionOffset } = this.props
    const transform = `translate(0, ${chartRadius * 2 + yPositionOffset})`

    // this isn't going to render well
    // for small screens or small element
    // containers. so hide it if the window
    // width is smaller than the chart width.
    // TODO: fix if the client really cares
    const visibility = this.state.windowWidth <= chartWidth ? 'hidden' : 'visible'

    return (
      <g transform={transform} style={{ visibility: visibility }}>
        {this.renderText()}
      </g>
    )
  }
}

ChartPieLegend.propTypes = {
  chartWidth: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  colorFn: PropTypes.func.isRequired,
  yPositionOffset: PropTypes.number.isRequired,
  chartRadius: PropTypes.number.isRequired,
  legendItemWidth: PropTypes.number,
  legendItemMargin: PropTypes.number,
}

ChartPieLegend.defaultProps = {
  legendItemWidth: 110,
  legendItemMargin: 5,
}

export default ChartPieLegend
