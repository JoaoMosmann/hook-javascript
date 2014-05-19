asyncTest("Authentication: Github", function() {
  expect(3);

  client.auth.authenticate('github').then(function(userdata) {
    console.log("login successful", userdata);
    ok("hye");
  });
});

