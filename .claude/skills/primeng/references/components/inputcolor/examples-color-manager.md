# Angular InputColor Component — Color Manager

## Color Manager

The colorManager module provides utilities for programmatic color manipulation. It exports the Color class and helper functions for working with colors outside of the InputColor component. The Color class is the base class for all color classes. It provides the basic functionality for all color classes. clone() : Clones the color. toString(format) : Converts the color to a string. toFormat(format) : Converts the color to a specific format. toJSON() : Converts the color to a JSON object. getChannelRange(channel) : Returns the range of the channel. getFormat() : Returns the format of the color. getChannels() : Returns the channels of the color. getChannelValue(channel) : Returns the value of the channel. getSpaceAxes(xyChannels) : Returns the axes of the color. incChannelValue(channel, step) : Increments the value of the channel by the step. decChannelValue(channel, step) : Decrements the value of the channel by the step. setChannelValue(channel, value) : Returns a new color with the value of the channel changed.

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <div class="doc-section-description font-bold mb-4">Color class</div>
    `,
    standalone: true,
    imports: []
})
export class InputColorColorManagerDemo {}
```
