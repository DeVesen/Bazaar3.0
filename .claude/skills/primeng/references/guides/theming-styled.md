# Styled Mode

Choose from a variety of pre-styled themes or develop your own.

## Architecture

PrimeNG is a design agnostic library so unlike some other UI libraries it does not enforce a certain styling such as material design. Styling is decoupled from the components using the themes instead. A theme consists of two parts; base and preset . The base is the style rules with CSS variables as placeholders whereas the preset is a set of design tokens to feed a base by mapping the tokens to CSS variables. A base may be configured with different presets, currently Aura, Material, Lara and Nora are the available built-in options. The core of the styled mode architecture is based on a concept named design token , a preset defines the token configuration in 3 tiers; primitive , semantic and component . Learn more about design tokens at the Design Tokens Format Module specification. Primitive Tokens Primitive tokens have no context, a color palette is a good example for a primitive token such as blue-50 to blue-900 . A token named blue-500 may be used as the primary color, the background of a message however on its own, the name of the token does not indicate context. Usually they are utilized by the semantic tokens. Semantic Tokens Semantic tokens define content and their names indicate where they are utilized, a well known example of a semantic token is the primary.color . Semantic tokens map to primitive tokens or other semantic tokens. The colorScheme token group is a special variable to define tokens based on the color scheme active in the application, this allows defining different tokens based on the color scheme like dark mode. Component Tokens Component tokens are isolated tokens per component such as inputtext.background or button.color that map to the semantic tokens. As an example, button.background component token maps to the primary.color semantic token which maps to the green.500 primitive token. Best Practices Use primitive tokens when defining the core color palette and semantic tokens to specify the common design elements such as focus ring, primary colors and surfaces. Components tokens should only be used when customizing a specific component. By defining your own design tokens as a custom preset, you'll be able to define your own style without touching CSS. Overriding the PrimeNG components using style classes is not a best practice and should be the last resort, design tokens are the suggested approach.

## Basefontsize

PrimeNG sizes its components in rem units relative to the document root font size, which it assumes to be 16px , the browser default. Earlier versions assumed 14px for historical reasons, so to avoid disrupting existing layouts every preset also ships a compat variant calibrated for a 14px root. The compat variants are maintained until June 2027 . When migrating an existing application that uses 14px base font to PrimeNG v22 or newer, the recommended path is to switch to the compat preset first to preserve the current appearance, then set the document root size to 16px and move to the standard (non-compat) preset once the rest of the application has been migrated to the 16px baseline. If your application already uses a 16px document root, no change is required and you can use the standard presets directly. Preset 16px 14px (Legacy) Aura &#64;primeuix/themes/aura &#64;primeuix/themes/aura-compat Lara &#64;primeuix/themes/lara &#64;primeuix/themes/lara-compat Material &#64;primeuix/themes/material &#64;primeuix/themes/material-compat Nora &#64;primeuix/themes/nora &#64;primeuix/themes/nora-compat

## Bootstrap

Bootstrap has a reboot utility to reset the CSS of the standard elements. If you are including this utility, you may give it a layer while importing it.

## Colors

Color palette of a preset is defined by the primitive design token group. You can access colors using CSS variables or the $dt utility. @for (color of colors; track color) { {{ color }} @for (shade of shades; track shade) { {{ shade }} } }

## Colorscheme

Tokens can be defined per color scheme using the light-dark keyword, allowing each token to hold scheme-specific values.

## Component

The design tokens of a specific component is defined at components layer. This configuration is global and applies to all card components, in case you need to customize a particular component on a page locally, view the Scoped CSS section for an example. Tip : Overriding component tokens is best suited for small adjustments. For heavy customization, building your own preset is the recommended approach.

## Darkmode

PrimeNG uses the system as the default darkModeSelector in theme configuration. If you have a dark mode switch in your application, set the darkModeSelector to the selector you utilize such as .my-app-dark so that PrimeNG can fit in seamlessly with your color scheme. Following is a very basic example implementation of a dark mode switch, you may extend it further by involving prefers-color-scheme to retrieve it from the system initially and use localStorage to make it stateful. See this article for more information. In case you prefer to use dark mode all the time, apply the darkModeSelector initially and never change it. It is also possible to disable dark mode completely using false or none as the value of the selector.

## Definepreset

The definePreset utility is used to customize an existing preset during the PrimeNG setup. The first parameter is the preset to customize and the second is the design tokens to override.

## Dt

The $dt function returns the information about a token like the full path and value. This would be useful if you need to access tokens programmatically.

## Extend

The theming system can be extended by adding custom design tokens and additional styles. This feature provides a high degree of customization, allowing you to adjust styles according to your needs, as you are not limited to the default tokens. The example preset configuration adds a new accent button with custom button.accent.color and button.accent.inverse.color tokens. It is also possible to add tokens globally to share them within the components.

## Focusring

Focus ring defines the outline width, style, color and offset. Let's use a thicker ring with the primary color for the outline.

## Font

There is no design for fonts as UI components inherit their font settings from the application.

## Forms

The design tokens of the form input components are derived from the form.field token group. This customization example changes border color to primary on hover. Any component that depends on this semantic token such as dropdown.hover.border.color and textarea.hover.border.color would receive the change.

## Libraries

Example layer configuration for the popular CSS libraries.

## Noir

The noir mode is a sleek, monochrome variant where the primary color is derived from the neutral surface palette instead of a distinct accent color. The example below maps the primary palette to surface tones and uses the light-dark function to define the light and dark values of the primary and highlight tokens in a single place;

## Options

The options property defines the how the CSS would be generated from the design tokens of the preset. prefix The prefix of the CSS variables, defaults to p . For instance, the primary.color design token would be var(--p-primary-color) . darkModeSelector The CSS rule to encapsulate the CSS variables of the dark mode, the default is the system to generate {{ '@' }}media (prefers-color-scheme: dark) . If you need to make the dark mode toggleable based on the user selection define a class selector such as .app-dark and toggle this class at the document root. See the dark mode toggle section for an example. cssLayer Defines whether the styles should be defined inside a CSS layer by default or not. A CSS layer would be handy to declare a custom cascade layer for easier customization if necessary. The default is false . cssVariables Controls whether component design tokens are generated as CSS variables or inlined as static values. Primitive and semantic tokens are always generated as CSS variables.

## Palette

Returns shades and tints of a given color from 50 to 950 as an array.

## Presets

Aura, Material, Lara and Nora are the available built-in options, created to demonstrate the power of the design-agnostic theming. Aura is PrimeTek's own vision, Material follows Google Material Design v2, Lara is based on Bootstrap and Nora is inspired by enterprise applications. Visit the source code to learn more about the structure of presets. You may use them out of the box with modifications or utilize them as reference in case you need to build your own presets from scratch.

## Primary

The primary defines the main color palette, default value maps to the emerald primitive token. Let's setup to use indigo instead.

## Reset

In case PrimeNG components have visual issues in your application, a Reset CSS may be the culprit. CSS layers would be an efficient solution that involves enabling the PrimeNG layer, wrapping the Reset CSS in another layer and defining the layer order. This way, your Reset CSS does not get in the way of PrimeNG components.

## Scale

PrimeNG UI component use rem units, 1rem equals to the font size of the html element which is 16px by default. Use the root font-size to adjust the size of the components globally. This website uses 14px as the base so it may differ from your application if your base font size is different.

## Scopedtokens

Design tokens can be scoped to a certain component using the dt property. In this example, first switch uses the global tokens whereas second one overrides the global with its own tokens. This approach is recommended over the ::ng-deep as it offers a cleaner API while avoiding the hassle of CSS rule overrides.

## Specificity

The &#64;layer is a standard CSS feature to define cascade layers for a customizable order of precedence. If you need to become more familiar with layers, visit the documentation at MDN to begin with. The cssLayer is disabled by default, when it is enabled at theme configuration, PrimeNG wraps the built-in style classes under the primeng cascade layer to make the library styles easy to override. CSS in your app without a layer has the highest CSS specificity, so you'll be able to override styles regardless of the location or how strong a class is written.

## Surface

The color scheme palette that varies between light and dark modes is specified with the surface tokens. Example below uses stone for light mode and zinc for dark mode. With this setting, light mode, would have a grayscale tone and dark mode would include bluish tone.

## Theme

The theme property is used to customize the initial theme.

```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        providePrimeNG({
            theme: {
                preset: Aura
                // Default options,
                options: {
                    prefix: 'p',
                    darkModeSelector: 'system',
                    cssLayer: false,
                    cssVariables: true
                }
            }
        })
    ]
};
```

## Typography

Typography tokens are defined at the semantic level for consistency and at the component level for specialization.

## Updatepreset

Merges the provided tokens to the current preset, an example would be changing the primary color palette dynamically.

## Updateprimarypalette

Updates the primary colors, this is a shorthand to do the same update using updatePreset .

## Updatesurfacepalette

Updates the surface colors, this is a shorthand to do the same update using updatePreset .

## Usepreset

Replaces the current presets entirely, common use case is changing the preset dynamically at runtime.

---
