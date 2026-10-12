# Angular Slider Component — API

Slider is a component to provide input by dragging a handle along a track.

## Slider

Slider is a component to provide input by dragging a handle along a track.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SliderPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| animate | boolean \| undefined | - | When enabled, displays an animation on click of the slider bar. **(Deprecated)** |
| min | number | - | Mininum boundary value. |
| max | number | - | Maximum boundary value. |
| orientation | "horizontal" \| "vertical" | - | Orientation of the slider. |
| step | number \| undefined | - | Step factor to increment/decrement the value. |
| range | boolean \| undefined | - | When specified, allows two boundary values to be picked. |
| minStepsBetweenHandles | number | - | Minimum number of steps between handles in range mode. |
| disabledMinHandle | boolean | false | Disables the minimum (start) handle in range mode. |
| disabledMaxHandle | boolean | false | Disables the maximum (end) handle in range mode. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| tabindex | number | - | Index of the element in tabbing order. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: SliderChangeEvent | Callback to invoke on value change. |
| onSlideEnd | event: SliderSlideEndEvent | Callback to invoke when slide ended. |

## Accessibility

Screen Reader Slider element component uses slider role on the handle in addition to the aria-orientation , aria-valuemin , aria-valuemax and aria-valuenow attributes. Value to describe the component can be defined using ariaLabelledBy and ariaLabel props.
