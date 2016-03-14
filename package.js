Package.describe({
  name: 'storyteller:messaging-server',
  version: '0.1.3',
  summary: 'Server functionality for socialize:messaging',
  git: 'https://github.com/StorytellerCZ/meteor-messaging-server',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['meteor', 'ecmascript', 'check']);

  api.use([
    'tmeasday:publish-with-relations@0.2.0', // TODO change for lepozepo:publish-with-relations
    'meteorhacks:unblock@1.1.0',
    'socialize:messaging@0.5.0',
    'aldeed:simple-schema@1.5.3'
  ]);

  api.addFiles(['messaging-server.js'], 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('storyteller:messaging-server');
  api.addFiles('messaging-server-tests.js');
});
