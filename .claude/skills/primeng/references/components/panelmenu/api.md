# Angular PanelMenu Component — API

PanelMenu is a hybrid of Accordion and Tree components.

## Panel Menu

PanelMenu is a hybrid of Accordion and Tree components.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, PanelMenuPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model | MenuItem[] \| undefined | - | An array of menuitems. |
| multiple | boolean | - | Whether multiple tabs can be activated at the same time or not. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| id | string \| undefined | - | Current id state as a string. |
| tabindex | number | - | Index of the element in tabbing order. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| submenuicon | TemplateRef<void> \| undefined | Template option of submenu icon. |
| headericon | TemplateRef<void> \| undefined | Template option of header icon. |
| item | TemplateRef<PanelMenuItemTemplateContext> \| undefined | Template option of item. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| collapseAll |  | void | Collapses open panels. |

## Accessibility

Screen Reader Accordion header elements have a button role, an aria-label defined using the label property of the menuitem model and aria-controls to define the id of the content section along with aria-expanded for the visibility state. The content of an accordion panel uses region role, defines an id that matches the aria-controls of the header and aria-labelledby referring to the id of the header. The tree elements has a tree as the role and each menu item has a treeitem role along with aria-label , aria-selected and aria-expanded attributes. The container element of a treenode has the group role. The aria-setsize , aria-posinset and aria-level attributes are calculated implicitly and added to each treeitem. Header Keyboard Support Key Function tab Adds focus to the first header when focus moves in to the component, if there is already a focused tab header then moves the focus out of the component based on the page tab sequence. enter Toggles the visibility of the content. space Toggles the visibility of the content. down arrow If panel is collapsed then moves focus to the next header, otherwise first treenode of the panel receives the focus. up arrow If previous panel is collapsed then moves focus to the previous header, otherwise last treenode of the previous panel receives the focus. home Moves focus to the first header. end Moves focus to the last header. Tree Keyboard Support Key Function tab Moves focus to the next focusable element in the page tab order. shift + tab Moves focus to the previous focusable element in the page tab order. enter Activates the focused treenode. space Activates the focused treenode. down arrow Moves focus to the next treenode. up arrow Moves focus to the previous treenode. right arrow If node is closed, opens the node otherwise moves focus to the first child node. left arrow If node is open, closes the node otherwise moves focus to the parent node.
