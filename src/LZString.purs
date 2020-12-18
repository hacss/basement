module LZString where

import Prelude
import Data.Maybe (Maybe(..))

foreign import compressToEncodedURIComponent :: String -> String
foreign import decompressFromEncodedURIComponentImpl :: forall a. (String -> a) -> (String -> a) -> String -> a

decompressFromEncodedURIComponent :: String -> Maybe String
decompressFromEncodedURIComponent = decompressFromEncodedURIComponentImpl (const Nothing) Just
