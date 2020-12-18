{ name = "basement"
, dependencies =
  [ "ace"
  , "argonaut"
  , "console"
  , "effect"
  , "hacss"
  , "halogen"
  , "html-parser-halogen"
  , "profunctor-lenses"
  , "psci-support"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
