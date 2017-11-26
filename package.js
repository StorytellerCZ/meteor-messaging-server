Package.describe({
  name: 'storyteller:messaging-server',
  version: '1.0.0-alpha.1',
  summary: 'Server functionality for socialize:messaging',
  git: 'https://github.com/StorytellerCZ/meteor-messaging-server',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');
  api.use(['meteor', 'accounts-base', 'ecmascript', 'check']);
  Npm.depends({'simpl-schema': '1.1.0'});
  api.use([
    'reywood:publish-composite@1.5.2',
    'socialize:messaging@1.0.0',
    'socialize:user-model@1.0.0'
  ]);

  api.mainModule('messaging-server.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('storyteller:messaging-server');
  api.mainModule('messaging-server-tests.js');
});
