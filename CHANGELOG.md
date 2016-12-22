# CHANGELOG

## v0.2.0 - 2016/12/21

### New

*   Readme

### Breaking

*   All publishes and methods have been renamed, refer to readme.

### Updates

*   Dependency updates
*   ES2015
*   Update Meteor version to 1.4
*   Changed tmeasday:publish-with-relations to reywood:publish-composite@1.4.2


### Removed

*   meteorhacks:unblock

## v0.1.5 - 2016/3/16

### Updates

*   Dependency updates

## v0.1.4 - 2016/3/14

### Fixes

*   Removed duplicate publications that remained in `socialize:messaging`.
*   Added `socialize:user-model` to fix an issue with undefined `User` in `messagesFor` publication.

## v0.1.3 - 2016/3/14

## Added

*   Publications that were removed from socialize packages

## Fixes

*   Added checks

## v0.1.2 - 2016/3/07

## Changes

*   Updated publish for "conversation" to include all the necessary connections for full use.

## v0.1.1 - 2016/3/06

### New

*   Added changelog

### Fixes

*   Properly set files to be on server.

## v0.1.0 - 2016/3/05

Initial move of server code into an independent package.
