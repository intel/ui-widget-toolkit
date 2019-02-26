Unit tests are in the src directory and require webpack since we most of
the source code is written in typescript.  Webpack will take the typescript
modules and include them into the .spec files so we can actually run
the tests via Jasmine.

Also you need to unzip the data.zip file in the spec/data directory for the tests to run.
