# Angular Terminal Component — API

Terminal is a text-based interface component that emulates a command line experience, enabling users to enter commands and receive responses.

## Terminal

Terminal is a text based user interface.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TerminalPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| welcomeMessage | string \| undefined | - | Initial text to display on terminal. |
| prompt | string \| undefined | - | Prompt text for each command. |
| response | string \| undefined | - | Response to display after a command. |

## Accessibility

Screen Reader Terminal component has an input element that can be described with aria-label or aria-labelledby props. The element that lists the previous commands has aria-live so that changes are received by the screen reader. Keyboard Support Key Function tab Moves focus through the input element. enter Executes the command when focus in on the input element.
