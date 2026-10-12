# Angular MegaMenu Component — API

MegaMenu is navigation component that displays submenus together.

## Mega Menu

MegaMenu is navigation component that displays submenus together.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, MegaMenuPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model | MegaMenuItem[] \| undefined | - | An array of menuitems. |
| orientation | "horizontal" \| "vertical" | - | Defines the orientation. |
| id | string \| undefined | - | Current id state as a string. |
| ariaLabel | string \| undefined | - | Defines a string value that labels an interactive element. |
| ariaLabelledBy | string \| undefined | - | Identifier of the underlying input element. |
| breakpoint | string | - | The breakpoint to define the maximum width boundary. |
| scrollHeight | string | - | Height of the viewport, a scrollbar is defined if height of list exceeds this value. |
| disabled | boolean | - | When present, it specifies that the component should be disabled. |
| tabindex | number | - | Index of the element in tabbing order. |
| motionOptions | MotionOptions \| undefined | - | Defines the motion options for the submenu open/close animation. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| start | TemplateRef<void> \| undefined | Defines template option for start. |
| end | TemplateRef<void> \| undefined | Defines template option for end. |
| menuicon | TemplateRef<void> \| undefined | Defines template option for menu icon. |
| submenuicon | TemplateRef<void> \| undefined | Defines template option for submenu icon. |
| item | TemplateRef<MegaMenuItemTemplateContext> \| undefined | Custom item template. |
| button | TemplateRef<void> \| undefined | Custom menu button template on responsive mode. |
| buttonicon | TemplateRef<void> \| undefined | Custom menu button icon template on responsive mode. |

## Accessibility

Screen Reader MegaMenu component uses the menubar role along with aria-orientation and the value to describe the component can either be provided with aria-labelledby or aria-label props. Each list item has a presentation role whereas anchor elements have a menuitem role with aria-label referring to the label of the item and aria-disabled defined if the item is disabled. A submenu within a MegaMenu uses the menu role with an aria-labelledby defined as the id of the submenu root menuitem label. In addition, root menuitems that open a submenu have aria-haspopup , aria-expanded and aria-controls to define the relation between the item and the submenu. Keyboard Support Key Function tab Add focus to the first item if focus moves in to the menu. If the focus is already within the menu, focus moves to the next focusable item in the page tab sequence. shift + tab Add focus to the last item if focus moves in to the menu. If the focus is already within the menu, focus moves to the previous focusable item in the page tab sequence. enter If menuitem has a submenu, toggles the visibility of the submenu otherwise activates the menuitem and closes all open overlays. space If menuitem has a submenu, toggles the visibility of the submenu otherwise activates the menuitem and closes all open overlays. escape If focus is inside a popup submenu, closes the submenu and moves focus to the root item of the closed submenu. down arrow If focus is on a root element, open a submenu and moves focus to the first element in the submenu otherwise moves focus to the next menuitem within the submenu. up arrow If focus is on a root element, opens a submenu and moves focus to the last element in the submenu otherwise moves focus to the previous menuitem within the submenu. right arrow If focus is on a root element, moves focus to the next menuitem. If the focus in inside a submenu, moves focus to the first menuitem of the next menu group. left arrow If focus is on a root element, moves focus to the previous menuitem. If the focus in inside a submenu, moves focus to the first menuitem of the previous menu group. home Moves focus to the first menuitem within the submenu. end Moves focus to the last menuitem within the submenu.
