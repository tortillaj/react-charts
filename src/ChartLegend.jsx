import React from 'react'
import PropTypes from 'prop-types'
import { compose, withHandlers } from 'recompose'

import './ChartLegend.css'

const enhance = compose(
  withHandlers({
    onLegendItemMouseMove: props => e => {
      const data = JSON.parse(e.target.parentNode.getAttribute('data'))
      props.onLegendItemMouseMove && props.onLegendItemMouseMove(data, e)
    },
    onLegendItemClick: props => e => {
      const data = JSON.parse(e.target.parentNode.getAttribute('data'))
      props.onLegendItemClick && props.onLegendItemClick(data, e)
    },
  }),
)

const ChartLegend = ({ data, layout, onLegendItemClick, onLegendItemMouseMove }) => {
  return (
    <div className={`ChartLegend ChartLegend--${layout}`}>
      {data &&
        data.map((d, i) => {
          return (
            <div key={i} className="ChartLegend__item" onClick={onLegendItemClick} onMouseMove={onLegendItemMouseMove}>
              <div className={'ChartLegend__color ' + d.className} />
              <div className="ChartLegend__label">{d.label}</div>
            </div>
          )
        })}
    </div>
  )
}

ChartLegend.propTypes = {
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.any.isRequired,
      className: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onLegendItemClick: PropTypes.func,
  onLegendItemMouseMove: PropTypes.func,
}

ChartLegend.defaultProps = {
  layout: 'horizontal',
}

export default enhance(ChartLegend)
