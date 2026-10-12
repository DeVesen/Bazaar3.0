# Angular Message Component — API

Message component is used to display inline messages.

## Message

Message groups a collection of contents in tabs.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, MessagePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| severity | "success" \| "info" \| "warn" \| "error" \| "secondary" \| "contrast" | 'info' | Severity level of the message. |
| closable | boolean | false | Whether the message can be closed manually using the close icon. |
| icon | string \| undefined | undefined | Icon to display in the message. |
| closeIcon | string \| undefined | undefined | Icon to display in the message close button. |
| life | number \| undefined | undefined | Delay in milliseconds to close the message automatically. |
| size | MessageSize \| undefined | - | Defines the size of the component. |
| variant | MessageVariant \| undefined | - | Specifies the input variant of the component. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onClose | event: MessageCloseEvent | Emits when the message is closed. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| container | TemplateRef<MessageContainerTemplateContext> \| undefined | Custom template of the message container. |
| icon | TemplateRef<void> \| undefined | Custom template of the message icon. |
| closeicon | TemplateRef<void> \| undefined | Custom template of the close icon. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| close | event: Event | void | Closes the message. |

## Accessibility

Screen Reader Message component uses alert role that implicitly defines aria-live as "assertive" and aria-atomic as "true". Since any attribute is passed to the root element, attributes like aria-labelledby and aria-label can optionally be used as well. Close element is a button with an aria-label that refers to the aria.close property of the locale API by default. Close Button Keyboard Support Key Function enter Closes the message. space Closes the message.
