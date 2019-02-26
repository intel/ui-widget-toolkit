import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import './ui-widget-toolkit-checkbox-tree.css';

export class UWTCheckboxTreeNodeRow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.checked === undefined ? false : this.props.checked,
            indeterminate: this.props.indeterminate === undefined ? false : this.props.indeterminate
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            checked: nextProps.checked === undefined ? false : nextProps.checked,
            indeterminate: nextProps.indeterminate === undefined ? false : nextProps.indeterminate
        })
    }

    render() {
        if (this.props.notCheckable) {
            return <div style={{ 'marginLeft': '0px' }}>{this.props.name}</div>;
        } else if (this.state.indeterminate) {
            return <FormControlLabel style={{ 'marginLeft': '0px' }}
                control={<Checkbox title={this.props.name}
                    indeterminate
                    checked={this.state.checked}
                    onChange={this.props.onCheckChanged} />}
                label={this.props.name}
            />
        } else {
            return <FormControlLabel style={{ 'marginLeft': '0px' }}
                control={<Checkbox title={this.props.name}
                    checked={this.state.checked}
                    onChange={this.props.onCheckChanged} />}
                label={this.props.name}
            />
        }
    }
}

export class UWTCheckboxTreeNode extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: this.props.data.open,
            name: this.props.data.name,
            parent: this.props.parent,
            children: this.props.data.children,
            checked: this.props.data.checked === undefined ? false : this.props.data.checked,
            notCheckable: this.props.data.notCheckable,
            indeterminate: this.props.data.indeterminate === undefined ? false : this.props.data.indeterminate
        }
        this.openIcon = '\u2212';
        this.closedIcon = '';
        this.preiconClass = '';
        if (this.state.children && this.state.children.length > 0) {
            this.closedIcon = '\u002B';
            this.preiconClass = 'node-preicon';
        }
    }

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        this.setState({
            open: nextProps.data.open,
            name: nextProps.data.name,
            parent: nextProps.parent,
            children: nextProps.data.children,
            checked: nextProps.data.checked,
            notCheckable: nextProps.data.notCheckable,
            indeterminate: nextProps.data.indeterminate
        });
    }
    _emitCheckChanged(nodeData) {
        if (this.props.onCheckChanged) {
            this.props.onCheckChanged(nodeData);
        }
    }
    _emitCheckCompleted(nodeData) {
        if (this.props.onCheckCompleted) {
            this.onCheckCompleted(nodeData);
        }
    }

    /**
     * Returns the parent tree node. Returns `null` if root.
     */
    getParent() {
        return this.state.parent;
    }
    /**
     * Returns the children tree nodes.
     */
    getChildren() {
        return this.state.children;
    }

    _computePadding() {
        var children = this.getChildren();
        return children && children.length ? {} : { 'padding-left': '18px' };
    }

    _updateChildCheckBox(nodeData, checked) {
        if (nodeData.checked !== checked) {
            nodeData.checked = checked;
            this._emitCheckChanged(nodeData);
        }

        if (nodeData.children) {
            // check things from bottom to top so when I scroll to last
            // checked thing it goes to the top element not the bottom
            for (let j = nodeData.children.length - 1; j >= 0; --j) {
                let childData = nodeData.children[j];
                this._updateChildCheckBox(childData, checked);
            }
        }
    }

    _updateParentCheckBox(parentData) {
        if (parentData) {
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
                parentData.checked = true;
                parentData.indeterminate = true;
            }

            if (this.props.onCheckChanged) {
                this.props.onCheckChanged(parentData)
            }
        }
    }

    _onCheckChanged($event) {
        this.setState((prevState, props) => {
            if (prevState.indeterminate) {
                prevState.indeterminate = false;
                prevState.checked = true;
            } else {
                prevState.checked = !prevState.checked;
            }

            this._updateChildCheckBox(prevState, prevState.checked);
            if (this.props.onCheckChanged) {
                this.props.onCheckChanged(prevState);
            }
            return { state: prevState.indeterminate, checked: prevState.checked };
        })
    }

    /**
     * Display/Hide the children nodes.
     */
    toggleChildren() {
        this.setState({
            open: !this.state.open && this.state.children && this.state.children.length > 0
        });
    }
    render() {
        let self = this;
        if (this.state.open) {
            return <div className='node-row'>
                <span className={this.preiconClass} onClick={((e) => self.toggleChildren())}>{this.openIcon}</span>
                <UWTCheckboxTreeNodeRow name={this.state.name}
                    notCheckable={this.state.notCheckable}
                    indeterminate={this.state.indeterminate}
                    checked={this.state.checked}
                    onCheckChanged={(e) => self._onCheckChanged(e)}></UWTCheckboxTreeNodeRow>
                <ul>
                    {this.state.children && this.state.children.map((item, i) => {
                        return <li key={item.name}>
                            <UWTCheckboxTreeNode
                                id={item.name}
                                parent={this.state}
                                data={item}
                                onCheckChanged={(state) => {
                                    self.state.children[i] = state;
                                    self._updateParentCheckBox(self.state);
                                }}
                                className='checkbox-tree-node'>
                            </UWTCheckboxTreeNode>
                        </li>
                    })}
                </ul>
            </div>
        } else {
            return <div className='node-row'>
                <span className={this.preiconClass} onClick={((e) => self.toggleChildren(e))}>{this.closedIcon}</span>
                <UWTCheckboxTreeNodeRow name={this.state.name}
                    notCheckable={this.state.notCheckable}
                    indeterminate={this.state.indeterminate}
                    checked={this.state.checked}
                    onCheckChanged={(e) => self._onCheckChanged(e)}></UWTCheckboxTreeNodeRow>
            </div>
        }
    }
}

export class UWTCheckboxTree extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: this.props.data,
        }
    }

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.data != this.props.data) {
            this.setState({
                data: nextProps.data
            });
        }
    }

    render() {
        if (this.state.data) {
            let self = this;
            return <UWTCheckboxTreeNode id='root'
                data={this.state.data}
                onCheckChanged={
                    (state) => {
                        self.setState({
                            data: state
                        })
                        if (self.props.onCheckChanged) {
                            self.props.onCheckChanged(state)
                        }
                    }}
                className='checkbox-tree-node'>
            </UWTCheckboxTreeNode>
        } else {
            return <div></div>
        }
    }
}