# Angular MeterGroup Component — API

MeterGroup displays scalar measurements within a known range.

## Meter Group

MeterGroup displays scalar measurements within a known range.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, MeterGroupPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | MeterItem[] \| undefined | - | Current value of the metergroup. |
| min | number | - | Mininum boundary value. |
| max | number | - | Maximum boundary value. |
| orientation | "horizontal" \| "vertical" | - | Specifies the layout of the component, valid values are 'horizontal' and 'vertical'. |
| labelPosition | "start" \| "end" | - | Specifies the label position of the component, valid values are 'start' and 'end'. |
| labelOrientation | "horizontal" \| "vertical" | - | Specifies the label orientation of the component, valid values are 'horizontal' and 'vertical'. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| label | TemplateRef<MeterGroupLabelTemplateContext> \| undefined | Custom label template. |
| meter | TemplateRef<MeterGroupMeterTemplateContext> \| undefined | Custom meter template. |
| end | TemplateRef<MeterGroupLabelTemplateContext> \| undefined | Custom end template. |
| start | TemplateRef<MeterGroupLabelTemplateContext> \| undefined | Custom start template. |
| icon | TemplateRef<MeterGroupIconTemplateContext> \| undefined | Custom icon template. |

## Accessibility

Screen Reader MeterGroup component uses meter role in addition to the aria-valuemin , aria-valuemax and aria-valuenow attributes. Value to describe the component can be defined using aria-labelledby prop. Keyboard Support Component does not include any interactive elements.
