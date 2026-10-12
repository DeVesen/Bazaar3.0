# Angular InputTags Component — API

InputTags is used to enter multiple tags.

## Input Tags

InputTags is used to enter multiple tags with optional typeahead suggestions.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputTagsPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| fluid | boolean \| undefined | false | Spans 100% width of the container when enabled. |
| variant | "filled" \| "outlined" \| undefined | 'outlined' | Specifies the input variant of the component. |
| size | "small" \| "large" \| undefined | undefined | Specifies the size of the component. |
| inputSize | number \| null \| undefined | undefined | Specifies the visible width of the input element in characters. |
| pattern | string \| readonly RegExp[] \| null \| undefined | undefined | Specifies the value must match the pattern. |
| min | any | undefined | The value must be greater than or equal to the value. |
| step | number \| null \| undefined | undefined | Unless the step is set to the any literal, the value must be min + an integral multiple of the step. |
| minlength | number \| null \| undefined | undefined | The number of characters (code points) must not be less than the value of the attribute, if non-empty. |
| maxlength | number \| null \| undefined | undefined | The number of characters (code points) must not exceed the value of the attribute. |
| placeholder | string \| undefined | - | Advisory information to display on input. |
| max | any | - | Maximum number of tags allowed. |
| delimiter | string \| RegExp \| undefined | - | Delimiter character or regex to split input into tags. |
| allowDuplicate | boolean | false | Whether to allow duplicate tags. |
| addOnBlur | boolean | false | Whether to add a tag when the input loses focus. |
| addOnTab | boolean | false | Whether to add a tag on tab key press. |
| addOnPaste | boolean | false | Whether to add tags on paste event. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| typeahead | boolean | false | Whether typeahead mode is active. |
| suggestions | any[] | - | An array of suggestions to display in the dropdown. |
| optionLabel | string \| ((item: any) => string) \| undefined | - | Property name or getter function for option label. |
| optionValue | string \| ((item: any) => any) \| undefined | - | Property name or getter function for option value. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Property name or getter function for disabled state. |
| optionGroupLabel | string | 'label' | Field name for option group label. |
| optionGroupChildren | string | 'items' | Field name for option group children. |
| group | boolean | false | Whether to display options as grouped. |
| delay | number | 300 | Delay in ms between keystrokes before triggering search. |
| minQueryLength | number | 1 | Minimum number of characters to initiate a search. |
| completeOnFocus | boolean | false | Whether to trigger search when input receives focus. |
| scrollHeight | string | '200px' | Maximum height of the suggestions panel. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'body' | Target element to attach the overlay. |
| overlayOptions | OverlayOptions \| undefined | - | Configuration for the overlay element. |
| motionOptions | MotionOptions \| undefined | - | Animation options for the overlay. |
| panelStyle | { [klass: string]: any } \| undefined | - | Inline style of the overlay panel. |
| panelStyleClass | string \| undefined | - | CSS class of the overlay panel. |
| inputStyle | { [klass: string]: any } \| undefined | - | Inline style of the input field. |
| inputStyleClass | string \| undefined | - | CSS class of the input field. |
| autoOptionFocus | boolean | false | Whether to auto-focus first option when overlay shows. |
| focusOnHover | boolean | true | Whether hover focuses an option. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| completeMethod | event: InputTagsCompleteEvent | Callback to invoke to search for suggestions. |
| onSelect | event: InputTagsSelectEvent | Callback to invoke when a suggestion is selected. |
| onShow | value: void | Callback to invoke when the overlay is shown. |
| onHide | value: void | Callback to invoke when the overlay is hidden. |

## Accessibility

Screen Reader The input tags component uses a listbox role with aria-orientation set to horizontal. Each tag has the option role with aria-label , aria-selected , aria-setsize and aria-posinset attributes. Keyboard Support Key Function Enter Adds the typed value as a tag. Backspace Removes the last tag when the input is empty. Left Arrow Moves focus to the previous tag. Right Arrow Moves focus to the next tag.
