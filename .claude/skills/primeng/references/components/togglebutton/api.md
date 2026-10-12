# Angular ToggleButton Component — API

ToggleButton is used to select a boolean value using a button.

## Toggle Button

ToggleButton is used to select a boolean value using a button.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ToggleButtonPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| onLabel | string | - | Label for the on state. |
| offLabel | string | - | Label for the off state. |
| onIcon | string \| undefined | - | Icon for the on state. |
| offIcon | string \| undefined | - | Icon for the off state. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| tabindex | number | - | Index of the element in tabbing order. |
| iconPos | "left" \| "right" | - | Position of the icon. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| size | InputSize \| undefined | - | Defines the size of the component. |
| allowEmpty | boolean \| undefined | - | Whether selection can not be cleared. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: ToggleButtonChangeEvent | Callback to invoke on value change. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| icon | TemplateRef<ToggleButtonIconTemplateContext> \| undefined | Custom icon template. |
| content | TemplateRef<ToggleButtonContentTemplateContext> \| undefined | Custom content template. |

## Accessibility

Screen Reader ToggleButton component uses an element with button role and updates aria-pressed state for screen readers. Value to describe the component can be defined with ariaLabelledBy or ariaLabel props, it is highly suggested to use either of these props as the component changes the label displayed which will result in screen readers to read different labels when the component receives focus. To prevent this, always provide an aria label that does not change related to state.
