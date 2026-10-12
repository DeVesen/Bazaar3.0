# Angular FileUpload Component — API

FileUpload is an advanced uploader with dragdrop support, multi file uploads, auto uploading, progress tracking and validations.

## File Upload

FileUpload is an advanced uploader with dragdrop support, multi file uploads, auto uploading, progress tracking and validations.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, FileUploadPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| name | string \| undefined | - | Name of the request parameter to identify the files at backend. |
| url | string \| undefined | - | Remote url to upload the files. |
| method | "post" \| "put" | - | HTTP method to send the files to the url such as "post" and "put". |
| multiple | boolean | - | Used to select multiple files at once from file dialog. |
| accept | string \| undefined | - | Comma-separated list of pattern to restrict the allowed file types. Can be any combination of either the MIME types (such as "image/*") or the file extensions (such as ".jpg"). |
| disabled | boolean | - | Disables the upload functionality. |
| auto | boolean | - | When enabled, upload begins automatically after selection is completed. |
| withCredentials | boolean | - | Cross-site Access-Control requests should be made using credentials such as cookies, authorization headers or TLS client certificates. |
| maxFileSize | number \| undefined | - | Maximum file size allowed in bytes. |
| invalidFileSizeMessageSummary | string | - | Summary message of the invalid file size. |
| invalidFileSizeMessageDetail | string | - | Detail message of the invalid file size. |
| invalidFileTypeMessageSummary | string | - | Summary message of the invalid file type. |
| invalidFileTypeMessageDetail | string | - | Detail message of the invalid file type. |
| invalidFileLimitMessageDetail | string | - | Detail message of the invalid file type. |
| invalidFileLimitMessageSummary | string | - | Summary message of the invalid file type. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the element. |
| styleClass | string \| undefined | - | Class of the element. |
| previewWidth | number | - | Width of the image thumbnail in pixels. |
| chooseLabel | string \| undefined | - | Label of the choose button. Defaults to PrimeNG Locale configuration. |
| uploadLabel | string \| undefined | - | Label of the upload button. Defaults to PrimeNG Locale configuration. |
| cancelLabel | string \| undefined | - | Label of the cancel button. Defaults to PrimeNG Locale configuration. |
| chooseIcon | string \| undefined | - | Icon of the choose button. |
| uploadIcon | string \| undefined | - | Icon of the upload button. |
| cancelIcon | string \| undefined | - | Icon of the cancel button. |
| showUploadButton | boolean | - | Whether to show the upload button. |
| showCancelButton | boolean | - | Whether to show the cancel button. |
| mode | "advanced" \| "basic" | - | Defines the UI of the component. |
| headers | HttpHeaders \| undefined | - | HttpHeaders class represents the header configuration options for an HTTP request. |
| customUpload | boolean | - | Whether to use the default upload or a manual implementation defined in uploadHandler callback. Defaults to PrimeNG Locale configuration. |
| fileLimit | number \| undefined | - | Maximum number of files that can be uploaded. |
| uploadStyleClass | string \| undefined | - | Style class of the upload button. |
| cancelStyleClass | string \| undefined | - | Style class of the cancel button. |
| removeStyleClass | string \| undefined | - | Style class of the remove button. |
| chooseStyleClass | string \| undefined | - | Style class of the choose button. |
| chooseButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the choose button. |
| uploadButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the upload button. |
| cancelButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the cancel button. |
| filesInput | File[] | - | Files input. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onBeforeUpload | event: FileBeforeUploadEvent | Callback to invoke before file upload is initialized. |
| onSend | event: FileSendEvent | An event indicating that the request was sent to the server. Useful when a request may be retried multiple times, to distinguish between retries on the final event stream. |
| onUpload | event: FileUploadEvent | Callback to invoke when file upload is complete. |
| onError | event: FileUploadErrorEvent | Callback to invoke if file upload fails. |
| onClear | value: void | Callback to invoke when files in queue are removed without uploading using clear all button. |
| onRemove | event: FileRemoveEvent | Callback to invoke when a file is removed without uploading using clear button of a file. |
| onSelect | event: FileSelectEvent | Callback to invoke when files are selected. |
| onProgress | event: FileProgressEvent | Callback to invoke when files are being uploaded. |
| uploadHandler | event: FileUploadHandlerEvent | Callback to invoke in custom upload mode to upload the files manually. |
| onImageError | event: Event | This event is triggered if an error occurs while loading an image file. |
| onRemoveUploadedFile | event: RemoveUploadedFileEvent | This event is triggered if an error occurs while loading an image file. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| file | TemplateRef<FileUploadFileTemplateContext> \| undefined | Custom file template. |
| header | TemplateRef<FileUploadHeaderTemplateContext> \| undefined | Custom header template. |
| content | TemplateRef<FileUploadContentTemplateContext> \| undefined | Custom content template. |
| toolbar | TemplateRef<void> \| undefined | Custom toolbar template. |
| chooseicon | TemplateRef<void> \| undefined | Custom choose icon template. |
| filelabel | TemplateRef<FileUploadFileLabelTemplateContext> \| undefined | Custom file label template. |
| uploadicon | TemplateRef<void> \| undefined | Custom upload icon template. |
| cancelicon | TemplateRef<void> \| undefined | Custom cancel icon template. |
| empty | TemplateRef<void> \| undefined | Custom empty state template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| uploader |  | void | Uploads the selected files. |
| clear |  | void | Clears the files list. |
| remove | event: Event, index: number | void | Removes a single file. |
| removeUploadedFile | index: number | void | Removes uploaded file. |

## Accessibility

Screen Reader FileUpload uses a hidden native input element with type="file" for screen readers. Keyboard Support Interactive elements of the uploader are buttons, visit the Button accessibility section for more information.
