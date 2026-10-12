# Angular FileUpload Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| input | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the input's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| pcChooseButton | ButtonPassThrough | Used to pass attributes to the choose button component. |
| pcUploadButton | ButtonPassThrough | Used to pass attributes to the upload button component. |
| pcCancelButton | ButtonPassThrough | Used to pass attributes to the cancel button component. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| pcProgressBar | ProgressBarPassThrough | Used to pass attributes to the progress bar component. |
| pcMessage | MessagePassThrough | Used to pass attributes to the message component. |
| fileList | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the file list's DOM element. |
| file | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the file's DOM element. |
| fileThumbnail | PassThroughOption<HTMLImageElement, I> | Used to pass attributes to the file thumbnail's DOM element. |
| fileInfo | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the file info's DOM element. |
| fileName | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the file name's DOM element. |
| fileSize | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the file size's DOM element. |
| pcFileBadge | BadgePassThrough | Used to pass attributes to the file badge component. |
| fileActions | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the file actions's DOM element. |
| pcFileRemoveButton | ButtonPassThrough | Used to pass attributes to the file remove button component. |
| basicContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the basic content's DOM element. |
| empty | PassThroughOption<HTMLElement, I> | Used to pass attributes to the empty's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-fileupload | Class name of the root element |
| p-fileupload-header | Class name of the header element |
| p-fileupload-choose-button | Class name of the choose button element |
| p-fileupload-upload-button | Class name of the upload button element |
| p-fileupload-cancel-button | Class name of the cancel button element |
| p-fileupload-content | Class name of the content element |
| p-fileupload-file-list | Class name of the file list element |
| p-fileupload-file | Class name of the file element |
| p-fileupload-file-thumbnail | Class name of the file thumbnail element |
| p-fileupload-file-info | Class name of the file info element |
| p-fileupload-file-name | Class name of the file name element |
| p-fileupload-file-size | Class name of the file size element |
| p-fileupload-file-badge | Class name of the file badge element |
| p-fileupload-file-actions | Class name of the file actions element |
| p-fileupload-file-remove-button | Class name of the file remove button element |
| p-fileupload-basic-content | Class name of the content in basic mode |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| fileupload.background | --p-fileupload-background | Background of root |
| fileupload.border.color | --p-fileupload-border-color | Border color of root |
| fileupload.color | --p-fileupload-color | Color of root |
| fileupload.border.radius | --p-fileupload-border-radius | Border radius of root |
| fileupload.transition.duration | --p-fileupload-transition-duration | Transition duration of root |
| fileupload.header.background | --p-fileupload-header-background | Background of header |
| fileupload.header.color | --p-fileupload-header-color | Color of header |
| fileupload.header.padding | --p-fileupload-header-padding | Padding of header |
| fileupload.header.border.color | --p-fileupload-header-border-color | Border color of header |
| fileupload.header.border.width | --p-fileupload-header-border-width | Border width of header |
| fileupload.header.border.radius | --p-fileupload-header-border-radius | Border radius of header |
| fileupload.header.gap | --p-fileupload-header-gap | Gap of header |
| fileupload.content.highlight.border.color | --p-fileupload-content-highlight-border-color | Highlight border color of content |
| fileupload.content.padding | --p-fileupload-content-padding | Padding of content |
| fileupload.content.gap | --p-fileupload-content-gap | Gap of content |
| fileupload.file.padding | --p-fileupload-file-padding | Padding of file |
| fileupload.file.gap | --p-fileupload-file-gap | Gap of file |
| fileupload.file.border.color | --p-fileupload-file-border-color | Border color of file |
| fileupload.file.info.gap | --p-fileupload-file-info-gap | Info gap of file |
| fileupload.file.name.color | --p-fileupload-file-name-color | Color of file name |
| fileupload.file.name.font.weight | --p-fileupload-file-name-font-weight | Font weight of file name |
| fileupload.file.name.font.size | --p-fileupload-file-name-font-size | Font size of file name |
| fileupload.file.size.color | --p-fileupload-file-size-color | Color of file size |
| fileupload.file.size.font.weight | --p-fileupload-file-size-font-weight | Font weight of file size |
| fileupload.file.size.font.size | --p-fileupload-file-size-font-size | Font size of file size |
| fileupload.file.list.gap | --p-fileupload-file-list-gap | Gap of file list |
| fileupload.progressbar.height | --p-fileupload-progressbar-height | Height of progressbar |
| fileupload.basic.gap | --p-fileupload-basic-gap | Gap of basic |

---
