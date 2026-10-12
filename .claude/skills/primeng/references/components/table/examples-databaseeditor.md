# Angular Table Component — Databaseeditor

## Databaseeditor

A spreadsheet-style table editor composed from Table , Menu , Checkbox , Drawer and Select : typed column headers with a per-column menu (sort, copy, edit, freeze, delete), select-all and per-row checkboxes, a global filter, in-place cell editing, frozen columns, an empty-table state, plus working insert-row and add/edit-column flows that open a side drawer.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Menu, MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { Search } from '@primeicons/angular/search';
import { Trash } from '@primeicons/angular/trash';
import { Plus } from '@primeicons/angular/plus';
import { Key } from '@primeicons/angular/key';
import { Lock } from '@primeicons/angular/lock';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';
import { ChevronDown } from '@primeicons/angular/chevron-down';

interface DbColumn {
    field: string;
    type: string;
    pk?: boolean;
    frozen?: boolean;
}

interface DbRow {
    __rid: number;
    [key: string]: any;
}

@Component({
    template: `
        <div #dbContainer class="relative w-full overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700">
            <div class="flex items-center gap-2 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 px-3 py-2">
                <p-iconfield class="flex-1 max-w-md">
                    <p-inputicon>
                        <svg data-p-icon="search" />
                    </p-inputicon>
                    <input pInputText type="text" (input)="dt.filterGlobal($event.target.value, 'contains')" placeholder="Filter by id, created_at or email" pSize="small" class="w-full" />
                </p-iconfield>
                <div class="flex-1"></div>
                @if (selectedRows.length) {
                    <button type="button" pButton size="small" severity="danger" variant="outlined" (click)="deleteSelected()">
                        <svg data-p-icon="trash" class="mr-1" />
                        Delete {{ selectedRows.length }}
                    </button>
                }
                <button type="button" pButton size="small" (click)="rowDrawer = true">
                    <svg data-p-icon="plus" class="mr-1" />
                    Insert
                </button>
            </div>
            <p-table
                #dt
                [value]="viewRows"
                [(selection)]="selectedRows"
                dataKey="__rid"
                [columns]="columns"
                [globalFilterFields]="globalFilterFields"
                [scrollable]="true"
                [paginator]="true"
                [rows]="10"
                [totalRecords]="viewRows.length"
                paginatorDropdownAppendTo="body"
                [rowsPerPageOptions]="[10, 20, 50, 100]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Page {currentPage} of {totalPages} • {totalRecords} records"
                [reorderableColumns]="true"
            >
                <ng-template #header let-cols>
                    <tr>
                        <th pFrozenColumn style="width: 3rem">
                            <p-table-header-checkbox />
                        </th>
                        @for (col of cols; track col.field) {
                            <th pReorderableColumn pFrozenColumn [frozen]="col.frozen ?? false" style="min-width: 12rem" (dragstart)="colMenu.hide()">
                                <div class="flex items-center justify-between gap-2 w-full">
                                    <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
                                        @if (col.pk) {
                                            <svg data-p-icon="key" class="text-emerald-500" style="width: 13px" />
                                        }
                                        @if (col.frozen) {
                                            <svg data-p-icon="lock" class="text-surface-400" style="width: 11px" />
                                        }
                                        <span class="font-semibold">{{ col.field }}</span>
                                        <span class="font-mono font-normal text-surface-400 dark:text-surface-500">{{ col.type }}</span>
                                        @if (sortField === col.field && sortOrder === 1) {
                                            <svg data-p-icon="arrow-up" style="width: 11px" />
                                        }
                                        @if (sortField === col.field && sortOrder === -1) {
                                            <svg data-p-icon="arrow-down" style="width: 11px" />
                                        }
                                    </span>
                                    <button type="button" pButton iconOnly variant="text" severity="secondary" size="small" [attr.aria-label]="col.field + ' options'" (click)="toggleColMenu($event, col)">
                                        <svg data-p-icon="chevron-down" />
                                    </button>
                                </div>
                            </th>
                        }
                        <th style="width: 3rem">
                            <button type="button" pButton iconOnly variant="text" severity="secondary" size="small" aria-label="Add column" (click)="openAddColumn()">
                                <svg data-p-icon="plus" />
                            </button>
                        </th>
                    </tr>
                </ng-template>
                <ng-template #body let-row let-cols="columns">
                    <tr>
                        <td pFrozenColumn>
                            <p-table-checkbox [value]="row" />
                        </td>
                        @for (col of cols; track col.field) {
                            <td [pEditableColumn]="row[col.field]" [pEditableColumnField]="col.field" pFrozenColumn [frozen]="col.frozen ?? false" style="min-width: 12rem">
                                <p-cell-editor>
                                    <ng-template #input>
                                        @if (col.field === 'plan') {
                                            <p-select [options]="planOptions" [(ngModel)]="row[col.field]" optionLabel="label" optionValue="value" size="small" appendTo="body" fluid />
                                        } @else {
                                            <input pInputText [(ngModel)]="row[col.field]" pSize="small" class="w-full" />
                                        }
                                    </ng-template>
                                    <ng-template #output>
                                        <span class="flex h-7 items-center whitespace-nowrap text-xs" [class.font-mono]="col.type !== 'text' || col.field === 'plan'">
                                            @if (row[col.field] != null) {
                                                {{ row[col.field] }}
                                            } @else {
                                                <span class="text-surface-400 dark:text-surface-600">NULL</span>
                                            }
                                        </span>
                                    </ng-template>
                                </p-cell-editor>
                            </td>
                        }
                        <td></td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td [attr.colspan]="columns.length + 2">
                            <div class="py-24 text-center text-sm text-surface-500 dark:text-surface-400">This table is empty</div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
            <p-menu #colMenu [model]="colMenuModel" [popup]="true" appendTo="body" />
            <p-drawer [(visible)]="rowDrawer" position="right" header="Insert row" [appendTo]="dbContainer" styleClass="w-full! md:w-96!">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="draft-email" class="font-medium">email <span class="font-mono text-xs text-surface-400">text</span></label>
                        <input pInputText id="draft-email" [(ngModel)]="draftEmail" placeholder="name@example.com" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-medium">plan <span class="font-mono text-xs text-surface-400">text</span></label>
                        <p-select [options]="planOptions" [(ngModel)]="draftPlan" optionLabel="label" optionValue="value" fluid />
                    </div>
                    <p class="text-xs text-surface-500 dark:text-surface-400"><span class="font-mono">id</span> and <span class="font-mono">created_at</span> are filled automatically.</p>
                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" pButton variant="text" severity="secondary" (click)="rowDrawer = false">Cancel</button>
                        <button type="button" pButton [disabled]="!draftEmail.trim()" (click)="insertRow()">Save</button>
                    </div>
                </div>
            </p-drawer>
            <p-drawer [(visible)]="colDrawer" position="right" [header]="editingField ? 'Edit column' : 'Add column'" [appendTo]="dbContainer" styleClass="w-full! md:w-96!">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="draft-col" class="font-medium">Name</label>
                        <input pInputText id="draft-col" [(ngModel)]="draftColName" placeholder="column_name" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-medium">Type</label>
                        <p-select [options]="typeOptions" [(ngModel)]="draftColType" optionLabel="label" optionValue="value" size="small" fluid />
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" pButton variant="text" severity="secondary" (click)="colDrawer = false">Cancel</button>
                        <button type="button" pButton [disabled]="!canSaveColumn()" (click)="saveColumn()">{{ editingField ? 'Save' : 'Add' }}</button>
                    </div>
                </div>
            </p-drawer>
        </div>
    `,
    standalone: true,
    imports: [DrawerModule, SelectModule, IconFieldModule, InputIconModule, MenuModule, TableModule, ButtonModule, InputTextModule, FormsModule, Search, Trash, Plus, Key, Lock, ArrowUp, ArrowDown, ChevronDown]
})
export class TableDatabaseEditorDemo {
    rows: DbRow[] = createSeed();

    columns: DbColumn[] = [
        { field: 'id', type: 'int8', pk: true },
        { field: 'created_at', type: 'timestamptz' },
        { field: 'email', type: 'text' },
        { field: 'plan', type: 'text' }
    ];

    viewRows: DbRow[] = this.rows;

    globalFilterFields: string[] = this.columns.map((c) => c.field);

    selectedRows: DbRow[] = [];

    sortField: string | null = null;

    sortOrder: number = 0;

    colMenuModel: MenuItem[] = [];

    rowDrawer: boolean = false;

    draftEmail: string = '';

    draftPlan: string = 'free';

    colDrawer: boolean = false;

    editingField: string | null = null;

    draftColName: string = '';

    draftColType: string = 'text';

    planOptions = [
        { label: 'free', value: 'free' },
        { label: 'pro', value: 'pro' },
        { label: 'team', value: 'team' }
    ];

    typeOptions = [
        { label: 'text', value: 'text' },
        { label: 'int8', value: 'int8' },
        { label: 'bool', value: 'bool' },
        { label: 'timestamptz', value: 'timestamptz' }
    ];

    updateView() {
        if (!this.sortField || !this.sortOrder) {
            this.viewRows = this.rows;

            return;
        }

        const f = this.sortField;
        const o = this.sortOrder;

        this.viewRows = [...this.rows].sort((a, b) => {
            const av = a[f];
            const bv = b[f];

            if (av == null) return 1;

            if (bv == null) return -1;

            const r = av < bv ? -1 : av > bv ? 1 : 0;

            return o * r;
        });
    }

    sortBy(field: string, order: number) {
        this.sortField = field;
        this.sortOrder = order;
        this.updateView();
    }

    copyName(field: string) {
        if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(field);
    }

    freezeColumn(field: string) {
        this.columns = this.columns.map((c) => (c.field === field ? { ...c, frozen: !c.frozen } : c));
    }

    deleteColumn(field: string) {
        this.columns = this.columns.filter((c) => c.field !== field);
        this.globalFilterFields = this.columns.map((c) => c.field);
    }

    openAddColumn() {
        this.editingField = null;
        this.draftColName = '';
        this.draftColType = 'text';
        this.colDrawer = true;
    }

    openEditColumn(col: DbColumn) {
        this.editingField = col.field;
        this.draftColName = col.field;
        this.draftColType = col.type;
        this.colDrawer = true;
    }

    canSaveColumn() {
        const name = this.draftColName.trim();

        return !!name && !this.columns.some((c) => c.field === name && c.field !== this.editingField);
    }

    saveColumn() {
        const name = this.draftColName.trim();

        if (!name) return;

        if (this.editingField) {
            const oldField = this.editingField;

            this.columns = this.columns.map((c) => (c.field === oldField ? { ...c, field: name, type: this.draftColType } : c));

            if (name !== oldField) {
                this.rows = this.rows.map((r) => {
                    const { [oldField]: oldValue, ...rest } = r;

                    return { ...rest, [name]: oldValue } as DbRow;
                });
            }
        } else {
            if (this.columns.some((c) => c.field === name)) return;

            this.columns = [...this.columns, { field: name, type: this.draftColType }];
        }

        this.globalFilterFields = this.columns.map((c) => c.field);
        this.colDrawer = false;
        this.editingField = null;
        this.updateView();
    }

    insertRow() {
        if (!this.draftEmail.trim()) return;

        const nextRid = this.rows.reduce((max, r) => Math.max(max, r.__rid), 0) + 1;
        const nextId = this.rows.reduce((max, r) => Math.max(max, Number(r['id']) || 0), 0) + 1;

        this.rows = [...this.rows, { __rid: nextRid, id: nextId, created_at: '2026-06-04 12:00:00+00', email: this.draftEmail.trim(), plan: this.draftPlan }];
        this.draftEmail = '';
        this.draftPlan = 'free';
        this.rowDrawer = false;
        this.updateView();
    }

    deleteSelected() {
        const selectedIds = new Set(this.selectedRows.map((r) => r.__rid));

        this.rows = this.rows.filter((r) => !selectedIds.has(r.__rid));
        this.selectedRows = [];
        this.updateView();
    }

    toggleColMenu(event: Event, col: DbColumn) {
        this.colMenuModel = [
            { label: 'Sort Ascending', icon: 'pi pi-arrow-up', command: () => this.sortBy(col.field, 1) },
            { label: 'Sort Descending', icon: 'pi pi-arrow-down', command: () => this.sortBy(col.field, -1) },
            { separator: true },
            { label: 'Copy name', icon: 'pi pi-copy', command: () => this.copyName(col.field) },
            { label: 'Edit column', icon: 'pi pi-pencil', command: () => this.openEditColumn(col) },
            { label: col.frozen ? 'Unfreeze column' : 'Freeze column', icon: 'pi pi-lock', command: () => this.freezeColumn(col.field) },
            { separator: true },
            { label: 'Delete column', icon: 'pi pi-trash', styleClass: 'text-red-600', command: () => this.deleteColumn(col.field) }
        ];
        this.colMenu.toggle(event);
    }
}
```
