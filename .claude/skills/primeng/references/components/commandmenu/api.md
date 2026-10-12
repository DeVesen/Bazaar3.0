# Angular CommandMenu Component — API

CommandMenu is a search-driven command palette component.

## Command Menu

CommandMenu is a search-driven command palette component.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, CommandMenuPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model | MenuItem[] \| undefined | - | An array of menu items to display. |
| search | string | - | Two-way bound search value. |
| filter | ((item: MenuItem, search: string) => number) \| undefined | - | Custom filter function. Receives (item, search) and returns a number (0 = no match). |
| emptyMessage | string \| undefined | - | Text to display when there are no results. Defaults to global value in i18n translation configuration. |
| placeholder | string \| undefined | - | Placeholder text for the search input. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Identifies the element that labels the input for accessibility. |
| menuStyle | { [klass: string]: any } \| undefined | - | Inline style of the menu. |
| menuStyleClass | string \| undefined | - | Style class of the menu. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onSearchChange | event: CommandMenuSearchChangeEvent | Callback to invoke when the search value changes. |
| onSelect | event: CommandMenuItemSelectEvent | Callback to invoke when a menu item is selected. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<CommandMenuItemTemplateContext<any>> \| undefined | Custom item template. |
| header | TemplateRef<CommandMenuHeaderTemplateContext> \| undefined | Custom header template. |
| footer | TemplateRef<CommandMenuFooterTemplateContext> \| undefined | Custom footer template. |
| emptymessage | TemplateRef<CommandMenuEmptyMessageTemplateContext> \| undefined | Custom empty message template. |

## Accessibility

Screen Reader The search input has a combobox role with aria-expanded , aria-controls and aria-activedescendant attributes. The list element uses the listbox role and each item has an option role. Value to describe the component can be provided via ariaLabel prop.
