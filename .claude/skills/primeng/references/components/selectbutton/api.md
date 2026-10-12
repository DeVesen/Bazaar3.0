# Angular SelectButton Component — API

SelectButton is used to choose single or multiple items from a list using buttons.

## Select Button

SelectButton is used to choose single or multiple items from a list using buttons.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SelectButtonPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| options | any[] \| undefined | - | An array of selectitems to display as the available options. |
| optionLabel | string \| undefined | - | Name of the label field of an option. |
| optionValue | string \| undefined | - | Name of the value field of an option. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of an option or function to determine disabled state. |
| unselectable | boolean | - | Whether selection can be cleared. |
| tabindex | number | - | Index of the element in tabbing order. |
| multiple | boolean | - | When specified, allows selecting multiple values. |
| allowEmpty | boolean | - | Whether selection can not be cleared. |
| styleClass | string \| undefined | - | Style class of the component. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| dataKey | string \| undefined | - | A property to uniquely identify a value in options. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |
| fluid | boolean | undefined | Spans 100% width of the container when enabled. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onOptionClick | event: SelectButtonOptionClickEvent | Callback to invoke on input click. |
| onChange | event: SelectButtonChangeEvent | Callback to invoke on selection change. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<SelectButtonItemTemplateContext> \| undefined | Custom item template. |

## Accessibility

Screen Reader The container element that wraps the buttons has a group role whereas each button element uses button role and aria-pressed is updated depending on selection state. Value to describe an option is automatically set using the ariaLabel property that refers to the label of an option so it is still suggested to define a label even the option display consists of presentational content like icons only.
