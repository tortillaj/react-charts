import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './ChartTooltip.css'

class ChartTooltip extends Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 40,
      lineCount: 0,
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.tooltip.data !== nextProps.tooltip.data || this.props.tooltip.position !== nextProps.tooltip.position
    )
  }

  renderLabelLines = original => {
    if (!original || !original.length) return null

    // 15 characters per line is just arbitrary
    const charactersPerLine = 15

    let lineNumber = 0
    const lineHeight = 15
    const lines = []

    original.map((o, i) => {
      const lineText = o.toString()
      const words = lineText.split(/\s+/)

      words.map((w, j) => {
        if (!lines[lineNumber]) {
          return (lines[lineNumber] = w)
        } else if (lines[lineNumber].length + w.length < charactersPerLine) {
          return (lines[lineNumber] += ` ${w}`)
        } else {
          lineNumber++
          return (lines[lineNumber] = w)
        }
      })

      return lineNumber++
    })

    this.setState({
      lineCount: lineNumber,
      height: lineNumber * lineHeight + 2 * this.props.padding,
    })

    return lines.map((line, k) => {
      return (
        <tspan x={0} y={0} key={k} dy={`${lineHeight * k / lineHeight}em`}>
          {line}
        </tspan>
      )
    })
  }

  render() {
    const { position, data, visible } = this.props.tooltip
    const { width, padding } = this.props
    const { height } = this.state

    const visibility = visible ? 'visible' : 'hidden'
    const transform = `translate(${position.x}, ${position.y})`
    const textTransform = `translate(${width / 2}, ${padding + 12})`

    const lines = this.renderLabelLines(data.label)

    return (
      <g
        ref="chartTooltip"
        transform={transform}
        className="chart-tooltip"
        id="chart-tooltip"
        width={width}
        height={height}>
        <rect className="chart-tooltip__shadow" width={width} height={height} rx="5" ry="5" visibility={visibility} />
        <text className="chart-tooltip__label-text" width={width} height={height} transform={textTransform}>
          {lines}
        </text>
      </g>
    )
  }
}

ChartTooltip.propTypes = {
  tooltip: PropTypes.shape({
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    data: PropTypes.shape({
      label: PropTypes.array.isRequired,
    }).isRequired,
    visible: PropTypes.bool.isRequired,
  }).isRequired,
  width: PropTypes.number,
  padding: PropTypes.number,
}

ChartTooltip.defaultProps = {
  width: 90,
  padding: 5,
}

export default ChartTooltip
