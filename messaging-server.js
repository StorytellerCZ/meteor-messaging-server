let publicationOptionsSchema = new SimpleSchema({
  limit:{
    type: Number,
    optional: true
  },
  skip:{
    type: Number,
    optional: true
  },
  sort:{
    type: Number,
    optional: true
  }
})

/**
 * Searches for users
 */
Meteor.publish("searchForUsers", function(query, excluded){
  check(query, String)
  check(excluded, [String])
  return Meteor.users.find({username: {$regex: query, $options: 'i'}, _id: {$nin: excluded}}, {fields: {username: 1, roles: 1},limit: 10})
})

/**
 * Gets the specified conversation
 */
Meteor.publish("conversation", function(conversationId){
  check(conversationId, String)

  let options = {}

  if(!this.userId){
    return this.ready()
  }

  Meteor.publishWithRelations({
      handle: this,
      collection: Meteor.participants,
      options: options,
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
Meteor.publish("conversations", function (options) {
   this.unblock()
   let currentUser

   if(!this.userId){
       return this.ready()
   }

   options = options || {}

   options = _.pick(options, ["limit", "skip"])

   check(options, publicationOptionsSchema)

   options.sort = {date:-1}

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

})

/**
* Publish conversations that have not been read yet by the user
*/
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
   })
})

/**
* Publish messages for a particular conversation
* @param   {String}       conversationId The _id of the conversation to fetch messages for
* @param   {Object}       options        Query options {limit:Number, skip:Number}
* @returns {Mongo.Cursor} A cursor of messsages that belong to the current conversation
*/
Meteor.publish("messagesFor", function(conversationId, options){
  check(conversationId, String)

  let user = User.createEmpty(this.userId)

  options = options || {}

  check(options, publicationOptionsSchema)

  this.unblock()

  if(!this.userId){
    return this.ready()
  }

  let conversation = Conversation.createEmpty(conversationId)

  if(user.isParticipatingIn(conversation)){
    return conversation.messages(options.limit, options.skip, "date", -1)
  }
})
