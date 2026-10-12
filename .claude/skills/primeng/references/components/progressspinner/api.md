# Angular ProgressSpinner Component — API

ProgressSpinner is a process status indicator that supports both determinate and indeterminate modes.

## Progress Spinner

ProgressSpinner is a process status indicator.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ProgressSpinnerPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | number \| null \| undefined | null | Current value of the progress. When null or undefined, the spinner is in indeterminate mode. |
| strokeWidth | number | 4 | Width of the circle stroke. |
| animationDuration | string | - | Duration of the rotate animation. |
| min | number | 0 | Minimum value. |
| max | number | 100 | Maximum value. |
| ariaLabel | string \| undefined | - | Used to define a aria label attribute the current element. |
| fill | string | - | Color for the background of the circle. |

## Accessibility

Screen Reader ProgressSpinner components uses progressbar role. Value to describe the component can be defined using aria-labelledby and aria-label props.
