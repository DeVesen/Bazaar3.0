# Angular ProgressBar Component — API

ProgressBar is a process status indicator.

## Progress Bar

ProgressBar is a process status indicator.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ProgressBarPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | number \| undefined | - | Current value of the progress. |
| showValue | boolean | - | Whether to display the progress bar value. |
| valueStyleClass | string \| undefined | - | Style class of the value element. |
| unit | string | - | Unit sign appended to the value. |
| mode | "determinate" \| "indeterminate" | 'determinate' | Defines the mode of the progress |
| color | string \| undefined | - | Color for the background of the progress. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<ProgressBarContentTemplateContext> \| undefined | Template of the content. |

## Accessibility

Screen Reader ProgressBar components uses progressbar role along with aria-valuemin , aria-valuemax and aria-valuenow attributes. Value to describe the component can be defined using aria-labelledby and aria-label props.
