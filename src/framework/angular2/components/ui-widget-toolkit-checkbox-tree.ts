import {
    Component, Input, DoCheck, OnChanges, Output, NgModule,
    EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material';

import { ICheckboxTreeNode } from '../../../interface/ui-base';

@Component({
    selector: 'uwt-checkbox-tree-node',
    styles: [`
        .node-row {
            padding-left: 4px;
            padding-right: 4px;
            white-space: nowrap;
        }

        .node-preicon.collapsed,
        .node-preicon.expanded {
            padding-left: 0px;
        }

        .node-preicon:before {
            margin-right: 5px;
        }

        .node-preicon.collapsed:before {
            content: '\u002B';
        }

        .node-preicon.expanded:before {
            content: '\u2212';
        }

        .node-preicon,
        .node-name {
            cursor: pointer;
        }

        ul {
            margin: 0;
            padding-left: 20px;
        }

        li {
            list-style-type: none;
        }
    `],
    template: `
        <div class='node-row' title='{{def.name}}'>
            <span *ngIf='def.children && def.children.length' [ngClass]='_computeClass()' (click)='toggleChildren()'></span>
            <mat-checkbox *ngIf='!def.notCheckable' [ngStyle]='_computePadding()' [checked]='def.checked' [indeterminate]='def.indeterminate' (change)='_onCheckChanged($event)'>{{def.name}}</mat-checkbox>
            <ng-container *ngIf='def.notCheckable' [ngStyle]='_computePadding()'>{{def.name}}</ng-container>
        </div>
        <ul [hidden]='!def.open'>
            <li *ngFor='let child of def.children'>
                <uwt-checkbox-tree-node id='{{child.name}}' [def]='child' (onCheckChanged)='_emitCheckChanged($event)'
                (onCheckCompleted)='_emitCheckCompleted($event)'
                 class='checkbox-tree-node'></uwt-checkbox-tree-node>
            </li>
        </ul>
    `
})

export class UWTCheckboxTreeNodeImpl implements OnChanges, DoCheck {
    @Input() def: ICheckboxTreeNode;
    @Output() onCheckChanged: EventEmitter<any> = new EventEmitter();
    @Output() onCheckCompleted: EventEmitter<any> = new EventEmitter();

    id: any;
    /**
     * Called whenever the data is changed to notify the lower nodes.
     */
    ngOnChanges() {
        this._initializeChildren(this.def);
    }

    ngDoCheck() {
        let self = this;

        if (self.def.propogateChange) {
            self.handleCheckChanged(self.def);
            self.def.propogateChange = false;
        }
    }

    _emitCheckChanged($event: any) {
        this.onCheckChanged.emit($event);
    }

    _emitCheckCompleted($event: any) {
        this.onCheckCompleted.emit($event);
    }

    _onCheckChanged($event: any) {
        this.def.checked = !this.def.checked;
        this.handleCheckChanged($event);
    }

    handleCheckChanged($event: any) {
        if (this.def.indeterminate) {
            this.def.checked = true;
            this.def.indeterminate = false;
        }

        this._emitCheckChanged(this.def);
        this._updateChildCheckBox(this.def, this.def.checked);
        this._updateParentCheckBox(this.def.parent);
        this._emitCheckCompleted($event);
    }

    _updateChildCheckBox(nodeData: any, checked: boolean) {
        if (nodeData.checked !== checked) {
            nodeData.checked = checked;
            this._emitCheckChanged(nodeData);
        }

        if (nodeData.children) {
            // check things from bottom to top so when I scroll to last
            // checked thing it goes to the top element not the bottom
            for (let j = nodeData.children.length - 1; j >= 0; --j) {
                let child = nodeData.children[j];
                this._updateChildCheckBox(child, checked);
            }
        }
    }

    _updateParentCheckBox(parentData: any) {
        if (parentData && parentData.children) {
            let allChildChecked = true;
            let noChildChecked = true;

            for (let child of parentData.children) {
                if (child.indeterminate) {
                    allChildChecked = false;
                    noChildChecked = false;
                    break;
                } else if (!child.checked) {
                    allChildChecked = false;
                } else if (child.checked) {
                    noChildChecked = false;
                }
            }

            if (allChildChecked) {
                parentData.checked = true;
                parentData.indeterminate = false;
            } else if (noChildChecked) {
                parentData.checked = false;
                parentData.indeterminate = false;
            } else {
                parentData.checked = false;
                parentData.indeterminate = true;
            }
            this._updateParentCheckBox(parentData.parent);
        }
    }

    _initializeChildren(node: ICheckboxTreeNode) {
        if (node && node.open) {
            for (let i = 0; i < node.children.length; ++i) {
                node.children[i].parent = node;
                if (node.children[i].open) {
                    this._initializeChildren(node.children[i]);
                }
            }
        }
    }

    /**
     * Returns the necessary classes.
     *
     * @return {string} The class name indicating whether the node is open or closed
     */
    _computeClass() {
        var open = this.def.open;
        var children = this.getChildren();
        return 'node-preicon ' + ((open && children && children.length) ? 'expanded' : children && children.length ? 'collapsed' : '');
    }
    _computePadding() {
        var children = this.getChildren();
        return children && children.length ? {} : { 'padding-left': '18px' };
    }
    /**
     * Returns the parent tree node. Returns `null` if root.
     */
    getParent() {
        return this.def.parent;
    }
    /**
     * Returns the children tree nodes.
     */
    getChildren() {
        return this.def.children;
    }
    /**
     * Display/Hide the children nodes.
     */
    toggleChildren() {
        this.def.open = !this.def.open && this.def.children && this.def.children.length > 0;
        this._initializeChildren(this.def);
    }
}

@Component({
    selector: 'uwt-checkbox-tree',
    template: `
        <div>
            <uwt-checkbox-tree-node id='root' [def]='data' (onCheckChanged)='_onCheckChanged($event)'
            (onCheckCompleted)='_onCheckCompleted($event)' class='checkbox-tree-node'></uwt-checkbox-tree-node>
        </div>
        `
})

export class UWTCheckboxTree {
    @Input() data: ICheckboxTreeNode;
    @Output() onCheckChanged: EventEmitter<any> = new EventEmitter();
    @Output() onCheckCompleted: EventEmitter<any> = new EventEmitter();

    _onCheckChanged($event: any) {
        this.onCheckChanged.emit($event);
    }

    _onCheckCompleted($event: any) {
        this.onCheckCompleted.emit($event);
    }
}

@NgModule({
    imports: [CommonModule, MatCheckboxModule],
    declarations: [UWTCheckboxTreeNodeImpl, UWTCheckboxTree],
    exports: [UWTCheckboxTree]
})
export class UWTCheckboxTreeModule { }