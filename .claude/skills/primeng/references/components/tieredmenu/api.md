# Angular TieredMenu Component — API

TieredMenu displays submenus in nested overlays.

## Tiered Menu

TieredMenu displays submenus in nested overlays.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TieredMenuPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model | MenuItem[] \| undefined | - | An array of menuitems. |
| popup | boolean | - | Defines if menu would displayed as a popup. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| breakpoint | string | - | The breakpoint to define the maximum width boundary. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| autoDisplay | boolean | true | Whether to show a root submenu on mouse over. |
| id | string \| undefined | - | Current id state as a string. |
| ariaLabel | string \| undefined | - | Defines a string value that labels an interactive element. |
| ariaLabelledBy | string \| undefined | - | Identifier of the underlying input element. |
| disabled | boolean | - | When present, it specifies that the component should be disabled. |
| tabindex | number | - | Index of the element in tabbing order. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onShow | value: Record<string, never | Callback to invoke when overlay menu is shown. |
| onHide | value: Record<string, never | Callback to invoke when overlay menu is hidden. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| submenuicon | TemplateRef<void> \| undefined | Custom submenu icon template. |
| item | TemplateRef<TieredMenuItemTemplateContext> \| undefined | Custom item template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| hide | _event: Event, isFocus: boolean | void | Hides the popup menu. |
| toggle | event: TieredMenuToggleEvent | void | Toggles the visibility of the popup menu. |
| show | event: TieredMenuToggleEvent, isFocus: boolean | void | Displays the popup menu. |

## Accessibility

Screen Reader TieredMenu component uses the menubar role with aria-orientation set to "vertical" and the value to describe the menu can either be provided with aria-labelledby or aria-label props. Each list item has a presentation role whereas anchor elements have a menuitem role with aria-label referring to the label of the item and aria-disabled defined if the item is disabled. A submenu within a TieredMenu uses the menu role with an aria-labelledby defined as the id of the submenu root menuitem label. In addition, menuitems that open a submenu have aria-haspopup , aria-expanded and aria-controls to define the relation between the item and the submenu. In popup mode, the component implicitly manages the aria-expanded , aria-haspopup and aria-controls attributes of the target element to define the relation between the target and the popup. Keyboard Support Key Function tab Add focus to the first item if focus moves in to the menu. If the focus is already within the menu, focus moves to the next focusable item in the page tab sequence. shift + tab Add focus to the last item if focus moves in to the menu. If the focus is already within the menu, focus moves to the previous focusable item in the page tab sequence. enter If menuitem has a submenu, toggles the visibility of the submenu otherwise activates the menuitem and closes all open overlays. space If menuitem has a submenu, toggles the visibility of the submenu otherwise activates the menuitem and closes all open overlays. escape If focus is inside a popup submenu, closes the submenu and moves focus to the root item of the closed submenu. down arrow Moves focus to the next menuitem within the submenu. up arrow Moves focus to the previous menuitem within the submenu. right arrow Opens a submenu if there is one available and moves focus to the first item. left arrow Closes a submenu and moves focus to the root item of the closed submenu. home Moves focus to the first menuitem within the submenu. end Moves focus to the last menuitem within the submenu.
