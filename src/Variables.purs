module Basement.Variables where

import Prelude
import Data.Lens ((%~))
import Data.Lens.Lens.Tuple (_1)
import Data.Newtype (un)
import Data.Profunctor (dimap)
import Data.Tuple (Tuple)
import Hacss (Variable(..))
import Halogen (Component)
import Halogen (Slot) as H
import Halogen.Component.Profunctor (ProComponent(..))
import Halogen.HTML (HTML)
import Basement.KeyValue as KeyValue

type Model = Array (Tuple Variable String)

type Slot q = H.Slot q Model

component :: forall q m. Functor q => Component HTML q Model Model m
component =
  un ProComponent
    $ dimap
      (map $ _1 %~ un Variable)
      (map $ _1 %~ Variable)
      $ ProComponent KeyValue.component
