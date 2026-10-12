# Angular Timeline Component — API

Timeline visualizes a series of chained events.

## Timeline

Timeline visualizes a series of chained events.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TimelinePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | any[] \| undefined | - | An array of events to display. |
| align | "left" \| "right" \| "top" \| "bottom" \| "alternate" | - | Position of the timeline bar relative to the content. Valid values are "left", "right" for vertical layout and "top", "bottom" for horizontal layout. |
| layout | "vertical" \| "horizontal" | - | Orientation of the timeline. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<TimelineItemTemplateContext<any>> \| undefined | Custom content template. |
| opposite | TemplateRef<TimelineItemTemplateContext<any>> \| undefined | Custom opposite item template. |
| marker | TemplateRef<TimelineItemTemplateContext<any>> \| undefined | Custom marker template. |

## Accessibility

Screen Reader Timeline uses a semantic ordered list element to list the events. No specific role is enforced, still you may use any aria role and attributes as any valid attribute is passed to the list element. Keyboard Support Component does not include any interactive elements.
