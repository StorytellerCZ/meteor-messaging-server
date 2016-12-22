# storyteller:messaging-server

Server functionality for `socialize:messaging` that adds publishes and some functionality which you can use on the client.

## How to use

On your server import and call the following to your methods and publications:

```javascript
import { messagingPublications } from 'meteor/storyteller:messaging-server';
messagingPublications();

import { messagingPublications } from 'meteor/storyteller:messaging-server';
messagingPublications();
```

## Publications

### `pm.users.search`

**Params:**
* query {String} - Search query, usually part of a user's username
* excluded {Array} - Array of ids of users that should be excluded from the search

Returns search results of a query against the users collection.

### `pm.conversation`

**Params:**
* conversationId {String} - id of the requested conversation

Will return conversation with the info on participants and last message.

### `pm.conversations`

**Params:**
* options {Object} - object containing `limit` and `skip` properties

Return conversations that the user is a participant in.

### `pm.conversations.unread`

Returns all the conversations that the user has some unread messages in.

### `pm.messages.for`

**Params:**
* conversationId {String} - conversation id
* options {object} - object containing `limit` and `skip` properties

Get messages in the given range for the given conversation.

## Methods

### `pm.conversation.count`

**Params:**
* conversationId {String} - id of the conversation

Counts total number of messages in a given conversation.