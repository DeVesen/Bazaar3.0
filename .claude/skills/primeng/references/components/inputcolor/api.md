# Angular InputColor Component — API

InputColor is a composable color picker component.

## Input Color

InputColor is a composable color picker component.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputColorPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| format | "hsba" \| "hsla" \| "rgba" \| "hexa" \| "oklch" | - | Color format/space used internally. |
| disabled | boolean | - | When present, it specifies that the component should be disabled. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onValueChange | event: { color: ColorInstance; originalEvent?: Event } | Callback on value change (during interaction). |
| onValueChangeEnd | event: { color: ColorInstance; originalEvent?: Event } | Callback when interaction ends (mouseup/touchend/keyup). |

## Accessibility

InputColorArea Screen Reader Support aria-label is used to describe the component. aria-roledescription is used to describe the role of the component. aria-valuemin , aria-valuemax , aria-valuenow , aria-valuetext are used to describe the value of the component. Keyboard Support Key Function tab Moves focus to the area thumb. right arrow Moves the area thumb to the right. left arrow Moves the area thumb to the left. up arrow Moves the area thumb to the up. down arrow Moves the area thumb to the down. InputColorSlider Screen Reader Support aria-label is used to describe the component. aria-valuemin , aria-valuemax , aria-valuenow , aria-valuetext are used to describe the value of the component. Keyboard Support Key Function tab Moves focus to the slider thumb. up arrow || left arrow Decrements the slider thumb. down arrow || right arrow Increments the slider thumb.
