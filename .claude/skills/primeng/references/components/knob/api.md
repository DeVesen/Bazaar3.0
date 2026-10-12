# Angular Knob Component — API

Knob is a form component to define number inputs with a dial.

## Knob

Knob is a form component to define number inputs with a dial.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, KnobPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Specifies one or more IDs in the DOM that labels the input field. |
| tabindex | number | - | Index of the element in tabbing order. |
| valueColor | string | - | Background of the value. |
| rangeColor | string | - | Background color of the range. |
| textColor | string | - | Color of the value text. |
| valueTemplate | string | - | Template string of the value. |
| size | number | - | Size of the component in pixels. |
| min | number | - | Mininum boundary value. |
| max | number | - | Maximum boundary value. |
| step | number | - | Step factor to increment/decrement the value. |
| strokeWidth | number | - | Width of the knob stroke. |
| showValue | boolean | - | Whether the show the value inside the knob. |
| readonly | boolean | - | When present, it specifies that the component value cannot be edited. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | value: number | Callback to invoke on value change. |

## Accessibility

Screen Reader Knob element component uses slider role in addition to the aria-valuemin , aria-valuemax and aria-valuenow attributes. Value to describe the component can be defined using ariaLabelledBy and ariaLabel props.
