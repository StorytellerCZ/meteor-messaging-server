import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { User } from 'meteor/socialize:user-model';
import { Conversation } from 'meteor/socialize:messaging';

export function messagingPublications() {
  const publicationOptionsSchema = new SimpleSchema({
    limit: {
      type: Number,
      optional: true,
    },
    skip: {
      type: Number,
      optional: true,
    },
    sort: {
      type: Number,
      optional: true,
    },
  });

  /**
   * Searches for users
   * @param {String} query
   * @param {Array} excluded
   * @returns {Mongo.Cursor}
   */
  Meteor.publish('pm.users.search', (query, excluded) => {
    check(query, String);
    check(excluded, [ String ]);
    return Meteor.users.find({
      username: { $regex: query, $options: 'i' },
      _id: { $nin: excluded } },
      { fields:
      { username: 1,
        roles: 1,
      },
        limit: 10,
      }
    );
  });

  /**
   * Gets the specified conversation with the last message
   * @param   {String}       conversationId        Id of the conversation requested
   * @returns {Mongo.Cursor}
   */
  Meteor.publishComposite('pm.conversation', function (conversationId) {
    check(conversationId, String);

    if (!this.userId) {
      return this.ready();
    }

    return {
      find() {
        return Meteor.conversations.find({ _id: conversationId }, { limit: 1 });
      },
      children: [
        {
          find(conversation) {
            return Meteor.participants.find({ conversationId: conversation._id, deleted: { $exists: false } });
          },
          children: [
            {
              find(participant) {
                return Meteor.users.find({ _id: participant.userId }, { fields: { username: true } });
              },
            },
          ],
        },
        {
          find(conversation) {
            return Meteor.messages.find({ conversationId: conversation._id }, { limit: 1, sort: { date: -1 } });
          },
        },
      ],
    };
  });

  /**
   * The following are publish options from the official package + fix for #8
   * These will be activated once the socialize package is updated to exclude these.
   * @param   {Object}       options        Query options {limit:Number, skip:Number}
   * @returns {Mongo.Cursor}
   */
  Meteor.publishComposite('pm.conversations', function (options) {
    if (!this.userId) {
      return this.ready();
    }

    options = options || {};

    options = _.pick(options, [ 'limit', 'skip' ]);

    check(options, publicationOptionsSchema);

    options.sort = { date: -1 };

    return {
      find() {
        return Meteor.participants.find({ userId: this.userId, deleted: { $exists: false } }, options);
      },
      children: [
        {
          find(participant) {
            return Meteor.conversations.find({ _id: participant.conversationId });
          },
          children: [
            {
              find(conversation) {
                return Meteor.participants.find({ conversationId: conversation._id, deleted: { $exists: false } });
              },
              children: [
                {
                  find(participant) {
                    return Meteor.users.find({ _id: participant.userId }, { fields: { username: true } });
                  },
                },
              ],
            },
            {
              find(conversation) {
                return Meteor.messages.find({ conversationId: conversation._id }, { limit: 1, sort: { date: -1 } });
              },
            },
          ],
        },
      ],
    };
  });

  /**
   * Publish conversations that have not been read yet by the user
   * @returns {Mongo.Cursor}
   */
  Meteor.publishComposite('pm.conversations.unread', function () {
    if (!this.userId) {
      return this.ready();
    }

    return {
      find() {
        return Meteor.participants.find({ userId: this.userId, deleted: { $exists: false }, read: false });
      },
      children: [
        {
          find(participant) {
            return Meteor.conversations.find({ _id: participant.conversationId });
          },
          children: [
            {
              find(conversation) {
                return Meteor.participants.find({ conversationId: conversation._id, deleted: { $exists: false } });
              },
              children: [
                {
                  find(participant) {
                    return Meteor.users.find({ _id: participant.userId }, { fields: { username: true } });
                  },
                },
              ],
            },
            {
              find(conversation) {
                return Meteor.messages.find({ conversationId: conversation._id }, { limit: 1, sort: { date: -1 } });
              },
            },
          ],
        },
      ],
    };
  });

  /**
  * Publish messages for a particular conversation
  * @param   {String}       conversationId The _id of the conversation to fetch messages for
  * @param   {Object}       options        Query options {limit:Number, skip:Number}
  * @returns {Mongo.Cursor} A cursor of messsages that belong to the current conversation
  */
  Meteor.publish('pm.messages.for', function (conversationId, options) {
    check(conversationId, String);

    const user = User.createEmpty(this.userId);

    options = options || {};

    check(options, publicationOptionsSchema);

    if (!this.userId) {
      return this.ready();
    }

    const conversation = Conversation.createEmpty(conversationId);

    if (user.isParticipatingIn(conversation)) {
      return conversation.messages(options.limit, options.skip, 'date', -1);
    }
  });
}

/**
 * ##############################################################################################
 * Methods
 */
export function messagingMethods() {
  Meteor.methods({
    /**
     * Counts the number of messages for the given conversation
     * @function pm.conversation.count
     * @param   {String}       conversationId The _id of the conversation count messages for
     */
    'pm.conversation.count': (conversationId) => {
      check(conversationId, String);
      // TODO improve count with natestrauser:publish-performant-counts ???
      return Meteor.messages.find({ conversationId }, { fields: { conversationId: 1 } }).count();
    },
    // TODO send message for those who want to use the server instead of client
  });
}

