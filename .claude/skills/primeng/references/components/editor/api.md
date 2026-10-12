# Angular Editor Component — API

Editor is rich text editor component based on Quill.

## Editor

Editor groups a collection of contents in tabs.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, EditorPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the container. |
| placeholder | string \| undefined | - | Placeholder text to show when editor is empty. |
| formats | string[] \| undefined | - | Whitelist of formats to display, see [here](https://quilljs.com/docs/formats/) for available options. |
| modules | object \| undefined | - | Modules configuration of Editor, see [here](https://quilljs.com/docs/modules/) for available options. |
| bounds | string \| HTMLElement \| undefined | - | DOM Element or a CSS selector for a DOM Element, within which the editor's p elements (i.e. tooltips, etc.) should be confined. Currently, it only considers left and right boundaries. |
| scrollingContainer | string \| HTMLElement \| undefined | - | DOM Element or a CSS selector for a DOM Element, specifying which container has the scrollbars (i.e. overflow-y: auto), if is has been changed from the default ql-editor with custom CSS. Necessary to fix scroll jumping bugs when Quill is set to auto grow its height, and another ancestor container is responsible from the scrolling.. |
| debug | string \| undefined | - | Shortcut for debug. Note debug is a static method and will affect other instances of Quill editors on the page. Only warning and error messages are enabled by default. |
| readonly | boolean | - | Whether to instantiate the editor to read-only mode. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onEditorInit | event: EditorInitEvent | Callback to invoke when the quill modules are loaded. |
| onTextChange | event: EditorTextChangeEvent | Callback to invoke when text of editor changes. |
| onSelectionChange | event: EditorSelectionChangeEvent | Callback to invoke when selection of the text changes. |
| onEditorChange | event: EditorChangeEvent | Callback to invoke when editor content changes (combines both text and selection changes). |
| onFocus | event: EditorFocusEvent | Callback to invoke when editor receives focus. |
| onBlur | event: EditorBlurEvent | Callback to invoke when editor loses focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<any> \| undefined | Custom item template. |

## Accessibility

Quill performs generally well in terms of accessibility. The elements in the toolbar can be tabbed and have the necessary ARIA roles/attributes for screen readers. One known limitation is the lack of arrow key support for dropdowns in the toolbar that may be overcome with a custom toolbar.
