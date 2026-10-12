# Angular InputNumber Component — API

InputNumber is an input component to provide numerical input.

## Input Number

InputNumber is an input component to provide numerical input.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputNumberPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
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
| min | number \| null \| undefined | undefined | The value must be greater than or equal to the value. |
| max | number \| null \| undefined | undefined | The value must be less than or equal to the value. |
| step | number \| null \| undefined | undefined | Unless the step is set to the any literal, the value must be min + an integral multiple of the step. |
| minlength | number \| null \| undefined | undefined | The number of characters (code points) must not be less than the value of the attribute, if non-empty. |
| maxlength | number \| null \| undefined | undefined | The number of characters (code points) must not exceed the value of the attribute. |
| showButtons | boolean | - | Displays spinner buttons. |
| format | boolean | - | Whether to format the value. |
| buttonLayout | "stacked" \| "horizontal" \| "vertical" | - | Layout of the buttons, valid values are "stacked" (default), "horizontal" and "vertical". |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| placeholder | string \| undefined | - | Advisory information to display on input. |
| tabindex | number \| undefined | - | Specifies tab order of the element. |
| title | string \| undefined | - | Title text of the input text. |
| ariaLabelledBy | string \| undefined | - | Specifies one or more IDs in the DOM that labels the input field. |
| ariaDescribedBy | string \| undefined | - | Specifies one or more IDs in the DOM that describes the input field. |
| ariaLabel | string \| undefined | - | Used to define a string that labels the input element. |
| ariaRequired | boolean \| undefined | - | Used to indicate that user input is required on an element before a form can be submitted. |
| autocomplete | string \| undefined | - | Used to define a string that autocomplete attribute the current element. |
| incrementButtonClass | string \| undefined | - | Style class of the increment button. |
| decrementButtonClass | string \| undefined | - | Style class of the decrement button. |
| incrementButtonIcon | string \| undefined | - | Style class of the increment button. |
| decrementButtonIcon | string \| undefined | - | Style class of the decrement button. |
| readonly | boolean \| undefined | - | When present, it specifies that an input field is read-only. |
| allowEmpty | boolean | - | Determines whether the input field is empty. |
| locale | string \| undefined | - | Locale to be used in formatting. |
| localeMatcher | InputNumberLocaleMatcher \| undefined | - | The locale matching algorithm to use. Possible values are "lookup" and "best fit"; the default is "best fit". See Locale Negotiation for details. |
| mode | "decimal" \| "currency" \| "percent" \| "unit" | - | Defines the behavior of the component, valid values are "decimal" and "currency". |
| currency | string \| undefined | - | The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB. There is no default value; if the style is "currency", the currency property must be provided. |
| currencyDisplay | InputNumberCurrencyDisplay \| undefined | - | How to display the currency in currency formatting. Possible values are "symbol" to use a localized currency symbol such as €, ü"code" to use the ISO currency code, "name" to use a localized currency name such as "dollar"; the default is "symbol". |
| useGrouping | boolean | - | Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators. |
| minFractionDigits | number \| undefined | - | The minimum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number and percent formatting is 0; the default for currency formatting is the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn't provide that information). |
| maxFractionDigits | number \| undefined | - | The maximum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number formatting is the larger of minimumFractionDigits and 3; the default for currency formatting is the larger of minimumFractionDigits and the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn't provide that information). |
| prefix | string \| undefined | - | Text to display before the value. |
| suffix | string \| undefined | - | Text to display after the value. |
| inputStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the input field. |
| inputStyleClass | string \| undefined | - | Style class of the input field. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| autofocus | boolean \| undefined | - | When present, it specifies that the component should automatically get focus on load. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onInput | event: InputNumberInputEvent | Callback to invoke on input. |
| onFocus | event: Event | Callback to invoke when the component receives focus. |
| onBlur | event: Event | Callback to invoke when the component loses focus. |
| onKeyDown | event: KeyboardEvent | Callback to invoke on input key press. |
| onClear | value: void | Callback to invoke when clear token is clicked. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| clearicon | TemplateRef<void> \| undefined | Custom clear icon template. |
| incrementbuttonicon | TemplateRef<void> \| undefined | Custom increment button icon template. |
| decrementbuttonicon | TemplateRef<void> \| undefined | Custom decrement button icon template. |

## Accessibility

Screen Reader Value to describe the component can either be provided via label tag combined with inputId prop or using ariaLabelledBy , ariaLabel , ariaDescribedBy props. The input element uses spinbutton role in addition to the aria-valuemin , aria-valuemax and aria-valuenow attributes.
