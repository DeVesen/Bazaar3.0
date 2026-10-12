# Angular Tooltip Component — API

Tooltip directive provides advisory information for a component. Tooltip is integrated within various PrimeNG components.

## Tooltip

Tooltip directive provides advisory information for a component.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | TooltipPassThroughOptions<unknown> \| undefined | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| tooltipPosition | TooltipPosition \| undefined | - | Position of the tooltip. |
| tooltipEvent | "hover" \| "focus" \| "both" | - | Event to show the tooltip. |
| positionStyle | string \| undefined | - | Type of CSS position. |
| tooltipStyleClass | string \| undefined | - | Style class of the tooltip. |
| tooltipZIndex | string \| undefined | - | Whether the z-index should be managed automatically to always go on top or have a fixed value. |
| escape | boolean | - | By default the tooltip contents are rendered as text. Set to false to support html tags in the content. |
| showDelay | number \| undefined | - | Delay to show the tooltip in milliseconds. |
| hideDelay | number \| undefined | - | Delay to hide the tooltip in milliseconds. |
| life | number \| undefined | - | Time to wait in milliseconds to hide the tooltip even it is active. |
| positionTop | number \| undefined | - | Specifies the additional vertical offset of the tooltip from its default position. |
| positionLeft | number \| undefined | - | Specifies the additional horizontal offset of the tooltip from its default position. |
| autoHide | boolean | - | Whether to hide tooltip when hovering over tooltip content. |
| fitContent | boolean | - | Automatically adjusts the element position when there is not enough space on the selected position. |
| hideOnEscape | boolean | - | Whether to hide tooltip on escape key press. |
| showOnEllipsis | boolean | - | Whether to show the tooltip only when the target text overflows (e.g., ellipsis is active). |
| content | string \| TemplateRef<HTMLElement> \| undefined | - | Content of the tooltip. |
| tooltipDisabled | boolean | false | When present, it specifies that the component should be disabled. |
| tooltipOptions | TooltipOptions \| undefined | - | Specifies the tooltip configuration options for the component. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| pTooltipPT | PassThrough<I, TooltipPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the Tooltip component. |
| pTooltipUnstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |

## Accessibility

Screen Reader Tooltip component uses tooltip role and when it becomes visible the generated id of the tooltip is defined as the aria-describedby of the target. Keyboard Support Key Function escape Closes the tooltip when focus is on the target.
