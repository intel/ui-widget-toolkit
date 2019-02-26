/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />

module TreeMapTest {
    window.onload = () => {
        createView();
        TestBase.render();
    };

    export function createView() {
        let treeMap: UWT.ITreeMap = {
            type: UWT.UIType.TreeMap,
            root: {
                id: 'key1',
                name: 'foo',
                value: 25,
                children: [{
                    id: 'key2',
                    name: 'bar',
                    value: 50,
                    children: [{
                        id: 'key3',
                        name: 'bar2',
                        value: 50
                    }, {
                        id: 'key4',
                        name: 'abc2',
                        value: 25
                    }]
                }, {
                    id: 'key5',
                    name: 'abc',
                    value: 25,
                    children: [{
                        id: 'key6',
                        name: 'bar3',
                        value: 50
                    }, {
                        id: 'key7',
                        name: 'abc3',
                        value: 25
                    }]
                }]
            },
            onClick: function (event: UWT.IEvent) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event: UWT.IEvent) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                title: 'Edit me to do something!',
                action(elem: any, data: any, index: any) {
                    console.log('index: ' + index);
                    console.log(data);
                    console.log(elem);
                }
            }],
            render: function (renderer?: UWT.UIRenderer, options?: UWT.IOptions): Promise<any> {
                if (renderer) {
                    renderer.invalidate(treeMap, { height: 400 });
                } else {
                    treeMap.renderer.invalidate(treeMap, { height: 400 });
                }
                return new Promise(function (resolve, reject) {
                    resolve(true);
                });
            }
        }
        TestBase.elemManager.addElement(treeMap, '', 'group2');

        let treeMap2: UWT.ITreeMap = {
            type: UWT.UIType.TreeMap,
            showChildrenOnHover: true,
            root: {
                id: 'key1',
                name: 'foo',
                value: 25,
                children: [{
                    id: 'key2',
                    name: 'bar',
                    value: 50,
                    children: [{
                        id: 'key3',
                        name: 'bar2',
                        value: 50
                    }, {
                        id: 'key4',
                        name: 'abc2',
                        value: 25
                    }]
                }, {
                    id: 'key5',
                    name: 'abc',
                    value: 25,
                    children: [{
                        id: 'key6',
                        name: 'bar3',
                        value: 50
                    }, {
                        id: 'key7',
                        name: 'abc3',
                        value: 25
                    }]
                }]
            },
            onClick: function (event: UWT.IEvent) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event: UWT.IEvent) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                title: 'Edit me to do something!',
                action(elem: any, data: any, index: any) {
                    console.log('index: ' + index);
                    console.log(data);
                    console.log(elem);
                }
            }],
            render: function (renderer?: UWT.UIRenderer, options?: UWT.IOptions): Promise<any> {
                if (renderer) {
                    renderer.invalidate(treeMap2, { height: 400 });
                } else {
                    treeMap2.renderer.invalidate(treeMap2, { height: 400 });
                }
                return new Promise(function (resolve, reject) {
                    resolve(true);
                });
            }
        }
        TestBase.elemManager.addElement(treeMap2, '', 'group2');
    }
}