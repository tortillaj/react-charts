# react-charts

A set of React components to build semi-composable D3 charts.

This is one method to integrate D3 into React. With this method, D3 takes care of all the math and interpolation calculations, but React is used to do all the rendering and chart updates. 

The upside is that we completely delegate DOM interaction to React alone. D3 is left doing calculations work, something no programmer wants to handle manually.

The downside is we lose some interaction delight, particularly when it comes to animating charts between updates.

Usage is pretty simple, as this is meant to be a proof of concept:

```
<ChartContainer data={} chartWidth={} chartHeight={} margin={}>
	<ChartBars ...props />
</ChartContainer>
```

```
<ChartContainer data={} chartWidth={} chartHeight={} margin={}>
	<ChartPie ...props />
</ChartContainer>
```

```
<ChartContainer data={} chartWidth={} chartHeight={} margin={}>
	<ChartStacked ...props />
</ChartContainer>
```

Props allowed for each component are documented within the component. The ChartContainer component itself is responsive, and should automatically respond to its container size. There are also options for legends, tooltips, and bar / stacked chart layout (i.e. either horizontal or vertical).

It will be helpful to review the default props in each component.

## Basic options for each chart

**Core options**

The Bar and Stacked have a core set of options:

- `showAxes` - Displays the chart axes 
- `showGrid` - Displays the chart grid lines 
- `chartType` - supports `date`, `integer`, and `string` for label axes values. D3 is used to format dates.
- `layout` - either `horizontal` or `vertical` to support bars that flow in the horizontal or vertical direction

**Mouse events**

All three charts support functions as props to handle mouse events. To mimic D3 functionality, the events fire when the pointer is interacting with individual segments of the chart. For example, a pie arc, a bar in the chart, or a segment of the stacked bar chart.

The first parameter sent to the supplied function is the data point, and the second is the event object:

- `onBarMouseOver` (for bar and stacked charts)
- `onPieMouseOver`
- `onBarMouseOut` (for bar and stacked charts)
- `onPieMouseOut`
- `onBarClick` (for bar and stacked charts)
- `onPieClick`

**Tooltips**

All three chart types support tooltip functionality:

- `showPieTooltip` and `showBarTooltip` to enable the tooltip functionality
- To provide the tooltip content, your dataset should include `tooltipContent`. Format multiple rows of tooltip content by supplying an array of strings or integers, which are joined together. Alternatively, sending an array of 1 value works too.
