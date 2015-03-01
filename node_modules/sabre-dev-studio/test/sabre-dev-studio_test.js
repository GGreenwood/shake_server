'use strict';

var SabreDevStudio = require('../lib/sabre-dev-studio.js');
var nock = require('nock');
nock.disableNetConnect();

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

module.exports = {
  setUp: function(callback) {
    this.sabre_dev_studio = new SabreDevStudio({
      client_id:     'V1:USER:GROUP:DOMAIN',
      client_secret: 'PASSWORD',
      uri:           'https://api.test.sabre.com'
    });
    callback();
  },
  tearDown: function(callback) {
    callback();
  },
  testConfiguration: function(test) {
    test.equal('V1:USER:GROUP:DOMAIN', this.sabre_dev_studio.config.client_id);
    test.done();
  },
  testBaseAPICallFetchesAccessToken: function(test) {
    var base_url = "https://api.test.sabre.com";
    var token = 'this_is_a_fake_token';
    var stub_request = nock(base_url)
        .post('/v1/auth/token', 'grant_type=client_credentials&client_id=VjE6VVNFUjpHUk9VUDpET01BSU4%3D&client_secret=UEFTU1dPUkQ%3D&code=')
        .reply(200, { access_token: token })
        ;
    var stub_request_get = nock(base_url)
        .get('/v1/shop/themes')
        .replyWithFile(200, __dirname + '/fixtures/air_shopping_themes.json')
        ;
    this.sabre_dev_studio.get('/v1/shop/themes', {}, function(error, data) {
      test.ok(data);
      test.done();
    });
    stub_request.isDone();
    stub_request_get.isDone();
    test.equal(this.access_token, this.sabre_dev_studio.access_token);
  }
}
