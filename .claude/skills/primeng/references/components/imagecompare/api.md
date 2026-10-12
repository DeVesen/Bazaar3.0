# Angular ImageCompare Component — API

Compare two images side by side with a slider.

## Image Compare

Compare two images side by side with a slider.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ImageComparePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| tabindex | number \| undefined | 0 | Index of the element in tabbing order. |
| ariaLabelledby | string \| undefined | - | Defines a string value that labels an interactive element. |
| ariaLabel | string \| undefined | - | Identifier of the underlying input element. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| left | TemplateRef<void> \| undefined | Custom left side template. |
| right | TemplateRef<void> \| undefined | Custom right side template. |

## Accessibility

Screen Reader ImageComponent component uses a native range slider internally. Value to describe the component can be defined using aria-labelledby and aria-label props. Keyboard Support Key Function tab Moves focus to the component. left arrow up arrow Decrements the value. right arrow down arrow Increments the value. home Set the minimum value. end Set the maximum value. page up Increments the value by 10 steps. page down Decrements the value by 10 steps.
