let upstream =
      https://github.com/purescript/package-sets/releases/download/psc-0.13.8-20201125/packages.dhall sha256:ef58d9afae22d1bc9d83db8c72d0a4eca30ce052ab49bbc44ced2da0bc5cad1a

in  upstream
  with hacss =
      { dependencies =
          [ "effect"
          , "foreign-object"
          , "generics-rep"
          , "newtype"
          , "nullable"
          , "profunctor-lenses"
          , "string-parsers"
          ]
      , repo =
          "https://github.com/hacss/core.git"
      , version =
          "v4.0.3"
      }
