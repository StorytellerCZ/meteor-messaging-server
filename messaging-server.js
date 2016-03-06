/**
 * Searches for users
 */
Meteor.publish("searchForUsers", function(query, excluded){
  check(query, String)
  check(excluded, Array)
  return Meteor.users.find({username: {$regex: query, $options: 'i'}, _id: {$nin: excluded}}, {fields: {username: 1, roles: 1},limit: 10})
})

/**
 * Gets the specified conversation
 * NOTE: Is not full conversation with all the function
 */
Meteor.publish("conversation", function(conversationId){
  check(conversationId, String)

  if(!this.userId){
    return this.ready()
  }

  //return Meteor.conversations.find({_id: conversationId, deleted: {$exists:false}}, {limit: 1})

  Meteor.publishWithRelations({
      handle: this,
      collection: Meteor.participants,
      options:options,
      filter: {conversationId: conversationId, deleted:{$exists:false}},
      mappings: [{
          key: 'conversationId',
          collection: Meteor.conversations,
          mappings:[{
              key: "conversationId",
              collection: Meteor.participants,
              filter: {userId:{$ne:this.userId}},
              reverse:true,
              mappings:[{
                  key:"userId",
                  collection:Meteor.users,
                  options:{fields:{username:true}}
              }]
          },{
              reverse:true,
              key: "conversationId",
              collection: Meteor.messages,
              options:{limit:1, sort:{date:-1}}
          }]
      }]
  })
})

/**
 * Count all messages in the given conversation
 */
Meteor.methods({
  countMessages:function(conversationId){
    check(conversationId, String)

    return Meteor.messages.find({conversationId: conversationId}, {fields: {conversationId: 1}}).count()
  }
});

/**
 * The following are publish options from the official package + fix for #8
 * These will be activated once the socialize package is updated to exclude these.
 */
 /*
Meteor.publish("conversations", function (options) {
   this.unblock();
   var currentUser;

   if(!this.userId){
       return this.ready();
   }

   options = options || {};

   options = _.pick(options, ["limit", "skip"]);

   options.sort = {date:-1};

   Meteor.publishWithRelations({
       handle: this,
       collection: Meteor.participants,
       options:options,
       filter: {userId:this.userId, deleted:{$exists:false}},
       mappings: [{
           key: 'conversationId',
           collection: Meteor.conversations,
           mappings:[{
               key: "conversationId",
               collection: Meteor.participants,
               filter: {userId:{$ne:this.userId}},
               reverse:true,
               mappings:[{
                   key:"userId",
                   collection:Meteor.users,
                   options:{fields:{username:true, avatarId:true}}
               }]
           },{
               reverse:true,
               key: "conversationId",
               collection: Meteor.messages,
               options:{limit:1, sort:{date:-1}}
           }]
       }]
   });

});
*/
/**
* Publish conversations that have not been read yet by the user
*/
/*
Meteor.publish("unreadConversations", function(){

   if(!this.userId){
       return this.ready();
   }

   Meteor.publishWithRelations({
       handle: this,
       collection: Meteor.participants,
       filter: {userId:this.userId, deleted:{$exists:false}, read:false},
       mappings: [{
           key: 'conversationId',
           collection: Meteor.conversations,
           mappings:[{
               key: "conversationId",
               collection: Meteor.participants,
               reverse:true,
               options:{limit:1, sort:{date:-1}},
               mappings:[{
                   key:"userId",
                   collection:Meteor.users,
                   options:{fields:{username:true, avatarId:true}}
               }]
           },{
               key: "conversationId",
               collection: Meteor.messages,
               options:{limit:1, sort:{date:-1}}
           }]
       }]
   });
});
*/

/**
* Publish messages for a particular conversation
* @param   {String}       conversationId The _id of the conversation to fetch messages for
* @param   {Object}       options        Query options {limit:Number, skip:Number}
* @returns {Mongo.Cursor} A cursor of messsages that belong to the current conversation
*/
/*
Meteor.publish("messagesFor", function(conversationId, options){
   var self = this;
   var user = User.createEmpty(self.userId);

   options = options || {};

   self.unblock();

   if(!self.userId){
       return this.ready();
   }

   var conversation = Conversation.createEmpty(conversationId);

   if(user.isParticipatingIn(conversation)){
       return conversation.messages(options.limit, options.skip, "date", -1);
   }
});
*/

/**
* This publication when subscribed to, updates the state of the participant
* to keep track of the last message read by the user and whether they are viewing
* it at this current moment. When the publication stops it updates the participant
* to indicate they are no longer viewing the conversation
*
* @param   {String}       conversationId The _id of the conversation the user is viewing
*/
/*
Meteor.publish("viewingConversation", function(conversationId){
   this.unblock();

   if(!this.userId){
       return this.ready();
   }

   var self = this;
   var sessionId = this._session.id;


   ParticipantsCollection.update({
       conversationId:conversationId, userId:self.userId
   },{
       $addToSet:{observing:sessionId},
       $set:{read:true},
   });

   self.onStop(function () {
       ParticipantsCollection.update({conversationId:conversationId, userId:self.userId}, {$pull:{observing:sessionId}});
   });

   this.ready();
});
*/

/**
* This publication when subscribed to sets the typing state of a participant in a conversation to true. When stopped it sets it to false.
* @param   {String}   conversationId The _id of the conversation
*/
/*
Meteor.publish("typing", function(conversationId){
   this.unblock();

   if(!this.userId){
       return this.ready();
   }

   var self = this;

   ParticipantsCollection.update({
       conversationId:conversationId, userId:self.userId
   },{
       $set:{typing:true}
   });

   self.onStop(function () {
       ParticipantsCollection.update({conversationId:conversationId, userId:self.userId}, {$set:{typing:false}});
   });

   this.ready();
});
*/
