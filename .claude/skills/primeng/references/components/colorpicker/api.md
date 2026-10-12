# Angular ColorPicker Component — API

ColorPicker is an input component to select a color.

## Color Picker

ColorPicker groups a collection of contents in tabs.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ColorPickerPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| inline | boolean | - | Whether to display as an overlay or not. |
| format | "hex" \| "rgb" \| "hsb" | - | Format to use in value binding. |
| tabindex | string \| undefined | - | Index of the element in tabbing order. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the dropdown. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| defaultColor | string | - | Default color to display initially when model value is not present. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| overlayOptions | OverlayOptions \| undefined | - | Whether to use overlay API feature. The properties of overlay API can be used like an object in it. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: ColorPickerChangeEvent | Callback to invoke on value change. |
| onShow | value: any | Callback to invoke on panel is shown. |
| onHide | value: any | Callback to invoke on panel is hidden. |

## Accessibility

Screen Reader Specification does not cover a color picker yet and using a semantic native color picker is not consistent across browsers so currently component is not compatible with screen readers. In the upcoming versions, text fields will be introduced below the slider section to be able to pick a color using accessible text boxes in hsl, rgba and hex formats.
