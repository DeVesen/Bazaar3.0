# Angular Rating Component — API

Rating component is a star based selection input.

## Rating

Rating is an extension to standard radio button element with theming.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, RatingPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| readonly | boolean | - | When present, changing the value is not possible. |
| stars | number | - | Number of stars. |
| iconOnClass | string \| undefined | - | Style class of the on icon. |
| iconOnStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the on icon. |
| iconOffClass | string \| undefined | - | Style class of the off icon. |
| iconOffStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the off icon. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| allowHalf | boolean | - | When present, selecting half stars is allowed. |
| orientation | "vertical" \| "horizontal" | - | Orientation of the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onRate | event: RatingRateEvent | Emitted on value change. |
| onFocus | event: FocusEvent | Emitted when the rating receives focus. |
| onBlur | event: FocusEvent | Emitted when the rating loses focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| onicon | TemplateRef<RatingIconTemplateContext> \| undefined | Custom on icon template. |
| officon | TemplateRef<RatingIconTemplateContext> \| undefined | Custom off icon template. |

## Accessibility

Screen Reader Rating component internally uses radio buttons that are only visible to screen readers. The value to read for item is retrieved from the locale API via star and stars of the aria property.
