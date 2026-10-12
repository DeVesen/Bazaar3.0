# Angular DatePicker Component — API

DatePicker is a form component to work with dates.

## Date Picker

DatePicker is a form component to work with dates.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, DatePickerPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
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
| min | Date \| Date[] \| null \| undefined | undefined | The value must be greater than or equal to the value. |
| max | Date \| Date[] \| null \| undefined | undefined | The value must be less than or equal to the value. |
| step | number \| null \| undefined | undefined | Unless the step is set to the any literal, the value must be min + an integral multiple of the step. |
| minlength | number \| null \| undefined | undefined | The number of characters (code points) must not be less than the value of the attribute, if non-empty. |
| maxlength | number \| null \| undefined | undefined | The number of characters (code points) must not exceed the value of the attribute. |
| iconDisplay | "input" \| "button" | - | Icon display mode. |
| inputStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the input field. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| inputStyleClass | string \| undefined | - | Style class of the input field. |
| placeholder | string \| undefined | - | Placeholder text for the input. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| iconAriaLabel | string \| undefined | - | Defines a string that labels the icon button for accessibility. |
| dateFormat | string \| undefined | - | Format of the date which can also be defined at locale settings. |
| multipleSeparator | string | - | Separator for multiple selection mode. |
| rangeSeparator | string | - | Separator for joining start and end dates on range selection mode. |
| inline | boolean | - | When enabled, displays the datepicker as inline. Default is false for popup mode. |
| showOtherMonths | boolean | - | Whether to display dates in other months (non-selectable) at the start or end of the current month. To make these days selectable use the selectOtherMonths option. |
| selectOtherMonths | boolean \| undefined | - | Whether days in other months shown before or after the current month are selectable. This only applies if the showOtherMonths option is set to true. |
| showIcon | boolean \| undefined | - | When enabled, displays a button with icon next to input. |
| icon | string \| undefined | - | Icon of the datepicker button. |
| readonlyInput | boolean \| undefined | - | When specified, prevents entering the date manually with keyboard. |
| shortYearCutoff | any | - | The cutoff year for determining the century for a date. |
| hourFormat | string | - | Specifies 12 or 24 hour format. |
| timeOnly | boolean \| undefined | - | Whether to display timepicker only. |
| stepHour | number | - | Hours to change per step. |
| stepMinute | number | - | Minutes to change per step. |
| stepSecond | number | - | Seconds to change per step. |
| showSeconds | boolean | - | Whether to show the seconds in time picker. |
| showOnFocus | boolean | - | When disabled, datepicker will not be visible with input focus. |
| showWeek | boolean | - | When enabled, datepicker will show week numbers. |
| startWeekFromFirstDayOfYear | boolean | - | When enabled, datepicker will start week numbers from first day of the year. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| dataType | string | - | Type of the value to write back to ngModel, default is date and alternative is string. |
| selectionMode | "single" \| "multiple" \| "range" | - | Defines the quantity of the selection, valid values are "single", "multiple" and "range". |
| maxDateCount | number \| undefined | - | Maximum number of selectable dates in multiple mode. |
| showButtonBar | boolean \| undefined | - | Whether to display today and clear buttons at the footer |
| todayButtonStyleClass | string \| undefined | - | Style class of the today button. |
| clearButtonStyleClass | string \| undefined | - | Style class of the clear button. |
| autofocus | boolean \| undefined | - | When present, it specifies that the component should automatically get focus on load. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| panelStyleClass | string \| undefined | - | Style class of the datetimepicker container element. |
| panelStyle | any | - | Inline style of the datetimepicker container element. |
| keepInvalid | boolean | - | Keep invalid value when input blur. |
| hideOnDateTimeSelect | boolean | - | Whether to hide the overlay on date selection. |
| touchUI | boolean \| undefined | - | When enabled, datepicker overlay is displayed as optimized for touch devices. |
| timeSeparator | string | - | Separator of time selector. |
| focusTrap | boolean | - | When enabled, can only focus on elements inside the datepicker. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| minDate | Date \| null \| undefined | - | The minimum selectable date. |
| maxDate | Date \| null \| undefined | - | The maximum selectable date. |
| disabledDates | Date[] \| undefined | - | Array with dates that should be disabled (not selectable). |
| disabledDays | number[] \| undefined | - | Array with weekday numbers that should be disabled (not selectable). |
| showTime | boolean | - | Whether to display timepicker. |
| responsiveOptions | DatePickerResponsiveOptions[] \| undefined | - | An array of options for responsive design. |
| numberOfMonths | number | - | Number of months to display. |
| firstDayOfWeek | number \| undefined | - | Defines the first of the week for various date calculations. |
| view | "date" \| "month" \| "year" | - | Type of view to display, valid values are "date" for datepicker and "month" for month picker. |
| defaultDate | Date \| null \| undefined | - | Set the date to highlight on first opening if the field is blank. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onFocus | event: Event | Callback to invoke on focus of input field. |
| onBlur | event: Event | Callback to invoke on blur of input field. |
| onClose | value: HTMLElement | Callback to invoke when date panel closed. |
| onSelect | value: Date | Callback to invoke on date select. |
| onClear | value: any | Callback to invoke when input field cleared. |
| onInput | value: any | Callback to invoke when input field is being typed. |
| onTodayClick | value: Date | Callback to invoke when today button is clicked. |
| onClearClick | value: any | Callback to invoke when clear button is clicked. |
| onMonthChange | event: DatePickerMonthChangeEvent | Callback to invoke when a month is changed using the navigators. |
| onYearChange | event: DatePickerYearChangeEvent | Callback to invoke when a year is changed using the navigators. |
| onClickOutside | value: any | Callback to invoke when clicked outside of the date panel. |
| onShow | value: HTMLElement | Callback to invoke when datepicker panel is shown. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| date | TemplateRef<DatePickerDateTemplateContext> \| undefined | Custom template for date cells. |
| header | TemplateRef<void> \| undefined | Custom template for header section. |
| footer | TemplateRef<void> \| undefined | Custom template for footer section. |
| disableddate | TemplateRef<DatePickerDisabledDateTemplateContext> \| undefined | Custom template for disabled date cells. |
| decade | TemplateRef<DatePickerDecadeTemplateContext> \| undefined | Custom template for decade view. |
| previousicon | TemplateRef<void> \| undefined | Custom template for previous month icon. |
| nexticon | TemplateRef<void> \| undefined | Custom template for next month icon. |
| triggericon | TemplateRef<void> \| undefined | Custom template for trigger icon. |
| clearicon | TemplateRef<void> \| undefined | Custom template for clear icon. |
| decrementicon | TemplateRef<void> \| undefined | Custom template for decrement icon. |
| incrementicon | TemplateRef<void> \| undefined | Custom template for increment icon. |
| inputicon | TemplateRef<DatePickerInputIconTemplateContext> \| undefined | Custom template for input icon. |
| buttonbar | TemplateRef<DatePickerButtonBarTemplateContext> \| undefined | Custom template for button bar. |

## Accessibility

Screen Reader Value to describe the component can either be provided via label tag combined with inputId prop or using aria-labelledby , aria-label props. The input element has combobox role in addition to aria-autocomplete as "none", aria-haspopup as "dialog" and aria-expanded attributes. The relation between the input and the popup is created with aria-controls attribute that refers to the id of the popup. The optional DatePicker button requires includes aria-haspopup , aria-expanded for states along with aria-controls to define the relation between the popup and the button. The value to read is retrieved from the chooseDate key of the aria property from the locale API. This label is also used for the aria-label of the popup as well. When there is a value selected, it is formatted and appended to the label to be able to notify users about the current value. Popup has a dialog role along with aria-modal and aria-label . The navigation buttons at the header has an aria-label retrieved from the prevYear , nextYear , prevMonth , nextMonth , prevDecade and nextDecade keys of the locale aria API. Similarly month picker button uses the chooseMonth and year picker button uses the chooseYear keys. Main date table uses grid role that contains th elements with col as the scope along with abbr tag resolving to the full name of the month. Each date cell has an aria-label referring to the full date value. Buttons at the footer utilize their readable labels as aria-label as well. Selected date also receives the aria-selected attribute. Timepicker spinner buttons get their labels for aria-label from the aria locale API using the prevHour , nextHour , prevMinute , nextMinute , prevSecond , nextSecond , am and pm keys. DatePicker also includes a hidden section that is only available to screen readers with aria-live as "polite". This element is updated when the selected date changes to instruct the user about the current date selected.
