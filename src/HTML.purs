module Basement.HTML where
  
import Prelude
import Halogen (ClassName(..))
import Halogen.HTML.Properties (IProp, class_)

styles :: forall a b. String -> IProp (class :: String | b) a
styles = class_ <<< ClassName
