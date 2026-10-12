# Angular Image Component — API

Displays an image with preview and tranformation options.

## Image

Displays an image with preview and tranformation options.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ImagePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| imageClass | string \| undefined | - | Style class of the image element. |
| imageStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the image element. |
| src | string \| SafeUrl \| undefined | - | The source path for the main image. |
| srcSet | string \| SafeUrl \| undefined | - | The srcset definition for the main image. |
| sizes | string \| undefined | - | The sizes definition for the main image. |
| previewImageSrc | string \| SafeUrl \| undefined | - | The source path for the preview image. |
| previewImageSrcSet | string \| SafeUrl \| undefined | - | The srcset definition for the preview image. |
| previewImageSizes | string \| undefined | - | The sizes definition for the preview image. |
| alt | string \| undefined | - | Attribute of the preview image element. |
| width | string \| undefined | - | Attribute of the image element. |
| height | string \| undefined | - | Attribute of the image element. |
| loading | ImageLoading \| undefined | - | Attribute of the image element. |
| preview | boolean | - | Controls the preview functionality. |
| modalEnterAnimation | string \| null \| undefined | 'p-modal-enter' | Enter animation class name of modal. |
| modalLeaveAnimation | string \| null \| undefined | 'p-modal-leave' | Leave animation class name of modal. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| maskMotionOptions | MotionOptions \| undefined | - | The motion options for the mask. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onShow | value: any | Triggered when the preview overlay is shown. |
| onHide | value: any | Triggered when the preview overlay is hidden. |
| onImageError | event: Event | This event is triggered if an error occurs while loading an image file. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| indicator | TemplateRef<void> \| undefined | Custom indicator template. |
| rotaterighticon | TemplateRef<void> \| undefined | Custom rotate right icon template. |
| rotatelefticon | TemplateRef<void> \| undefined | Custom rotate left icon template. |
| zoomouticon | TemplateRef<void> \| undefined | Custom zoom out icon template. |
| zoominicon | TemplateRef<void> \| undefined | Custom zoom in icon template. |
| closeicon | TemplateRef<void> \| undefined | Custom close icon template. |
| preview | TemplateRef<ImagePreviewTemplateContext> \| undefined | Custom preview template. |
| image | TemplateRef<ImageImageTemplateContext> \| undefined | Custom image template. |

## Accessibility

Screen Reader The preview button is a native button element with an aria-label that refers to the aria.zoomImage property of the locale API by default. When preview is active, dialog role with aria-modal is applied to the overlay image container. Button controls use aria.rotateRight , aria.rotateLeft , aria.zoomIn , aria.zoomOut and aria.close from the locale API as aria-label . ButtonBar Keyboard Support When preview is activated, close button receives the initial focus. Key Function tab Moves focus through button bar. enter Activates the button. space Activates the button. esc Closes the image preview.
