# Angular MeterGroup Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| meters | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the meters' DOM element. |
| meter | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the meter's DOM element. |
| labelList | PassThroughOption<HTMLOListElement, I> | Used to pass attributes to the label list's DOM element. |
| label | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the label's DOM element. |
| labelIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the label icon's DOM element. |
| labelMarker | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the label marker's DOM element. |
| labelText | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the label text's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-metergroup | Class name of the root element |
| p-metergroup-meters | Class name of the meters element |
| p-metergroup-meter | Class name of the meter element |
| p-metergroup-label-list | Class name of the label list element |
| p-metergroup-label | Class name of the label element |
| p-metergroup-label-icon | Class name of the label icon element |
| p-metergroup-label-marker | Class name of the label marker element |
| p-metergroup-label-text | Class name of the label text element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| metergroup.border.radius | --p-metergroup-border-radius | Border radius of root |
| metergroup.gap | --p-metergroup-gap | Gap of root |
| metergroup.meters.background | --p-metergroup-meters-background | Background of meters |
| metergroup.meters.size | --p-metergroup-meters-size | Size of meters |
| metergroup.label.gap | --p-metergroup-label-gap | Gap of label |
| metergroup.label.marker.size | --p-metergroup-label-marker-size | Size of label marker |
| metergroup.label.text.font.weight | --p-metergroup-label-text-font-weight | Font weight of label text |
| metergroup.label.text.font.size | --p-metergroup-label-text-font-size | Font size of label text |
| metergroup.label.icon.size | --p-metergroup-label-icon-size | Size of label icon |
| metergroup.label.list.vertical.gap | --p-metergroup-label-list-vertical-gap | Vertical gap of label list |
| metergroup.label.list.horizontal.gap | --p-metergroup-label-list-horizontal-gap | Horizontal gap of label list |

---
