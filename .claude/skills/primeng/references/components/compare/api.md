# Angular Compare Component — API

Compare two items side by side with a slider.

## Compare

Compare allows comparing two items side by side with a slider.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ComparePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | number \| undefined | - | Current value of the slider position (0-100). |
| defaultValue | number | - | Default value when uncontrolled. |
| orientation | "vertical" \| "horizontal" | - | Orientation of the comparison slider. |
| min | number | - | Minimum value. |
| max | number | - | Maximum value. |
| step | number | - | Step increment. |
| slideOnHover | boolean | - | Whether the slider updates on hover. |
| disabled | boolean | - | Whether the component is disabled. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onValueChange | event: CompareValueChangeEvent | Callback to invoke when value changes. |
| onValueChangeEnd | event: CompareValueChangeEvent | Callback to invoke when dragging ends. |

## Accessibility

Compare uses a hidden range input for keyboard accessibility. The input supports aria-label , aria-labelledby , aria-valuemin , aria-valuemax , and aria-valuenow attributes. Use arrow keys to adjust the slider position.
