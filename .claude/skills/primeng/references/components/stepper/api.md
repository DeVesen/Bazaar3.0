# Angular Stepper Component — API

The Stepper component displays a wizard-like workflow by guiding users through the multi-step progression.

## Stepper

Stepper is a component that streamlines a wizard-like workflow, organizing content into coherent steps and visually guiding users through a numbered progression in a multistep process.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, StepperPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | number \| undefined | undefined | A model that can hold a numeric value or be undefined. |
| linear | boolean | false | A boolean variable that captures user input. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

## Accessibility

Screen Reader Stepper container is defined with the tablist role, as any attribute is passed to the container element aria-labelledby can be optionally used to specify an element to describe the Stepper. Each stepper header has a tab role and aria-controls to refer to the corresponding stepper content element. The content element of each stepper has tabpanel role, an id to match the aria-controls of the header and aria-labelledby reference to the header as the accessible name. Tab Header Keyboard Support Key Function tab Moves focus through the header. enter Activates the focused stepper header. space Activates the focused stepper header.
