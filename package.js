Package.describe({
  name: 'storyteller:messaging-server',
  version: '1.2.0',
  summary: 'Server functionality for socialize:messaging',
  git: 'https://github.com/StorytellerCZ/meteor-messaging-server',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['1.12', '2.3-beta.4']);
  api.use(['meteor', 'accounts-base', 'ecmascript', 'check']);
  api.use([
    'socialize:messaging@1.2.2',
    'socialize:user-model@1.0.4',
    'natestrauser:publish-performant-counts@0.1.2'
  ]);

  api.mainModule('messaging-server.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('storyteller:messaging-server');
  api.mainModule('messaging-server-tests.js');
});
