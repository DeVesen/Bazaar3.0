# Angular Gallery Component — API

Galleria is an advanced content gallery component.

## Galleria

Galleria is an advanced content gallery component.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, GalleriaPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| activeIndex | number | - | Index of the first item. |
| fullScreen | boolean | - | Whether to display the component on fullscreen. |
| id | string \| undefined | - | Unique identifier of the element. |
| value | any[] \| undefined | - | An array of objects to display. |
| numVisible | number | - | Number of items per page. |
| responsiveOptions | GalleriaResponsiveOptions[] \| undefined | - | An array of options for responsive design. |
| showItemNavigators | boolean | - | Whether to display navigation buttons in item section. |
| showThumbnailNavigators | boolean | - | Whether to display navigation buttons in thumbnail container. |
| showItemNavigatorsOnHover | boolean | - | Whether to display navigation buttons on item hover. |
| changeItemOnIndicatorHover | boolean | - | When enabled, item is changed on indicator hover. |
| circular | boolean | - | Defines if scrolling would be infinite. |
| autoPlay | boolean | - | Items are displayed with a slideshow in autoPlay mode. |
| shouldStopAutoplayByClick | boolean | - | When enabled, autorun should stop by click. |
| transitionInterval | number | - | Time in milliseconds to scroll items. |
| showThumbnails | boolean | - | Whether to display thumbnail container. |
| thumbnailsPosition | "bottom" \| "top" \| "left" \| "right" | - | Position of thumbnails. |
| verticalThumbnailViewPortHeight | string | - | Height of the viewport in vertical thumbnail. |
| showIndicators | boolean | - | Whether to display indicator container. |
| showIndicatorsOnItem | boolean | - | When enabled, indicator container is displayed on item container. |
| indicatorsPosition | "bottom" \| "top" \| "left" \| "right" | - | Position of indicators. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| maskClass | string \| undefined | - | Style class of the mask on fullscreen mode. |
| containerClass | string \| undefined | - | Style class of the component on fullscreen mode. Otherwise, the 'class' property can be used. |
| containerStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the component on fullscreen mode. Otherwise, the 'style' property can be used. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| maskMotionOptions | MotionOptions \| undefined | - | The mask motion options. |
| visible | boolean | - | Specifies the visibility of the mask on fullscreen mode. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| activeIndexChange | value: number | Callback to invoke on active index change. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| indicator | TemplateRef<GalleriaIndicatorTemplateContext> \| undefined | Custom indicator template. |
| caption | TemplateRef<GalleriaCaptionTemplateContext<any>> \| undefined | Custom caption template. |
| closeicon | TemplateRef<void> \| undefined | Custom close icon template. |
| previousthumbnailicon | TemplateRef<void> \| undefined | Custom previous thumbnail icon template. |
| nextthumbnailicon | TemplateRef<void> \| undefined | Custom next thumbnail icon template. |
| itempreviousicon | TemplateRef<void> \| undefined | Custom item previous icon template. |
| itemnexticon | TemplateRef<void> \| undefined | Custom item next icon template. |
| item | TemplateRef<GalleriaItemTemplateContext<any>> \| undefined | Custom item template. |
| thumbnail | TemplateRef<GalleriaThumbnailTemplateContext<any>> \| undefined | Custom thumbnail template. |

## Accessibility

Screen Reader Galleria uses region role and since any attribute is passed to the main container element, attributes such as aria-label and aria-roledescription can be used as well. The slides container has aria-live attribute set as "polite" if galleria is not in autoplay mode, otherwise "off" would be the value in autoplay. A slide has a group role with an aria-label that refers to the aria.slideNumber property of the locale API. Similarly aria.slide is used as the aria-roledescription of the item. Inactive slides are hidden from the readers with aria-hidden . Next and Previous navigators are button elements with aria-label attributes referring to the aria.nextPageLabel and aria.firstPageLabel properties of the locale API by default respectively, you may still use your own aria roles and attributes as any valid attribute is passed to the button elements implicitly by using nextButtonProps and prevButtonProps . Quick navigation elements and thumnbails follow the tab pattern. They are placed inside an element with a tablist role whereas each item has a tab role with aria-selected and aria-controls attributes. The aria-label attribute of a quick navigation item refers to the aria.pageLabel of the locale API. Current page is marked with aria-current . In full screen mode, modal element uses dialog role with aria-modal enabled. The close button retrieves aria-label from the aria.close property of the locale API. Next/Prev Keyboard Support Key Function tab Moves focus through interactive elements in the carousel. enter Activates navigation. space Activates navigation. Quick Navigation Keyboard Support Key Function tab Moves focus through the active slide link. enter Activates the focused slide link. space Activates the focused slide link. right arrow Moves focus to the next slide link. left arrow Moves focus to the previous slide link. home Moves focus to the first slide link. end Moves focus to the last slide link.
