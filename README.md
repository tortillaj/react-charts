# react-charts

A set of React components to build composable D3 charts.

This is one method to integrate D3 into React. With this method, D3 takes care of all the math and interpolation calculations, but React is used to do all the rendering and chart updates. 

The upside is that we completely delegate DOM interaction to React alone. D3 is left doing calculations work, something no programmer wants to handle manually.

The downside is we lose some interaction delight, particularly when it comes to animating charts between updates.

Usage is pretty simple, as this is meant to be a proof of concept:

```
<Chart>
	<ChartBars ...props />
</Chart>
```

```
<Chart>
	<ChartPie ...props />
</Chart>
```

```
<Chart>
	<ChartStacked ...props />
</Chart>
```

Props allowed for each component are documented within the component. The Chart component itself is responsive, and should automatically respond to its container size. There are also options for legends, tooltips, and bar / stacked chart layout (i.e. either horizontal or vertical).