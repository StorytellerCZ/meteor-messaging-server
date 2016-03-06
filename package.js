Package.describe({
  name: 'storyteller:messaging-server',
  version: '0.1.1',
  summary: 'Server functionality for socialize:messaging',
  git: 'https://github.com/StorytellerCZ/meteor-messaging-server',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('socialize:messaging@0.4.5')
  api.addFiles(['messaging-server.js'], 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('storyteller:messaging-server');
  api.addFiles('messaging-server-tests.js');
});
