import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
// import { User } from 'meteor/socialize:user-model';
import {
  Conversation,
  ConversationsCollection,
  ParticipantsCollection,
  MessagesCollection
} from 'meteor/socialize:messaging';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { publishComposite } from 'meteor/reywood:publish-composite';

export function messagingPublications() {
  /**
   * Searches for users
   * @param {String} query
   * @param {Array} excluded
   * @returns {Mongo.Cursor}
   */
  Meteor.publish('pm.users.search', (query, excluded) => {
    check(query, String);
    check(excluded, [String]);
    return Meteor.users.find(
      {
        username: { $regex: query, $options: 'i' },
        _id: { $nin: excluded }
      },
      {
        fields: {
          username: 1,
          roles: 1
        },
        limit: 10
      }
    );
  });

  Meteor.publish('pm.conversation.count', conversationId => {
    check(conversationId, String);
    return new Counter('pmConvCount', MessagesCollection.find({ conversationId }));
  });

  Meteor.publish('pm.unreadConversations', () => {
    return new Counter(
      'pmUnreadCount',
      ParticipantsCollection.find({ userId: Meteor.userId(), deleted: { $exists: false }, read: false })
    );
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
    'pm.conversation.count': conversationId => {
      check(conversationId, String);
      return MessagesCollection.find(conversationId, { fields: { conversationId: 1 } }).count();
    },
    /**
     * Creates a new conversation between users or sends the message to the latest conversation between the users.
     * @function pm.conversation.new
     * @param to {[String]} Array of user ids of users to send message to.
     * @param message {String}
     * @returns {String} id of the conversation
     */
    'pm.conversation.new': (to, message) => {
      check(to, Array);
      check(message, String);

      const userId = Meteor.userId();
      if (!userId) {
        return;
      }

      // Add current user to the array of participants
      const participants = to.concat([userId]);

      // First check if a conversation already exists
      const existingConversation = ConversationsCollection.findOne({ _participants: { $all: participants } }, { fields: { _participants: 1 } });

      if (existingConversation) {
        // Add message to the latest conversation between these parties
        existingConversation.sendMessage(message);
        return existingConversation._id;
      } else {
        // create conversation
        const conversation = new Conversation().save();

        // add participants
        const participantsObjects = Meteor.users.find({ _id: { $in: participants}}).fetch();
        conversation.addParticipants(participantsObjects);

        // sanitize
        message = sanitize(message);
        // send the message
        conversation.sendMessage(message);
        return conversation._id;
      }
    }
  });
}
