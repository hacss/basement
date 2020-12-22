{ name = "basement"
, dependencies =
  [ "ace"
  , "argonaut"
  , "console"
  , "effect"
  , "hacss"
  , "halogen"
  , "html-parser-halogen"
  , "js-timers"
  , "profunctor-lenses"
  , "psci-support"
  , "refs"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
