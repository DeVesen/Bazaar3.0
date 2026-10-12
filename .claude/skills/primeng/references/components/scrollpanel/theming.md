# Angular Scroll Panel Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| contentContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content container's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| barX | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the horizontal panel's DOM element. |
| barY | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the vertical panel's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-scrollpanel | Class name of the root element |
| p-scrollpanel-content-container | Class name of the content container element |
| p-scrollpanel-content | Class name of the content element |
| p-scrollpanel-bar-x | Class name of the bar x element |
| p-scrollpanel-bar-y | Class name of the bar y element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| scrollpanel.transition.duration | --p-scrollpanel-transition-duration | Transition duration of root |
| scrollpanel.bar.size | --p-scrollpanel-bar-size | Size of bar |
| scrollpanel.bar.border.radius | --p-scrollpanel-bar-border-radius | Border radius of bar |
| scrollpanel.bar.focus.ring.width | --p-scrollpanel-bar-focus-ring-width | Focus ring width of bar |
| scrollpanel.bar.focus.ring.style | --p-scrollpanel-bar-focus-ring-style | Focus ring style of bar |
| scrollpanel.bar.focus.ring.color | --p-scrollpanel-bar-focus-ring-color | Focus ring color of bar |
| scrollpanel.bar.focus.ring.offset | --p-scrollpanel-bar-focus-ring-offset | Focus ring offset of bar |
| scrollpanel.bar.focus.ring.shadow | --p-scrollpanel-bar-focus-ring-shadow | Focus ring shadow of bar |
| scrollpanel.bar.background | --p-scrollpanel-bar-background | Background of bar |

---
