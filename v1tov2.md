Changes from verison 1.x to version 2.x
=======================================

# Move to Peer Dependencies
In 1.x most external libraries were bundled with the ui-widget-toolkit in order to simplifiy installation and/orr sharing of the script without requiring multiple external dependencies.  With the shift to more modern compilation tools like webpack this has been become less of an issue so the toolkit now leverages peer dependencies to help reduce the size of the package.

# Hover vs Focus vs Select
------------------------
In version 1 hover was synonymous with focus in most, but not all cases.  With 2.x the goal was to be consistent across all of the widgets.  Each widget now supports 3 different common user interface concepts.

- Hover is when the user interacts with the system and moves the mouse over an item.
- Focus is when an item is highlighted temporarily to bring the users attention to an interaction.  It generally goes away with a mouse or touch action when the user continues to interact with a widget.
- Select is when an item is more permanently highlighted by the user and persists until it is removed programatically or by a specfic user action.

## Changes to existing APIs
To support the breaking up of these concepts the following changes have been made:

- New focus event types were added which map to hover event types.  Since these commonly are tied together focus events have the same enumeration value as hover events
- The programatic hover function has been deprecated in favor of a focus function for all widgets.

## Select functionality
**************************

- A new select event type has been added.  Each widget now supports a select function to allow widgets to programmatically select items in other widgets.
- The user can configure how items are affected by selection using CSS.  A selected item will ahve the `selected` class added to it.

# Simplifying Widget Behavior

In 1.x each widget passed whatever data it felt necesary on click or through context menu items.  To ensure a more consistent experience the behavior of existing widgets was normalized in the following ways:

## Events
- All click events will have both a `data` and a `selection` property.  
- `data` will be the original data used to create an item.
- `selection` will be the widgets best guess as to what other widgets might associate with that piece of data

## Context menu items
- each context menu item will pass back the original data used to create an item if applicable in the `data` parameter



