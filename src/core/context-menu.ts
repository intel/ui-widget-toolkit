import { IContextMenuItem } from '../interface/ui-base';

function positionMenu(div: HTMLDivElement, rect: ClientRect) {
    let bodyWidth = document.body.clientWidth;
    let bodyHeight = document.body.clientHeight;

    // these points define the top left of our menu
    let divX = rect.left;
    let divY = rect.top;
    // if we draw on the right we do
    if (rect.right + div.clientWidth < bodyWidth) {
        divX = rect.right;
    } else {
        divX = rect.left - div.clientWidth;
    }

    // if we cannot draw down we draw up
    if (rect.top + div.clientHeight > bodyHeight) {
        divY = rect.top - div.clientHeight;
    }

    div.style.left = (divX - 2) + 'px';
    div.style.top = (divY - 2) + 'px';
}

function createMenu(event: MouseEvent, data: any, contextMenuItems: IContextMenuItem[], rect: ClientRect,
    propogateEvent: boolean): HTMLDivElement {
    let menuDiv: any;
    menuDiv = document.createElement('div');
    menuDiv.setAttribute('class', 'context-menu');
    menuDiv.oncontextmenu = function (e: MouseEvent) {
        removeMenu();
        e.preventDefault();
    }
    document.body.appendChild(menuDiv);

    if (contextMenuItems.length > 0) {
        let menuList = document.createElement('ul');
        menuDiv.appendChild(menuList);

        for (let i = 0; i < contextMenuItems.length; ++i) {
            let item: IContextMenuItem = contextMenuItems[i];
            let li = document.createElement('li');
            if (item.divider) {
                li.className += ' is-divider';
                li.innerHTML = '<hr>';
            } else {
                if (!item.title) {
                    console.error('No title attribute set. Check the spelling of your options.');
                }
                if (item.disabled) {
                    li.className += ' is-disabled';
                }
                if (!item.action && !item.submenu) {
                    li.className += ' is-header';
                }

                if (item.submenu) {
                    li.innerHTML = `<span><text>${item.title}</text>` +
                        '<text style="width: 5px; float: right; color: #000000A0">&#9658</text></span>'
                } else {
                    li.innerHTML = item.title;
                }

                li.onclick = function (d: any) {
                    if (item.disabled) return; // do nothing if disabled
                    if (!item.action) return; // headers have no "action"
                    item.action(li, data, i);
                    removeMenu();
                }

                li.onmouseenter = function () {
                    removeSubmenu(contextMenuItems);
                    if (item.submenu) {
                        let relativeRect = li.getBoundingClientRect();
                        let rect = {
                            top: relativeRect.top + window.scrollY,
                            bottom: relativeRect.bottom + window.scrollY,
                            left: relativeRect.left + window.scrollX,
                            right: relativeRect.right + window.scrollX,
                            height: relativeRect.height,
                            width: relativeRect.width
                        }
                        item.submenuDiv = createMenu(event, data, item.submenu, rect, propogateEvent);
                    }
                }
            }

            menuList.appendChild(li);
        }
        menuDiv.style.display = 'block';
        positionMenu(menuDiv, rect);

        if (!propogateEvent) {
            event.stopPropagation();
        }
    }
    return menuDiv;
}

function removeMenuItem(item: IContextMenuItem) {
    if (item.submenuDiv) {
        document.body.removeChild(item.submenuDiv);
        delete item.submenuDiv;
    }
    if (item.submenu) {
        removeSubmenu(item.submenu);
    }
}

function removeSubmenu(items: IContextMenuItem[]) {
    items.forEach(function (item: IContextMenuItem, index: number,
        items: IContextMenuItem[]) {
        removeMenuItem(item);
    });
}

function removeMenu() {
    removeSubmenu(lastMenu);

    let menus = document.getElementsByClassName('context-menu');
    while (menus.length) {
        document.body.removeChild(menus[0]);
    }
}

function keyupListener() {
    window.onkeyup = function (e) {
        if (e.keyCode === 27) {
            removeMenu();
        }
    }
}

let lastMenu: IContextMenuItem[] = [];
export function showContextMenu(event: MouseEvent, data: any, contextMenuItems: IContextMenuItem[],
    propogateEvent: boolean = false) {

    if (event) {
        keyupListener();
        removeMenu();

        lastMenu = contextMenuItems;
        createMenu(event, data, contextMenuItems, {
            left: event.pageX,
            top: event.pageY,
            right: event.pageX,
            bottom: event.pageY,
            height: 0,
            width: 0
        }, propogateEvent);
        event.preventDefault();
    }
}