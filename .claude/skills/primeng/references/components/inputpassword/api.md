# Angular InputPassword Component — API

InputPassword is an enhanced input for password entry with strength metering, mask toggling, and controlled or uncontrolled usage.

## Input Password

InputPassword directive is an extension to standard input element with mask toggling.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputPasswordPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| mask | boolean | true | Whether the password is masked. |

## Accessibility

Screen Reader InputPassword is applied to a native input element so it implicitly includes any passed prop. Value to describe the component can either be provided via label tag combined with id prop or using aria-labelledby , aria-label props.
