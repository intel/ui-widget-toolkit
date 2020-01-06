/// <reference path='../../dist/index.d.ts' />
/// <reference path='../testBase.ts' />
var TreeMapTest;
(function (TreeMapTest) {
    window.onload = () => {
        createView();
        TestBase.render();
    };
    function createView() {
        let treeMap = {
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
            onClick: function (event) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action(elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }]
        };
        TestBase.addElement(treeMap, '', 'group2');
        let treeMap2 = {
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
            onClick: function (event) {
                console.log('diagram click');
                console.log(event.data);
            },
            onDoubleClick: function (event) {
                console.log('diagram double click');
                console.log(event.data);
            },
            contextMenuItems: [{
                    title: 'Edit me to do something!',
                    action(elem, data, index) {
                        console.log('index: ' + index);
                        console.log(data);
                        console.log(elem);
                    }
                }]
        };
        TestBase.addElement(treeMap2, '', 'group2');
    }
    TreeMapTest.createView = createView;
})(TreeMapTest || (TreeMapTest = {}));
//# sourceMappingURL=treeMap.js.map