module Basement.Main where

import Prelude
import Control.Coroutine (consumer)
import Data.Maybe (Maybe(..))
import Data.Nullable (null)
import Data.String (drop) as S
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Class (liftEffect)
import Effect.Exception (throw)
import Foreign (unsafeToForeign)
import Hacss (CSS)
import Halogen (tell)
import Halogen.Aff (awaitBody, runHalogenAff)
import Halogen.VDom.Driver (runUI)
import Web.DOM.Document (createElement)
import Web.DOM.Element (toNode) as Element
import Web.DOM.Node (appendChild, setTextContent)
import Web.HTML (window)
import Web.HTML.History (DocumentTitle(..), URL(..), replaceState)
import Web.HTML.HTMLDocument (head, toDocument)
import Web.HTML.HTMLElement (toNode) as HTMLElement
import Web.HTML.Location (hash)
import Web.HTML.Window (document, history, location)
import Basement.App as App

main :: Effect Unit
main = do
  updateStyleSheet <- initStyle
  state <- S.drop 1 <$> (hash =<< location =<< window)
  runHalogenAff do
    body <- awaitBody
    { subscribe, query } <- runUI App.component state body
    subscribe $ consumer \(Tuple css urlEncodedState) -> liftEffect do
                                               updateStyleSheet css
                                               window >>= history >>= replaceState (unsafeToForeign null) (DocumentTitle "") (URL ("#" <> urlEncodedState))
                                               pure Nothing
    query (tell App.Publish)

initStyle :: Effect (CSS -> Effect Unit)
initStyle = do
  doc <- document =<< window
  maybeHead <- head doc
  case maybeHead of
    Just h -> do
      style <- toDocument doc # createElement "style"
      styleNode <- appendChild (Element.toNode style) (HTMLElement.toNode h)
      pure $ flip setTextContent styleNode
    Nothing ->
      throw "Could not locate the head element of the HTML document."
