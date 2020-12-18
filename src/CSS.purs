module Basement.CSS where

type CSS = String

foreign import prefix :: CSS -> CSS

type Scope = String

foreign import scope :: Scope -> CSS -> CSS
